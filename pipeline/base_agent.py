import json
import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv
import httpx
from openai import APIStatusError, AsyncOpenAI

from pipeline.rate_limiter import throttle

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

OPENROUTER_TO_GEMINI = {
    "google/gemini-2.5-flash": "gemini-2.5-flash",
    "google/gemini-2.5-flash-lite-preview-06-17": "gemini-2.5-flash-lite",
}


def _openrouter_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not set in .env")
    return AsyncOpenAI(api_key=api_key, base_url=OPENROUTER_BASE_URL)


def safe_parse_json(raw: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    return json.loads(cleaned)


def _gemini_api_key() -> str | None:
    return os.getenv("GEMINI_API") or os.getenv("GEMINI_API_KEY")


def _to_gemini_model(model: str) -> str:
    return OPENROUTER_TO_GEMINI.get(model, model.replace("google/", ""))


def _extract_gemini_text(body: dict) -> str:
    candidates = body.get("candidates") or []
    parts: list[str] = []
    for candidate in candidates:
        content = candidate.get("content") or {}
        for part in content.get("parts") or []:
            text = part.get("text")
            if isinstance(text, str):
                parts.append(text)
    if not parts:
        raise RuntimeError(f"Gemini response did not contain text content: {body}")
    return "".join(parts)


async def _call_openrouter_once(
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int,
) -> tuple[str, float]:
    await throttle(model)
    start = time.time()
    response = await _openrouter_client().chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    elapsed = round(time.time() - start, 2)
    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("OpenRouter response did not contain text content")
    return content, elapsed


async def _call_gemini_once(
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int,
) -> tuple[str, float]:
    api_key = _gemini_api_key()
    if not api_key:
        raise RuntimeError("GEMINI_API or GEMINI_API_KEY is not set in .env")

    gemini_model = _to_gemini_model(model)
    await throttle(model)
    start = time.time()
    url = f"{GEMINI_BASE_URL}/{gemini_model}:generateContent"
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": max_tokens,
            "responseMimeType": "application/json",
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }
    async with httpx.AsyncClient(timeout=180) as client:
        response = await client.post(url, params={"key": api_key}, json=payload)
    if response.status_code >= 400:
        raise RuntimeError(f"Gemini API error {response.status_code}: {response.text[:1000]}")
    elapsed = round(time.time() - start, 2)
    return _extract_gemini_text(response.json()), elapsed


def _apply_token_cap(max_tokens: int, provider: str) -> int:
    if provider in {"gemini", "hybrid"}:
        raw_cap = os.getenv("GEMINI_MAX_TOKENS_CAP") or os.getenv("MAX_TOKENS_CAP")
    else:
        raw_cap = os.getenv("OPENROUTER_MAX_TOKENS_CAP") or os.getenv("MAX_TOKENS_CAP")
    if not raw_cap:
        return max_tokens
    try:
        cap = int(raw_cap)
    except ValueError as exc:
        raise RuntimeError(f"Invalid OPENROUTER_MAX_TOKENS_CAP value: {raw_cap}") from exc
    if cap <= 0:
        raise RuntimeError("OPENROUTER_MAX_TOKENS_CAP must be greater than zero")
    return min(max_tokens, cap)


def _affordable_token_limit(exc: APIStatusError) -> int | None:
    message = str(exc)
    match = re.search(r"can only afford\s+(\d+)", message, flags=re.IGNORECASE)
    if not match:
        return None
    affordable = int(match.group(1))
    return max(128, affordable - 32)


async def call_llm(
    model: str,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 4000,
) -> tuple[str, float, str]:
    provider = os.getenv("PROVIDER", "gemini").strip().lower()
    effective_max_tokens = _apply_token_cap(max_tokens, provider)
    if provider in {"gemini", "hybrid"} and _gemini_api_key():
        try:
            content, elapsed = await _call_gemini_once(model, system_prompt, user_prompt, effective_max_tokens)
            return content, elapsed, f"{_to_gemini_model(model)} via Gemini API"
        except Exception as exc:
            if "429" not in str(exc) and provider == "gemini":
                raise
            if provider == "gemini":
                raise

    try:
        content, elapsed = await _call_openrouter_once(model, system_prompt, user_prompt, effective_max_tokens)
        return content, elapsed, model
    except APIStatusError as exc:
        if exc.status_code == 402:
            affordable_limit = _affordable_token_limit(exc)
            if affordable_limit and affordable_limit < effective_max_tokens:
                content, elapsed = await _call_openrouter_once(
                    model,
                    system_prompt,
                    user_prompt,
                    affordable_limit,
                )
                return content, elapsed, f"{model} (reduced to {affordable_limit} max tokens)"
            raise RuntimeError(
                "OpenRouter reports insufficient credits for this request. "
                "Set OPENROUTER_MAX_TOKENS_CAP=512 in .env or add credits."
            ) from exc
        if exc.status_code not in {429, 503}:
            raise
        fallback_model = os.getenv("FALLBACK_MODEL", "openai/gpt-4o-mini").strip()
        content, elapsed = await _call_openrouter_once(fallback_model, system_prompt, user_prompt, effective_max_tokens)
        return content, elapsed, fallback_model

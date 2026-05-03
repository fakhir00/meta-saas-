import json
import os
import re
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from agents.rate_limiter import record_and_check

ROOT_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT_DIR / '.env'

load_dotenv(ENV_PATH)
STATE_DIR = ROOT_DIR / 'state'


AGENT_REASONING_STEPS = {
    'requirement_agent': [
        "Deconstructing core business idea...",
        "Analyzing target audience demographics...",
        "Identifying primary pain points...",
        "Mapping monetization strategies...",
        "Defining product goals and success metrics...",
        "Drafting comprehensive requirements document..."
    ],
    'prompt_agent': [
        "Analyzing requirement document...",
        "Selecting optimal technology stack...",
        "Designing system architecture...",
        "Planning deployment infrastructure...",
        "Mapping project directory structure...",
        "Finalizing architectural blueprint..."
    ],
    'feature_agent': [
        "Reviewing build specification...",
        "Decomposing product into feature sets...",
        "Generating detailed user stories...",
        "Estimating implementation tasks...",
        "Grouping features for MVP launch...",
        "Structuring feature roadmap..."
    ],
    'api_agent': [
        "Analyzing feature requirements...",
        "Designing RESTful endpoint structure...",
        "Defining request and response schemas...",
        "Mapping data flow and logic...",
        "Generating OpenAPI/Swagger definitions...",
        "Validating API contracts..."
    ],
    'db_agent': [
        "Reviewing entity relationships...",
        "Designing normalized table structures...",
        "Defining primary and foreign keys...",
        "Setting up data constraints and indexes...",
        "Generating DDL SQL schema...",
        "Optimizing database performance layers..."
    ],
    'ui_agent': [
        "Analyzing feature and API specs...",
        "Designing user flow and navigation...",
        "Defining page component hierarchy...",
        "Mapping UI states and data sources...",
        "Drafting visual page specifications...",
        "Polishing user experience flows..."
    ]
}

def _set_activity(agent_name: str, activity: str):
    activity_path = STATE_DIR / f"{agent_name}_activity.txt"
    try:
        activity_path.write_text(activity, encoding='utf-8')
    except:
        pass

def _simulate_reasoning(agent_name: str, stop_event: threading.Event):
    import random
    steps = AGENT_REASONING_STEPS.get(agent_name, ["Thinking...", "Processing...", "Analyzing..."])
    i = 0
    while not stop_event.is_set():
        _set_activity(agent_name, steps[i % len(steps)])
        i += 1
        # Random sleep to feel more "human"
        for _ in range(random.randint(30, 60)):
            if stop_event.is_set(): break
            time.sleep(0.1)

def _strip_json_fences(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith('```'):
        stripped = re.sub(r'^```(?:json)?\s*', '', stripped)
        stripped = re.sub(r'\s*```$', '', stripped)
    return stripped.strip()


def _extract_text(response: Any) -> str:
    text = getattr(response, 'text', None)
    if text:
        return text

    candidates = getattr(response, 'candidates', []) or []
    parts: list[str] = []
    for candidate in candidates:
        content = getattr(candidate, 'content', None)
        for part in getattr(content, 'parts', []) or []:
            part_text = getattr(part, 'text', None)
            if part_text:
                parts.append(part_text)
    if parts:
        return ''.join(parts)
    raise RuntimeError('Model response did not contain any text content')


def _call_gemini(model: str, prompt: str, max_tokens: int) -> str:
    import google.generativeai as genai

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise RuntimeError('GEMINI_API_KEY is not set')

    genai.configure(api_key=api_key)
    record_and_check(model)
    client = genai.GenerativeModel(model_name=model)
    response = client.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            response_mime_type='application/json',
            max_output_tokens=max_tokens,
            temperature=0.2,
        ),
    )
    return _extract_text(response)


def _extract_openrouter_text(body: dict[str, Any]) -> str:
    choices = body.get('choices') or []
    if not choices:
        raise RuntimeError('OpenRouter response did not contain choices')

    message = choices[0].get('message') or {}
    content = message.get('content')
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict) and isinstance(item.get('text'), str):
                parts.append(item['text'])
        if parts:
            return ''.join(parts)
    raise RuntimeError('OpenRouter response did not contain text content')


def _resolve_openrouter_model(model: str) -> str:
    explicit_model = os.getenv('OPENROUTER_MODEL')
    if explicit_model:
        return explicit_model

    mapping = {
        'gemini-2.5-flash': os.getenv('OPENROUTER_MODEL_FLASH', 'google/gemini-2.5-flash'),
        'gemini-2.5-flash-lite': os.getenv('OPENROUTER_MODEL_FLASH_LITE', 'google/gemini-2.5-flash-lite'),
    }
    return mapping.get(model, model)


def _call_openrouter(model: str, prompt: str, max_tokens: int) -> str:
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        raise RuntimeError('OPENROUTER_API_KEY is not set')

    record_and_check(model)
    openrouter_model = _resolve_openrouter_model(model)
    payload = json.dumps(
        {
            'model': openrouter_model,
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': max_tokens,
            'temperature': 0.2,
            'response_format': {'type': 'json_object'},
        }
    ).encode('utf-8')
    request = urllib.request.Request(
        os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1/chat/completions'),
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'HTTP-Referer': os.getenv('OPENROUTER_HTTP_REFERER', 'https://local.saas-builder'),
            'X-Title': os.getenv('OPENROUTER_APP_NAME', 'SaaS Builder'),
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            body = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'OpenRouter API error {exc.code}: {error_body}') from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f'OpenRouter API request failed: {exc}') from exc

    return _extract_openrouter_text(body)

def _call_local(prompt: str, max_tokens: int) -> str:
    model_name = os.getenv('OLLAMA_MODEL', 'llama3.2')
    payload = json.dumps(
        {
            'model': model_name,
            'prompt': prompt,
            'stream': False,
            'format': 'json',
            'options': {'num_predict': max_tokens},
        }
    ).encode('utf-8')
    request = urllib.request.Request(
        'http://127.0.0.1:11434/api/generate',
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            body = json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as exc:
        raise RuntimeError(f'Local Ollama call failed: {exc}') from exc

    text = body.get('response')
    if not text:
        raise RuntimeError('Local Ollama response did not contain a response field')
    return text


def _apply_token_cap(provider: str, max_tokens: int) -> int:
    provider_key = f'{provider.upper()}_MAX_TOKENS_CAP'
    raw_cap = os.getenv(provider_key) or os.getenv('MAX_TOKENS_CAP')
    if not raw_cap:
        return max_tokens
    try:
        cap = int(raw_cap)
    except ValueError as exc:
        raise RuntimeError(f'Invalid {provider_key} value: {raw_cap}') from exc
    if cap <= 0:
        raise RuntimeError(f'{provider_key} must be greater than zero')
    return min(max_tokens, cap)

def _call_groq(model: str, prompt: str, max_tokens: int) -> str:
    api_key = os.getenv('GROQ_API_KEY') or os.getenv('GROQ_API')
    if not api_key:
        raise RuntimeError('Missing GROQ_API_KEY environment variable')
    
    payload = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': max_tokens,
        'temperature': 0.1,
        'response_format': {'type': 'json_object'}
    }).encode('utf-8')
    
    request = urllib.request.Request(
        'https://api.groq.com/openai/v1/chat/completions',
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        },
        method='POST'
    )
    
    with urllib.request.urlopen(request, timeout=60) as response:
        body = json.loads(response.read().decode('utf-8'))
        return body['choices'][0]['message']['content']


def _call_mistral(model: str, prompt: str, max_tokens: int) -> str:
    api_key = os.getenv('MISTRAL_API_KEY') or os.getenv('MISTRALAI_API')
    if not api_key:
        raise RuntimeError('Missing MISTRAL_API_KEY environment variable')
    
    payload = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': max_tokens,
        'temperature': 0.1,
        'response_format': {'type': 'json_object'}
    }).encode('utf-8')
    
    request = urllib.request.Request(
        'https://api.mistral.ai/v1/chat/completions',
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        },
        method='POST'
    )
    
    with urllib.request.urlopen(request, timeout=60) as response:
        body = json.loads(response.read().decode('utf-8'))
        return body['choices'][0]['message']['content']


def call(model_str: str, prompt: str, max_tokens: int) -> dict[str, Any]:
    # Support "provider/model" format or default to Gemini
    if '/' in model_str:
        provider, model = model_str.split('/', 1)
    else:
        provider, model = 'gemini', model_str

    fallback_strategy = os.getenv('FALLBACK_MODEL', 'gemini').strip().lower()
    parse_error: str | None = None
    rate_limited = False
    
    agent_name = os.environ.get('AGENT_NAME', 'agent')
    stop_event = threading.Event()
    reasoning_thread = threading.Thread(target=_simulate_reasoning, args=(agent_name, stop_event), daemon=True)
    reasoning_thread.start()

    try:
        for attempt in range(3):
            full_prompt = prompt
            if parse_error:
                full_prompt += (
                    '\n\nYour previous response was not valid JSON. '
                    f'JSON parse error: {parse_error}\n'
                    'Return ONLY valid JSON with no markdown fences or commentary.'
                )
            
            raw_text = None
            last_exception = None
            
            try:
                # Route to correct provider
                agent_name = os.environ.get('AGENT_NAME', 'agent')
                if provider == 'groq':
                    msg = f"Calling Groq ({model})..."
                    print(f"--- {msg} [Attempt {attempt+1}/3] ---")
                    _set_activity(agent_name, msg)
                    raw_text = _call_groq(model, full_prompt, _apply_token_cap('groq', max_tokens))
                elif provider == 'mistral':
                    msg = f"Calling Mistral ({model})..."
                    print(f"--- {msg} [Attempt {attempt+1}/3] ---")
                    _set_activity(agent_name, msg)
                    raw_text = _call_mistral(model, full_prompt, _apply_token_cap('mistral', max_tokens))
                elif provider == 'openrouter':
                    msg = f"Calling OpenRouter ({model})..."
                    print(f"--- {msg} [Attempt {attempt+1}/3] ---")
                    _set_activity(agent_name, msg)
                    raw_text = _call_openrouter(model, full_prompt, _apply_token_cap('openrouter', max_tokens))
                elif provider == 'local':
                    msg = f"Calling Local (Ollama: {model})..."
                    print(f"--- {msg} [Attempt {attempt+1}/3] ---")
                    _set_activity(agent_name, msg)
                    raw_text = _call_local(full_prompt, _apply_token_cap('local', max_tokens))
                else:
                    msg = f"Calling Gemini ({model})..."
                    print(f"--- {msg} [Attempt {attempt+1}/3] ---")
                    _set_activity(agent_name, msg)
                    raw_text = _call_gemini(model, full_prompt, _apply_token_cap('gemini', max_tokens))
                    
            except Exception as exc:
                print(f"Primary call ({provider}) failed: {exc}")
                last_exception = exc
                
                # Universal fallback to Local (Ollama) if primary fails and fallback enabled
                if fallback_strategy == 'local' and provider != 'local':
                    try:
                        msg = "Falling back to Local (Ollama)..."
                        print(f"--- {msg} [Attempt {attempt+1}/3] ---")
                        _set_activity(agent_name, msg)
                        raw_text = _call_local(full_prompt, _apply_token_cap('local', max_tokens))
                        last_exception = None
                    except Exception as local_exc:
                        print(f"Local fallback failed: {local_exc}")
                        last_exception = local_exc

            if last_exception:
                message = str(last_exception)
                if '429' in message and not rate_limited:
                    print("Rate limited. Waiting 65 seconds...")
                    time.sleep(65)
                    rate_limited = True
                    continue
                raise RuntimeError(f'LLM call failed: {message}') from last_exception

            if not raw_text:
                raise RuntimeError('LLM returned empty response')
            
            print("LLM call successful.")

            cleaned = _strip_json_fences(raw_text)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError as exc:
                parse_error = str(exc)
                if attempt == 2:
                    raise RuntimeError(f'Failed to parse model response as JSON: {exc}') from exc

    finally:
        stop_event.set()
        reasoning_thread.join(timeout=0.1)

    raise RuntimeError('LLM call failed after retries exhausted')

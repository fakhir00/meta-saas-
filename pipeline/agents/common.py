import json
import os
from pathlib import Path
from typing import Callable

from pipeline.base_agent import call_llm, safe_parse_json

ROOT_DIR = Path(__file__).resolve().parents[2]
PROMPT_DIR = ROOT_DIR / "prompts"


class AgentRunError(RuntimeError):
    pass


def load_prompt(agent_name: str) -> str:
    return (PROMPT_DIR / f"{agent_name}.md").read_text(encoding="utf-8")


def json_prompt(payload: dict, human_instruction: str | None = None, retry_error: str | None = None) -> str:
    prompt = (
        "Return compact minified JSON only. Use the minimum valid number of items. "
        "Keep every string short.\nINPUT:"
        + json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    )
    if human_instruction:
        prompt += (
            "\n\nHUMAN EDIT INSTRUCTION:\n"
            f"{human_instruction}\n"
            "Apply this change before proceeding."
        )
    if retry_error:
        prompt += (
            "\n\nPREVIOUS ATTEMPT FAILED:\n"
            f"{retry_error[:400]}\n"
            "Please fix these issues and try again. Return much shorter MINIFIED JSON. "
            "Use exactly the minimum valid counts required by the schema."
        )
    return prompt


def _build_mock_schema_sql(entity_model: list[dict]) -> str:
    if not entity_model:
        return (
            "create table accounts (id uuid primary key, email text not null unique, created_at timestamptz not null default now());"
            "create table projects (id uuid primary key, account_id uuid not null references accounts(id),"
            "name text not null,status text not null default 'draft',created_at timestamptz not null default now());"
            "create table plans (id serial primary key, code text not null unique, monthly_price_cents integer not null,"
            "created_at timestamptz not null default now());"
        )

    ddl_parts: list[str] = []
    for entity in entity_model:
        table = str(entity.get("entity") or "items").strip().lower().replace(" ", "_")
        if not table:
            table = "items"
        fields = entity.get("fields") or []
        sql_fields = ["id uuid primary key"]
        for field in fields[:8]:
            name = str(field.get("name") or "field").strip().lower().replace(" ", "_")
            if not name or name == "id":
                continue
            field_type = str(field.get("type") or "text").lower()
            mapped = "text"
            if "int" in field_type or "number" in field_type:
                mapped = "integer"
            elif "bool" in field_type:
                mapped = "boolean"
            elif "timestamp" in field_type or "date" in field_type:
                mapped = "timestamptz"
            sql_fields.append(f"{name} {mapped}")
        sql_fields.append("created_at timestamptz not null default now()")
        ddl_parts.append(f"create table {table} ({', '.join(sql_fields)});")

    ddl_parts.append(
        "create table plan_tiers (id serial primary key, tier_code text not null unique, monthly_price_cents integer not null, created_at timestamptz not null default now());"
    )
    return "".join(ddl_parts)


def _mock_output(agent_name: str, payload: dict) -> dict:
    if agent_name == "requirement_agent":
        idea = payload.get("idea_text") or "AI startup assistant"
        audience = payload.get("audience") or "Small teams"
        return {
            "product_title": "MetaBox Project",
            "business_intent": {"value": f"Turn {idea} into a launch-ready SaaS plan."},
            "saas_type": "Workflow SaaS",
            "user_personas": [
                {"name": "Maya, founder", "description": f"Wants clarity for {audience}."},
                {"name": "Leo, operator", "description": "Needs repeatable launch steps."},
            ],
            "core_features": [
                {"name": "Capture ideas", "priority": "must_have", "description": "Describe product goals quickly."},
                {"name": "Plan roadmap", "priority": "should_have", "description": "Prioritize launch work by impact."},
                {"name": "Share results", "priority": "nice_to_have", "description": "Send a clear summary link."},
            ],
            "monetization": {"model": "Subscription", "tiers": ["Starter", "Founder", "Studio"]},
        }

    if agent_name == "prompt_agent":
        return {
            "feature_tree": [
                {"name": "Idea intake", "acceptance_criteria": ["Collect idea, audience, and budget"]},
                {"name": "Guided planning", "acceptance_criteria": ["Generate roadmap and architecture summary"]},
                {"name": "Results sharing", "acceptance_criteria": ["Provide read-only public share page"]},
            ],
            "entity_model": [
                {"entity": "boxes", "fields": [{"name": "title", "type": "text"}, {"name": "status", "type": "text"}]},
                {"entity": "stages", "fields": [{"name": "stage_name", "type": "text"}, {"name": "status", "type": "text"}]},
            ],
            "api_surface": [
                {"method": "POST", "path": "/api/boxes", "description": "Create a new box"},
                {"method": "POST", "path": "/api/pipeline/run", "description": "Run the box pipeline"},
                {"method": "GET", "path": "/api/boxes/:id", "description": "Read box results"},
            ],
            "tech_stack": {
                "frontend": "Next.js",
                "backend": "Server routes",
                "database": "Supabase Postgres",
                "auth": "Supabase Auth",
            },
            "deployment_config": {
                "frontend_hosting": "Vercel",
                "backend_hosting": "Render",
                "database": "Supabase (PostgreSQL)",
                "phase_1_cost": "$0/month",
            },
        }

    if agent_name == "feature_agent":
        feature_tree = payload.get("feature_tree") or []
        expanded = []
        for item in feature_tree[:5]:
            name = item.get("name") or "Feature"
            expanded.append(
                {
                    "name": name,
                    "subtasks": [
                        {"title": f"Define {name}", "layer": "product", "hours": 4, "dependencies": []},
                        {"title": f"Build {name}", "layer": "app", "hours": 8, "dependencies": [f"Define {name}"]},
                    ],
                }
            )
        return {"expanded_features": expanded or [{"name": "Core flow", "subtasks": [{"title": "Build core flow", "layer": "app", "hours": 8, "dependencies": []}]}]}

    if agent_name == "api_agent":
        api_surface = payload.get("api_surface") or []
        endpoints = []
        for item in api_surface[:8]:
            endpoints.append(
                {
                    "method": item.get("method") or "GET",
                    "path": item.get("path") or "/api/items",
                    "description": item.get("description") or "List items",
                    "request": {"type": "object"},
                    "response": {"type": "object"},
                }
            )
        return {"endpoints": endpoints or [{"method": "GET", "path": "/api/health", "description": "Health check", "request": {}, "response": {"ok": True}}]}

    if agent_name == "db_agent":
        entity_model = payload.get("entity_model") or []
        return {"sql": _build_mock_schema_sql(entity_model)}

    if agent_name == "ui_agent":
        feature_tree = payload.get("feature_tree") or []
        pages = [
            {
                "name": "Dashboard",
                "purpose": "Show progress and results",
                "components": ["Status cards", "Progress timeline", "Action buttons"],
                "data_sources": ["boxes", "stages"],
            },
            {
                "name": "Results",
                "purpose": "Present deliverables clearly",
                "components": ["Overview cards", "Feature board", "Export button"],
                "data_sources": ["build_spec", "features", "api_spec"],
            },
        ]
        if feature_tree:
            pages.append(
                {
                    "name": "Launch Wizard",
                    "purpose": "Collect user inputs",
                    "components": ["Idea textarea", "Audience radio", "Budget options"],
                    "data_sources": ["profiles"],
                }
            )
        return {"pages": pages}

    raise AgentRunError(f"Unsupported mock agent: {agent_name}")


async def run_json_agent(
    agent_name: str,
    model: str,
    payload: dict,
    validator: Callable[[dict], list[str]],
    max_tokens: int,
    max_retries: int,
    human_instruction: str | None = None,
) -> tuple[dict, dict]:
    system_prompt = load_prompt(agent_name)

    if os.getenv("FALLBACK_MODEL", "gemini").strip().lower() == "mock":
        parsed = _mock_output(agent_name, payload)
        errors = validator(parsed)
        if errors:
            raise AgentRunError("\n".join(errors))
        return parsed, {
            "elapsed": 0.01,
            "model": "mock",
            "attempt": 1,
            "input_payload": payload,
            "system_prompt": system_prompt,
            "user_prompt": "mock-mode",
            "raw_response": json.dumps(parsed, ensure_ascii=False),
            "validated_output": parsed,
            "human_instruction": human_instruction,
        }

    last_error: str | None = None
    attempts = max_retries + 1

    for attempt in range(1, attempts + 1):
        user_prompt = json_prompt(payload, human_instruction, last_error)
        raw, elapsed, model_used = await call_llm(model, system_prompt, user_prompt, max_tokens)
        try:
            parsed = safe_parse_json(raw)
        except Exception as exc:
            last_error = f"JSON parse failed: {exc}"
            if attempt == attempts:
                raise AgentRunError(last_error) from exc
            continue

        errors = validator(parsed)
        if not errors:
            return parsed, {
                "elapsed": elapsed,
                "model": model_used,
                "attempt": attempt,
                "input_payload": payload,
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "raw_response": raw,
                "validated_output": parsed,
                "human_instruction": human_instruction,
            }

        last_error = "\n".join(errors)
        if attempt == attempts:
            raise AgentRunError(last_error)

    raise AgentRunError(last_error or "Agent failed")

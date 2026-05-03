from pipeline.agents.common import run_json_agent
from pipeline.validators import validate_db_output

MODEL = "google/gemini-2.5-flash-lite-preview-06-17"


async def run(build_spec: dict, human_instruction: str | None = None) -> tuple[dict, dict]:
    deployment = build_spec.get("deployment_config") or {}
    payload = {
        "entity_model": build_spec.get("entity_model"),
        "database": deployment.get("database"),
    }
    return await run_json_agent(
        "db_agent",
        MODEL,
        payload,
        validate_db_output,
        max_tokens=3000,
        max_retries=1,
        human_instruction=human_instruction,
    )


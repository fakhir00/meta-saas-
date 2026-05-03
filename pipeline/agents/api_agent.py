from pipeline.agents.common import run_json_agent
from pipeline.validators import validate_api_output

MODEL = "google/gemini-2.5-flash-lite-preview-06-17"


async def run(build_spec: dict, human_instruction: str | None = None) -> tuple[dict, dict]:
    payload = {
        "api_surface": build_spec.get("api_surface"),
        "entity_model": build_spec.get("entity_model"),
    }
    return await run_json_agent(
        "api_agent",
        MODEL,
        payload,
        validate_api_output,
        max_tokens=4000,
        max_retries=1,
        human_instruction=human_instruction,
    )


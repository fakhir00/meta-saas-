from pipeline.agents.common import run_json_agent
from pipeline.validators import validate_feature_output

MODEL = "google/gemini-2.5-flash-lite-preview-06-17"


async def run(build_spec: dict, human_instruction: str | None = None) -> tuple[dict, dict]:
    payload = {
        "feature_tree": build_spec.get("feature_tree"),
        "tech_stack": build_spec.get("tech_stack"),
    }
    return await run_json_agent(
        "feature_agent",
        MODEL,
        payload,
        validate_feature_output,
        max_tokens=4000,
        max_retries=1,
        human_instruction=human_instruction,
    )


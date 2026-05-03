from pipeline.agents.common import run_json_agent
from pipeline.validators import validate_ui_output

MODEL = "google/gemini-2.5-flash-lite-preview-06-17"


async def run(
    build_spec: dict,
    features: dict,
    human_instruction: str | None = None,
) -> tuple[dict, dict]:
    payload = {
        "feature_tree": build_spec.get("feature_tree"),
        "api_surface": build_spec.get("api_surface"),
        "expanded_features_summary": features.get("expanded_features"),
    }
    return await run_json_agent(
        "ui_agent",
        MODEL,
        payload,
        validate_ui_output,
        max_tokens=4000,
        max_retries=1,
        human_instruction=human_instruction,
    )


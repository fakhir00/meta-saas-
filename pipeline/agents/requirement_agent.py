from pipeline.agents.common import run_json_agent
from pipeline.validators import validate_requirement_output

MODEL = "google/gemini-2.5-flash"


async def run(intake: dict, human_instruction: str | None = None) -> tuple[dict, dict]:
    payload = {
        "idea_text": intake.get("idea_text"),
        "audience": intake.get("audience"),
        "budget_range": intake.get("budget_range"),
    }
    return await run_json_agent(
        "requirement_agent",
        MODEL,
        payload,
        validate_requirement_output,
        max_tokens=3000,
        max_retries=2,
        human_instruction=human_instruction,
    )


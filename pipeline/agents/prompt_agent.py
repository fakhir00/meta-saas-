from pipeline.agents.common import run_json_agent
from pipeline.validators import validate_prompt_output

MODEL = "google/gemini-2.5-flash"


def _compact_requirements(req_doc: dict) -> dict:
    return {
        "product_title": req_doc.get("product_title"),
        "business_intent": req_doc.get("business_intent", {}).get("value"),
        "saas_type": req_doc.get("saas_type"),
        "user_personas": [
            {
                "name": item.get("name"),
                "description": item.get("description"),
            }
            for item in req_doc.get("user_personas", [])[:3]
        ],
        "core_features": [
            {
                "name": item.get("name"),
                "priority": item.get("priority"),
                "description": item.get("description"),
            }
            for item in req_doc.get("core_features", [])[:5]
        ],
        "monetization": req_doc.get("monetization"),
    }


async def run(req_doc: dict, human_instruction: str | None = None) -> tuple[dict, dict]:
    return await run_json_agent(
        "prompt_agent",
        MODEL,
        {"requirements": _compact_requirements(req_doc)},
        validate_prompt_output,
        max_tokens=6000,
        max_retries=2,
        human_instruction=human_instruction,
    )

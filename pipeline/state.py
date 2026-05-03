from copy import deepcopy
from typing import Any


DEFAULT_STATE: dict[str, Any] = {
    "intake": {
        "idea_text": None,
        "audience": None,
        "budget_range": None,
    },
    "stages": {
        "req_doc": None,
        "build_spec": None,
        "features": None,
        "api_spec": None,
        "schema_sql": None,
        "ui_spec": None,
    },
    "stage_meta": {},
    "human_edits": [],
    "pipeline_status": "idle",
    "pending_instruction": None,
    "intake_step": "idea",
}


def fresh_state() -> dict[str, Any]:
    return deepcopy(DEFAULT_STATE)


from typing import Literal

from pydantic import BaseModel, Field


class PipelineStep(BaseModel):
    name: str
    parallel_group: int
    input_files: list[str] = Field(default_factory=list)
    output_file: str
    max_retries: int


class StepStatus(BaseModel):
    status: Literal['pending', 'running', 'done', 'failed'] = 'pending'
    attempts: int = 0
    error: str | None = None
    current_activity: str | None = None


class PipelineStatus(BaseModel):
    steps: dict[str, StepStatus] = Field(default_factory=dict)

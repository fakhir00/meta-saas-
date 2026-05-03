# AGENTS.md

This file is the persistent working context for any LLM or coding agent making changes in this repository.

## Project Identity

`saas-builder` is a local Python CLI tool that takes a one-sentence business idea and produces a complete, implementation-ready SaaS specification across six output files in `state/`.

This project generates specifications only. It does not generate runnable SaaS application code, and it is not a web app.

## What This Tool Produces

Successful runs write these files:

- `state/req_doc.json`
- `state/build_spec.json`
- `state/features.json`
- `state/api_spec.json`
- `state/schema.sql`
- `state/ui_spec.json`

Other runtime artifacts:

- `state/idea.txt`
- `state/pipeline_status.json`
- `state/rate_limit_state.json`
- `state/*_error_hint.txt`

## Core Architecture

### 1. Orchestrator

File: `orchestrator.py`

The orchestrator is a static DAG runner.

It must:

- never call any LLM directly
- run each agent as a subprocess
- enforce input/output file dependencies
- persist step status in `state/pipeline_status.json`
- support:
  - `--idea`
  - `--resume`
  - `--dry-run`
  - `--clean`

The pipeline order is hardcoded in the `PIPELINE` constant. Do not replace it with dynamic routing.

### 2. Agents

Folder: `agents/`

There are six pipeline agents:

1. `requirement_agent`
2. `prompt_agent`
3. `feature_agent`
4. `api_agent`
5. `db_agent`
6. `ui_agent`

Each agent:

- is a standalone subprocess entrypoint in `agents/<agent_name>/run.py`
- reads only the scoped fields it needs from prior outputs
- reads `state/<agent_name>_error_hint.txt` if present
- writes exactly one output file to `state/`
- exits with `0` on success and `1` on failure

Each agent’s behavior contract is primarily defined by:

- its `run.py`
- its `prompt.md`

### 3. Shared LLM Caller

File: `agents/base_agent.py`

This is the only place where provider calls should happen.

It currently supports:

- `FALLBACK_MODEL=gemini`
- `FALLBACK_MODEL=openrouter`
- `FALLBACK_MODEL=local`

Responsibilities:

- load `.env`
- call the selected provider
- run rate limiting before remote calls
- strip markdown fences
- parse JSON
- retry on JSON parse failure
- retry once on 429s

Do not move provider logic into `orchestrator.py` or the individual agent files.

### 4. Validation

Files:

- `validator/validate.py`
- `schemas/*.schema.json`

Validation is structural, not score-based.

Use these rules:

- `requirement_agent` -> `validate_req_doc`
- `prompt_agent` -> `validate_against_schema(..., "build_spec")`
- `feature_agent` -> `expanded_features` must exist and be non-empty
- `api_agent` -> `endpoints` must exist and be non-empty
- `db_agent` -> `validate_sql`
- `ui_agent` -> `pages` must exist and be non-empty

## Important Constraints

These are hard rules. Do not quietly drift from them.

- CLI only. No Flask, FastAPI, Chainlit, Streamlit, or other UI/server layer.
- `orchestrator.py` is the only pipeline entry point.
- No `run_pipeline.py`.
- No `orchestrator_config.md`.
- No LLM routing brain.
- No `blueprint_modules_selected` field.
- No `completeness_score` logic.
- No billing code or Stripe integration in this repository.
- No hardcoded admin passwords anywhere.
- `db_agent` may include only plan/tier seed rows, not admin user credentials.
- Default generated deployment guidance must stay Supabase + Vercel + Render unless the idea explicitly calls for AWS, GCP, or Azure.
- Never default generated deployment configs to ECS Fargate or RDS.

## Provider Notes

### Gemini

Internal model names used by the pipeline:

- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`

### OpenRouter

OpenRouter support has been added as a first-class provider path in `agents/base_agent.py`.

Supported env vars:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_MODEL_FLASH`
- `OPENROUTER_MODEL_FLASH_LITE`
- `OPENROUTER_MAX_TOKENS_CAP`

OpenRouter observations from actual testing in this repo:

- auth and basic structured JSON calls work
- some free-router model selections can be inconsistent for structured agent outputs
- pinning a specific OpenRouter model is more reliable than using `openrouter/free`
- a tested working model for this repo was:
  - `inclusionai/ling-2.6-flash-20260421:free`

If token-credit limits appear, reduce output token ceilings through:

- `OPENROUTER_MAX_TOKENS_CAP`

### Local / Ollama

`FALLBACK_MODEL=local` is supported through a simple HTTP call to Ollama.

## Windows Note

The original spec used `fcntl` for the rate limiter, which is Unix-oriented. This repo includes a Windows-safe fallback lock path in `agents/rate_limiter.py` so local execution works on Windows too.

Do not remove that fallback unless the project explicitly drops Windows support.

## Safe Change Policy

When making changes:

1. Prefer updating the smallest possible surface area.
2. Preserve the current pipeline contract and file names.
3. Do not expand scope into “Phase 2” ideas unless explicitly asked.
4. Keep output schemas backward compatible unless the user requests a schema change.
5. If changing provider logic, keep the agent/orchestrator boundary intact.
6. If changing prompts, preserve strict JSON-only output requirements.

## Recommended Verification

Before concluding work on meaningful changes, try to run as many of these as are relevant:

```bash
python -m py_compile orchestrator.py agents\__init__.py agents\base_agent.py agents\models.py agents\rate_limiter.py agents\requirement_agent\run.py agents\prompt_agent\run.py agents\feature_agent\run.py agents\api_agent\run.py agents\db_agent\run.py agents\ui_agent\run.py validator\__init__.py validator\validate.py
python orchestrator.py --dry-run --idea "Test idea"
python orchestrator.py --idea "Test idea"
```

For OpenRouter testing on this machine, this configuration has already succeeded:

```powershell
$env:FALLBACK_MODEL='openrouter'
$env:OPENROUTER_MODEL='inclusionai/ling-2.6-flash-20260421:free'
$env:OPENROUTER_MAX_TOKENS_CAP='4000'
python orchestrator.py --idea "A SaaS for barbershops to manage appointments, staff schedules, and customer reminders"
```

## Files to Read First

If you are a future agent entering this repo cold, read these first:

1. `AGENTS.md`
2. `README.md`
3. `orchestrator.py`
4. `agents/base_agent.py`
5. `validator/validate.py`

Then inspect the specific agent folder you need to modify.

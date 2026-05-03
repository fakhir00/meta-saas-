# SaaS Builder

SaaS Builder is a local CLI that takes a one-sentence business idea and produces six implementation-ready specification files. It generates specs only; it does not generate or run application code.

## Quickstart

1. Clone and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd saas-builder
   pip install -r requirements.txt
   ```
2. Create `.env` and set your provider key:
   ```bash
   copy .env.example .env
   ```
   Then either:
   - set `GEMINI_API_KEY` and keep `FALLBACK_MODEL=gemini`, or
   - set `OPENROUTER_API_KEY` and change `FALLBACK_MODEL=openrouter`.
3. Run the pipeline:
   ```bash
   python orchestrator.py --idea "An AI assistant for dental clinics to manage patient follow-ups"
   ```
4. Find outputs in `state/`.

## Output Files

After a successful run, `state/` will contain:

- `idea.txt`
- `req_doc.json`
- `build_spec.json`
- `features.json`
- `api_spec.json`
- `schema.sql`
- `ui_spec.json`
- `pipeline_status.json`

## Example

Example idea:

```bash
python orchestrator.py --idea "A SaaS platform for independent fitness coaches to manage programs, client check-ins, and subscription plans"
```

Expected output file list:

- `state/req_doc.json`
- `state/build_spec.json`
- `state/features.json`
- `state/api_spec.json`
- `state/schema.sql`
- `state/ui_spec.json`

## Useful Flags

- Fresh run: `python orchestrator.py --idea "your idea here"`
- Resume failed run: `python orchestrator.py --resume`
- Dry run plan: `python orchestrator.py --dry-run --idea "your idea here"`
- Clean state: `python orchestrator.py --clean`

## OpenRouter Notes

When using OpenRouter, the pipeline keeps the same internal model split and maps them to:

- `gemini-2.5-flash` -> `google/gemini-2.5-flash`
- `gemini-2.5-flash-lite` -> `google/gemini-2.5-flash-lite`

You can override those defaults with:

- `OPENROUTER_MODEL`
- `OPENROUTER_MODEL_FLASH`
- `OPENROUTER_MODEL_FLASH_LITE`

If your OpenRouter account has a lower token budget, you can cap output tokens with:

- `OPENROUTER_MAX_TOKENS_CAP=4000`

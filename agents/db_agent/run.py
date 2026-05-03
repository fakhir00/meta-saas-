import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from agents.base_agent import call

AGENT_NAME = 'db_agent'
MODEL = 'groq/llama-3.1-8b-instant'
MAX_TOKENS = 3000


def main() -> int:
    state_dir = ROOT_DIR / 'state'
    input_path = state_dir / 'build_spec.json'
    prompt_path = Path(__file__).with_name('prompt.md')
    output_path = state_dir / 'schema.sql'

    if not input_path.exists():
        raise RuntimeError('Missing input file: state/build_spec.json')

    build_spec = json.loads(input_path.read_text(encoding='utf-8'))
    scoped_input = {
        'entity_model': build_spec.get('entity_model', []),
        'database_config': build_spec.get('database_config', {}),
    }
    base_prompt = (
        prompt_path.read_text(encoding='utf-8').strip()
        + '\n\nSCOPED INPUT:\n'
        + json.dumps(scoped_input, indent=2)
    )

    hint_file = Path(f'state/{AGENT_NAME}_error_hint.txt')
    extra_context = ''
    if hint_file.exists():
        extra_context = f'\n\nPREVIOUS ATTEMPT FAILED:\n{hint_file.read_text()[:400]}'
        hint_file.unlink()
    prompt = base_prompt + extra_context

    result = call(MODEL, prompt, MAX_TOKENS)
    sql_text = result.get('sql')
    if not isinstance(sql_text, str) or not sql_text.strip():
        raise RuntimeError('db_agent response missing non-empty sql field')
    output_path.write_text(sql_text.strip() + '\n', encoding='utf-8')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)

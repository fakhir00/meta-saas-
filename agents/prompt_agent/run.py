import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from agents.base_agent import call

AGENT_NAME = 'prompt_agent'
MODEL = 'groq/llama-3.1-70b-versatile'
MAX_TOKENS = 8000


def main() -> int:
    state_dir = ROOT_DIR / 'state'
    input_path = state_dir / 'req_doc.json'
    prompt_path = Path(__file__).with_name('prompt.md')
    output_path = state_dir / 'build_spec.json'

    if not input_path.exists():
        raise RuntimeError('Missing input file: state/req_doc.json')

    base_prompt = (
        prompt_path.read_text(encoding='utf-8').strip()
        + '\n\nREQUIREMENTS DOCUMENT:\n'
        + input_path.read_text(encoding='utf-8').strip()
    )

    hint_file = Path(f'state/{AGENT_NAME}_error_hint.txt')
    extra_context = ''
    if hint_file.exists():
        extra_context = f'\n\nPREVIOUS ATTEMPT FAILED:\n{hint_file.read_text()[:400]}'
        hint_file.unlink()
    prompt = base_prompt + extra_context

    result = call(MODEL, prompt, MAX_TOKENS)
    output_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)

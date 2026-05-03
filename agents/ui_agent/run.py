import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from agents.base_agent import call

AGENT_NAME = 'ui_agent'
MODEL = 'groq/llama-3.1-70b-versatile'
MAX_TOKENS = 4000


def main() -> int:
    state_dir = ROOT_DIR / 'state'
    build_spec_path = state_dir / 'build_spec.json'
    features_path = state_dir / 'features.json'
    api_spec_path = state_dir / 'api_spec.json'
    prompt_path = Path(__file__).with_name('prompt.md')
    output_path = state_dir / 'ui_spec.json'

    for file_path in (build_spec_path, features_path, api_spec_path):
        if not file_path.exists():
            raise RuntimeError(f'Missing input file: {file_path.relative_to(ROOT_DIR).as_posix()}')

    build_spec = json.loads(build_spec_path.read_text(encoding='utf-8'))
    features = json.loads(features_path.read_text(encoding='utf-8'))
    api_spec = json.loads(api_spec_path.read_text(encoding='utf-8'))

    feature_summary = [
        {
            'feature_name': feature.get('feature_name'),
            'goal': feature.get('goal'),
        }
        for feature in features.get('expanded_features', [])
    ]
    api_routes = [
        {
            'name': endpoint.get('name'),
            'method': endpoint.get('method'),
            'path': endpoint.get('path'),
        }
        for endpoint in api_spec.get('endpoints', [])
    ]
    scoped_input = {
        'ui_expectations': build_spec.get('ui_expectations', {}),
        'feature_summary': feature_summary,
        'api_routes': api_routes,
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
    output_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)

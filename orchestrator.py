import argparse
import json
import os
import shutil
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Callable

from agents.models import PipelineStatus, StepStatus
from validator.validate import validate_against_schema, validate_req_doc, validate_sql

ROOT_DIR = Path(__file__).resolve().parent
STATE_DIR = ROOT_DIR / 'state'
STATUS_PATH = STATE_DIR / 'pipeline_status.json'
STATUS_LOCK = threading.Lock()

PIPELINE = [
    {'name': 'requirement_agent', 'parallel_group': 1, 'max_retries': 2,
     'inputs': ['state/idea.txt'], 'output': 'state/req_doc.json'},
    {'name': 'prompt_agent',      'parallel_group': 2, 'max_retries': 2,
     'inputs': ['state/req_doc.json'], 'output': 'state/build_spec.json'},
    {'name': 'feature_agent',     'parallel_group': 3, 'max_retries': 1,
     'inputs': ['state/build_spec.json'], 'output': 'state/features.json'},
    {'name': 'api_agent',         'parallel_group': 3, 'max_retries': 1,
     'inputs': ['state/build_spec.json'], 'output': 'state/api_spec.json'},
    {'name': 'db_agent',          'parallel_group': 3, 'max_retries': 1,
     'inputs': ['state/build_spec.json'], 'output': 'state/schema.sql'},
    {'name': 'ui_agent',          'parallel_group': 4, 'max_retries': 1,
     'inputs': ['state/build_spec.json', 'state/features.json', 'state/api_spec.json'],
     'output': 'state/ui_spec.json'},
]


def _group_pipeline() -> dict[int, list[dict]]:
    groups: dict[int, list[dict]] = {}
    for step in PIPELINE:
        groups.setdefault(step['parallel_group'], []).append(step)
    return dict(sorted(groups.items()))


def _fresh_status() -> PipelineStatus:
    return PipelineStatus(
        steps={step['name']: StepStatus() for step in PIPELINE}
    )


def load_status() -> PipelineStatus:
    if not STATUS_PATH.exists():
        return _fresh_status()
    return PipelineStatus.model_validate_json(STATUS_PATH.read_text(encoding='utf-8'))


def save_status(status: PipelineStatus) -> None:
    with STATUS_LOCK:
        STATE_DIR.mkdir(exist_ok=True)
        STATUS_PATH.write_text(status.model_dump_json(indent=2), encoding='utf-8')


def reset_run_artifacts() -> None:
    STATE_DIR.mkdir(exist_ok=True)
    for relative_path in [
        'req_doc.json',
        'build_spec.json',
        'features.json',
        'api_spec.json',
        'schema.sql',
        'ui_spec.json',
        'pipeline_status.json',
        'requirement_agent_error_hint.txt',
        'prompt_agent_error_hint.txt',
        'feature_agent_error_hint.txt',
        'api_agent_error_hint.txt',
        'db_agent_error_hint.txt',
        'ui_agent_error_hint.txt',
    ]:
        target = STATE_DIR / relative_path
        if target.exists():
            target.unlink()


def validate_feature_output(data: dict) -> list[str]:
    items = data.get('expanded_features')
    if not isinstance(items, list) or not items:
        return ['expanded_features array missing or empty']
    return []


def validate_api_output(data: dict) -> list[str]:
    items = data.get('endpoints')
    if not isinstance(items, list) or not items:
        return ['endpoints array missing or empty']
    return []


def validate_ui_output(data: dict) -> list[str]:
    items = data.get('pages')
    if not isinstance(items, list) or not items:
        return ['pages array missing or empty']
    return []


def get_validation_errors(step_name: str, output_path: Path) -> list[str]:
    if step_name == 'db_agent':
        return validate_sql(output_path.read_text(encoding='utf-8'))

    data = json.loads(output_path.read_text(encoding='utf-8'))
    validators: dict[str, Callable[[dict], list[str]]] = {
        'requirement_agent': validate_req_doc,
        'prompt_agent': lambda item: validate_against_schema(item, 'build_spec'),
        'feature_agent': validate_feature_output,
        'api_agent': validate_api_output,
        'ui_agent': validate_ui_output,
    }
    return validators[step_name](data)


def run_step(step: dict, status: PipelineStatus) -> None:
    step_name = step['name']
    status.steps.setdefault(step_name, StepStatus())
    output_path = ROOT_DIR / step['output']
    hint_path = STATE_DIR / f'{step_name}_error_hint.txt'

    for input_file in step['inputs']:
        input_path = ROOT_DIR / input_file
        if not input_path.exists():
            raise RuntimeError(f'{step_name} missing required input: {input_file}')

    max_attempts = step['max_retries'] + 1
    last_error = 'Unknown error'

    for attempt in range(1, max_attempts + 1):
        with STATUS_LOCK:
            step_status = status.steps[step_name]
            step_status.status = 'running'
            step_status.attempts = attempt
            step_status.error = None
        save_status(status)

        if output_path.exists():
            output_path.unlink()

        env = os.environ.copy()
        env['AGENT_NAME'] = step_name
        
        process = subprocess.Popen(
            [sys.executable, str(ROOT_DIR / 'agents' / step_name / 'run.py')],
            cwd=ROOT_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )

        # Poll for activity during execution
        while process.poll() is None:
            activity_path = STATE_DIR / f"{step_name}_activity.txt"
            if activity_path.exists():
                try:
                    activity = activity_path.read_text(encoding='utf-8').strip()
                    with STATUS_LOCK:
                        step_status.current_activity = activity
                    save_status(status)
                except:
                    pass
            time.sleep(2)

        stdout, stderr = process.communicate()
        stdout = stdout.strip()
        stderr = stderr.strip()

        if process.returncode != 0:
            last_error = stderr or stdout or f'{step_name} failed with exit code {process.returncode}'
        elif not output_path.exists():
            last_error = f'{step_name} did not create expected output: {step["output"]}'
        else:
            validation_errors = get_validation_errors(step_name, output_path)
            if not validation_errors:
                with STATUS_LOCK:
                    step_status.status = 'done'
                    step_status.error = None
                save_status(status)
                if hint_path.exists():
                    hint_path.unlink()
                return
            last_error = '\n'.join(validation_errors)

        hint_path.write_text(last_error[:4000], encoding='utf-8')
        with STATUS_LOCK:
            step_status.status = 'failed'
            step_status.error = last_error
        save_status(status)
        time.sleep(1)

        if attempt == max_attempts:
            raise RuntimeError(last_error)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='SaaS Builder CLI')
    parser.add_argument('--idea', help='Business idea for a fresh run')
    parser.add_argument('--resume', action='store_true', help='Resume the last failed run')
    parser.add_argument('--dry-run', action='store_true', help='Print pipeline plan without running agents')
    parser.add_argument('--clean', action='store_true', help='Delete state/ and reset the pipeline')
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.clean:
        if STATE_DIR.exists():
            shutil.rmtree(STATE_DIR)
        return 0

    if args.resume and args.idea:
        raise RuntimeError('Use either --idea for a fresh run or --resume to continue, not both')

    if not args.resume and not args.idea:
        raise RuntimeError('Provide --idea for a fresh run, or use --resume')

    STATE_DIR.mkdir(exist_ok=True)

    if args.idea:
        reset_run_artifacts()
        (STATE_DIR / 'idea.txt').write_text(args.idea.strip(), encoding='utf-8')
        status = _fresh_status()
        save_status(status)
    else:
        status = load_status()

    if args.dry_run:
        for step in PIPELINE:
            print(
                f"{step['name']}: group={step['parallel_group']} "
                f"inputs={step['inputs']} output={step['output']}"
            )
        return 0

    for _, group_steps in _group_pipeline().items():
        pending_steps = [
            step for step in group_steps
            if status.steps.get(step['name'], StepStatus()).status != 'done'
        ]
        if not pending_steps:
            continue

        if len(pending_steps) == 1:
            run_step(pending_steps[0], status)
            continue

        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = {executor.submit(run_step, step, status): step for step in pending_steps}
            for future in as_completed(futures):
                step = futures[future]
                try:
                    future.result()
                except Exception as exc:
                    for other_future in futures:
                        if other_future is not future:
                            other_future.cancel()
                    print(f"{step['name']} failed: {exc}", file=sys.stderr)
                    print('Run `python orchestrator.py --resume` to continue after fixing the issue.', file=sys.stderr)
                    return 1

    print('Pipeline completed successfully.')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        print('Run `python orchestrator.py --resume` to continue after fixing the issue.', file=sys.stderr)
        sys.exit(1)

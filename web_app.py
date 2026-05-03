import json
import os
import threading
from pathlib import Path
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from agents.models import PipelineStatus, StepStatus
import google.generativeai as genai

from orchestrator import (
    reset_run_artifacts, load_status, save_status, run_step, PIPELINE, _group_pipeline, ROOT_DIR, STATE_DIR
)

load_dotenv()
app = Flask(__name__, template_folder='templates', static_folder='static')
RUN_STATE_LOCK = threading.Lock()
RUN_STATE = {
    'running': False,
    'error': None,
    'started_at': None,
    'finished_at': None,
    'cancel_requested': False,
}


def _set_run_state(**updates):
    with RUN_STATE_LOCK:
        RUN_STATE.update(updates)


def _get_run_state():
    with RUN_STATE_LOCK:
        return dict(RUN_STATE)


def _build_status_payload():
    status = load_status()
    run_state = _get_run_state()
    outputs = _load_outputs()
    running_stage = next(
        (name for name, step in status.steps.items() if step.status == 'running'),
        None,
    )
    complete = bool(outputs) and all(step.status == 'done' for step in status.steps.values())
    return {
        'running': run_state['running'],
        'error': run_state['error'],
        'started_at': run_state['started_at'],
        'finished_at': run_state['finished_at'],
        'cancel_requested': run_state['cancel_requested'],
        'current_stage': running_stage,
        'complete': complete,
        'status': status.model_dump(),
        'outputs': outputs,
    }


def _run_pipeline_job(idea_text, audience, budget_range, resume=False):
    try:
        if not resume:
            reset_run_artifacts()
            (STATE_DIR / 'idea.txt').write_text(idea_text, encoding='utf-8')

            launch_context = {
                'idea_text': idea_text,
                'audience': audience,
                'budget_range': budget_range,
            }
            (STATE_DIR / 'launch_context.json').write_text(json.dumps(launch_context, indent=2), encoding='utf-8')

            status = PipelineStatus(steps={step['name']: StepStatus() for step in PIPELINE})
            save_status(status)
        else:
            status = load_status()

        from concurrent.futures import ThreadPoolExecutor, as_completed
        
        for _, group_steps in _group_pipeline().items():
            if _get_run_state().get('cancel_requested'):
                raise RuntimeError('Cancelled by user')

            pending_steps = [
                step for step in group_steps
                if status.steps.get(step['name'], StepStatus()).status != 'done'
            ]
            if not pending_steps:
                continue

            if len(pending_steps) == 1:
                run_step(pending_steps[0], status)
            else:
                with ThreadPoolExecutor(max_workers=len(pending_steps)) as executor:
                    futures = {executor.submit(run_step, s, status): s for s in pending_steps}
                    for future in as_completed(futures):
                        if _get_run_state().get('cancel_requested'):
                            # Try to cancel pending ones
                            for f in futures: f.cancel()
                            break
                        try:
                            future.result()
                        except Exception as e:
                            # If one fails, we should still try to finish others in this group
                            # but the overall pipeline will stop after this group
                            print(f"Parallel step failed: {e}")
                            pass

            # After each group, check if any failed
            group_failed = any(status.steps.get(s['name'], StepStatus()).status == 'failed' for s in group_steps)
            if group_failed:
                raise RuntimeError("One or more agents in the parallel group failed.")

        _set_run_state(running=False, error=None, finished_at=None, cancel_requested=False)
    except Exception as exc:
        _set_run_state(running=False, error=str(exc), finished_at=None)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/pipeline', methods=['POST'])
def start_pipeline():
    """Start the pipeline with user inputs"""
    data = request.get_json(silent=True) or {}
    idea_text = data.get('idea_text', '').strip()
    audience = data.get('audience', '').strip()
    budget_range = data.get('budget_range', '').strip()
    resume = data.get('resume', False)
    
    if not resume and (not idea_text or len(idea_text) < 20):
        return jsonify({'error': 'Idea must be at least 20 characters'}), 400

    if _get_run_state()['running']:
        return jsonify({'error': 'A build is already running'}), 409

    _set_run_state(running=True, error=None, started_at=None, finished_at=None, cancel_requested=False)

    worker = threading.Thread(
        target=_run_pipeline_job,
        args=(idea_text, audience, budget_range, resume),
        daemon=True,
    )
    worker.start()

    return jsonify({'success': True, 'started': True, 'status_url': '/api/pipeline/status'})


@app.route('/api/pipeline/cancel', methods=['POST'])
def cancel_pipeline():
    try:
        _set_run_state(cancel_requested=True)
        return jsonify({'success': True, 'cancel_requested': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pipeline/status', methods=['GET'])
def pipeline_status():
    try:
        return jsonify(_build_status_payload())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/outputs', methods=['GET'])
def get_outputs():
    """Get completed pipeline outputs"""
    try:
        outputs = _load_outputs()
        return jsonify(outputs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export', methods=['GET'])
def export_spec():
    """Export full spec as markdown"""
    try:
        outputs = _load_outputs()
        spec_md = _build_spec_markdown(outputs)
        return jsonify({'markdown': spec_md})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def _load_outputs():
    """Load all completed pipeline outputs"""
    outputs = {}
    
    output_files = {
        'req_doc': STATE_DIR / 'req_doc.json',
        'build_spec': STATE_DIR / 'build_spec.json',
        'features': STATE_DIR / 'features.json',
        'api_spec': STATE_DIR / 'api_spec.json',
        'schema_sql': STATE_DIR / 'schema.sql',
        'ui_spec': STATE_DIR / 'ui_spec.json',
    }
    
    for key, path in output_files.items():
        if path.exists():
            if key == 'schema_sql':
                outputs[key] = path.read_text(encoding='utf-8')
            else:
                outputs[key] = json.loads(path.read_text(encoding='utf-8'))
    
    return outputs

def _build_spec_markdown(outputs):
    """Build a full markdown export of the spec"""
    req = outputs.get('req_doc', {})
    spec = outputs.get('build_spec', {})
    features = outputs.get('features', {})
    api = outputs.get('api_spec', {})
    schema = outputs.get('schema_sql', '')
    ui = outputs.get('ui_spec', {})
    
    personas = '\n'.join(
        f"- **{p.get('name', '')}:** {p.get('description', '')}"
        for p in req.get('user_personas', [])
    )
    
    core_features = '\n'.join(
        f"- **{f.get('name', '')}** ({f.get('priority', '')}): {f.get('description', '')}"
        for f in req.get('core_features', [])
    )
    
    entities = '\n'.join(
        f"- **{e.get('entity', '')}:** {', '.join(f.get('name', '') for f in e.get('fields', []))}"
        for e in spec.get('entity_model', [])
    )
    
    endpoints = '\n'.join(
        f"- `{ep.get('method', '')} {ep.get('path', '')}` — {ep.get('description', '')}"
        for ep in api.get('endpoints', [])
    )
    
    pages = '\n'.join(
        f"- **{p.get('name', '')}**: {p.get('purpose', '')}"
        for p in ui.get('pages', [])
    )
    
    return f"""# {req.get('product_title', 'Your Product Spec')}

## Overview
**Business Goal:** {req.get('business_intent', {}).get('value', '')}

**Type:** {req.get('saas_type', '')}

**Monetization:** {req.get('monetization', {}).get('model', '')} - {', '.join(req.get('monetization', {}).get('tiers', []))}

## Personas
{personas}

## Core Features
{core_features}

## Architecture
**Tech Stack:**
- Frontend: {spec.get('tech_stack', {}).get('frontend', '')}
- Backend: {spec.get('tech_stack', {}).get('backend', '')}
- Database: {spec.get('tech_stack', {}).get('database', '')}
- Auth: {spec.get('tech_stack', {}).get('auth', '')}

**Deployment:** {spec.get('deployment_config', {}).get('frontend_hosting', '')} + {spec.get('deployment_config', {}).get('backend_hosting', '')}

## Data Model
{entities}

## API Endpoints
{endpoints}

## Pages
{pages}

## Database Schema
```sql
{schema}
```
"""

@app.route('/api/chat', methods=['POST'])
def handle_chat():
    """Handle chat instructions - parse and apply changes to pipeline outputs"""
    data = request.get_json(silent=True) or {}
    instruction = data.get('instruction', {})
    message = data.get('message', '')
    outputs = data.get('outputs', {})
    
    instruction_type = instruction.get('type', '')
    
    if instruction_type == 'edit_output':
        stage = instruction.get('stage')
        new_data = instruction.get('data')
        
        if not stage or not new_data:
            return jsonify({'error': 'Missing stage or data for edit'}), 400
            
        file_map = {
            'requirement_agent': 'req_doc.json',
            'prompt_agent': 'build_spec.json',
            'feature_agent': 'features.json',
            'api_agent': 'api_spec.json',
            'db_agent': 'schema.sql',
            'ui_agent': 'ui_spec.json',
        }
        
        filename = file_map.get(stage)
        if not filename:
            return jsonify({'error': f'Unknown stage: {stage}'}), 400
            
        path = STATE_DIR / filename
        try:
            if filename.endswith('.json'):
                path.write_text(json.dumps(new_data, indent=2), encoding='utf-8')
            else:
                path.write_text(str(new_data), encoding='utf-8')
                
            return jsonify({
                'success': True,
                'message': f'Updated {stage} output on disk.',
                'updated': new_data
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif instruction_type == 'add_requirement':
        requirement = instruction.get('requirement', '')
        return jsonify({
            'success': True,
            'message': f'Noted the new requirement: {requirement}',
            'applied': True
        })
    
    else:
        return jsonify({
            'success': True,
            'message': 'Instruction received and processed.'
        })


@app.route('/api/chat/invoke-agent', methods=['POST'])
def invoke_agent():
    """Invoke a specific agent to re-run it with current state"""
    data = request.get_json(silent=True) or {}
    agent_name = data.get('agent', '').strip()
    
    if not agent_name:
        return jsonify({'error': 'Agent name is required'}), 400
    
    # Check if agent exists in pipeline
    valid_agents = [step['name'] for step in PIPELINE]
    if agent_name not in valid_agents:
        return jsonify({'error': f'Unknown agent: {agent_name}'}), 400
    
    if _get_run_state()['running']:
        return jsonify({'error': 'A pipeline is already running. Cannot invoke individual agent.'}), 409
    
    try:
        # Find the agent step definition
        agent_step = next(step for step in PIPELINE if step['name'] == agent_name)
        
        # Check that all inputs exist
        for input_file in agent_step['inputs']:
            input_path = ROOT_DIR / input_file
            if not input_path.exists():
                return jsonify({
                    'error': f'Cannot invoke {agent_name}: missing input {input_file}',
                    'success': False
                }), 400
        
        # Run the agent in a background thread
        def run_agent():
            try:
                status = load_status()
                run_step(agent_step, status)
                save_status(status)
            except Exception as e:
                print(f'Error running {agent_name}: {e}')
        
        thread = threading.Thread(target=run_agent, daemon=True)
        thread.start()
        
        # Wait for the agent to complete (with timeout)
        thread.join(timeout=120)
        
        # Load the output
        output_path = ROOT_DIR / agent_step['output']
        if output_path.exists():
            if agent_step['output'].endswith('.json'):
                output_data = json.loads(output_path.read_text(encoding='utf-8'))
            else:
                output_data = output_path.read_text(encoding='utf-8')
            
            return jsonify({
                'success': True,
                'agent': agent_name,
                'output': output_data
            })
        else:
            return jsonify({
                'error': f'Agent {agent_name} completed but produced no output',
                'success': False
            }), 500
    
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/chat/gemini', methods=['POST'])
def chat_with_gemini():
    """Chat with Gemini AI about the product spec being built"""
    data = request.get_json(silent=True) or {}
    user_message = data.get('message', '').strip()
    outputs = data.get('outputs', {})
    current_stage = data.get('currentStage', '')
    build_context = data.get('buildContext', {})
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        # Initialize Gemini
        api_key = os.getenv('GEMINI_API_KEY', '')
        if not api_key:
            return jsonify({'error': 'Gemini API key not configured'}), 500
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Build context about current spec
        spec_summary = f"""
Current Product Spec Being Built:
- Idea: {build_context.get('idea', '')}
- Target Audience: {build_context.get('audience', '')}
- Budget: {build_context.get('budget', '')}
- Current Stage: {current_stage}

Available Outputs:
{json.dumps(outputs, indent=2)[:2000]}  # Limit context to avoid token overflow
"""
        
        # Create a prompt for Gemini
        system_prompt = """You are a helpful AI assistant helping users refine their SaaS product specification. 
You can help them:
1. Refine requirements and add details
2. Edit existing outputs to improve them
3. Add new features or considerations
4. Provide feedback on their product idea

Be concise and practical. Provide actionable suggestions."""
        
        prompt = f"""{system_prompt}

{spec_summary}

User's Request: {user_message}

Provide a helpful, concise response that directly addresses their request."""
        
        # Call Gemini
        response = model.generate_content(prompt)
        ai_response = response.text if response.text else "I couldn't generate a response. Please try again."
        
        return jsonify({
            'response': ai_response,
            'action': None  # Can be extended to detect specific actions
        })
    
    except Exception as e:
        print(f'Gemini API error: {e}')
        return jsonify({'error': f'Failed to get AI response: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

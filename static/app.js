// State Management
const state = {
    idea_text: '',
    audience: '',
    budget_range: '',
    outputs: null,
    pollTimer: null,
    lastStatus: null,
    selectedStage: 'requirement_agent',
    userManuallySelected: false,
    pendingRevision: false,
    chatMessages: [],
    pipelineId: null
};

const AGENT_STAGE_META = {
    requirement_agent: {
        title: 'Requirement Agent',
        label: 'Requirements Analysis',
        description: 'Analyzing the idea, audience, goals, and monetization to define the product direction.'
    },
    prompt_agent: {
        title: 'Architecture Agent',
        label: 'Architecture Design',
        description: 'Designing the stack, deployment shape, and overall build blueprint.'
    },
    feature_agent: {
        title: 'Feature Agent',
        label: 'Features & Tasks',
        description: 'Expanding the product into feature groups and implementation tasks.'
    },
    api_agent: {
        title: 'API Agent',
        label: 'API Specification',
        description: 'Turning the spec into endpoints, request shapes, and API behavior.'
    },
    db_agent: {
        title: 'Database Agent',
        label: 'Database Schema',
        description: 'Defining tables, relations, constraints, and SQL schema details.'
    },
    ui_agent: {
        title: 'UI Agent',
        label: 'UI Pages',
        description: 'Shaping the user-facing flows, page list, and interface structure.'
    }
};

function clearPipelineTimers() {
    if (state.pollTimer) {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
    }
}

function resetWorkspaceSelection() {
    state.selectedStage = 'requirement_agent';
    state.pendingRevision = false;
}

function setLoadingMessage(message) {
    const loadingStatus = document.getElementById('loadingStatus');
    if (loadingStatus) {
        loadingStatus.textContent = message;
    }
}

function updateLoadingStages(stepStatusMap = {}) {
    document.querySelectorAll('[data-stage]').forEach(item => {
        const stageName = item.dataset.stage;
        const stageState = stepStatusMap[stageName]?.status || 'pending';
        const label = item.querySelector('.stage-status');

        item.classList.remove('is-running', 'is-done', 'is-failed');

        if (stageState === 'running') {
            item.classList.add('is-running');
        } else if (stageState === 'done') {
            item.classList.add('is-done');
        } else if (stageState === 'failed') {
            item.classList.add('is-failed');
        }

        if (label) {
            const labelMap = {
                pending: 'Waiting',
                running: 'Running',
                done: 'Done',
                failed: 'Failed'
            };
            label.textContent = labelMap[stageState] || 'Waiting';
        }
    });
}

function formatList(items) {
    return `<ul class="agent-output-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function renderStageOutput(stageName, outputs = {}, status = {}) {
    const meta = AGENT_STAGE_META[stageName] || { title: 'Agent', label: 'Working', description: 'Processing...' };
    const stageState = status.status?.steps?.[stageName]?.status || 'pending';

    const cardIntro = `
        <div class="agent-output-card">
            <h3>${meta.label}</h3>
            <p>${meta.description}</p>
        </div>
    `;

    const req = outputs.req_doc || {};
    const spec = outputs.build_spec || {};
    const features = outputs.features || {};
    const api = outputs.api_spec || {};
    const ui = outputs.ui_spec || {};
    const schema = outputs.schema_sql || '';

    if (stageName === 'requirement_agent') {
        const personas = (req.user_personas || []).map(persona => `<strong>${persona.name}</strong> (${persona.role})<br>${persona.description || persona.goals?.[0] || ''}`);
        const coreFeatures = (req.core_features || []).map(feature => `<strong>${feature.name}</strong> <span class="muted">(${feature.priority})</span><br>${feature.description}`);
        const monetization = req.monetization || req.monetization_model || {};
        return `
            ${cardIntro}
            <div class="agent-output-card">
                <h3>${req.product_title || req.product_name || 'Product Concept'}</h3>
                <p><strong>Business Goal:</strong> ${req.business_intent?.value || 'Waiting for output'}</p>
                <p><strong>Audience:</strong> ${req.target_audience?.value || state.audience || 'Not set'}</p>
                <p><strong>Monetization:</strong> ${monetization.model || monetization.pricing_motion || 'N/A'}</p>
            </div>
            <div class="agent-output-card">
                <h3>Personas</h3>
                ${personas.length ? formatList(personas) : '<p>Generating personas now.</p>'}
            </div>
            <div class="agent-output-card">
                <h3>Core Features</h3>
                ${coreFeatures.length ? formatList(coreFeatures) : '<p>Feature priorities will appear here.</p>'}
            </div>
        `;
    }

    if (stageName === 'prompt_agent') {
        const stack = spec.tech_stack || {};
        const deployment = spec.deployment_config || {};
        const entities = (spec.entity_model || []).map(entity => `<strong>${entity.entity}</strong><br>${(entity.fields || []).map(field => `${field.name} (${field.type})`).join(', ')}`);
        return `
            ${cardIntro}
            <div class="agent-output-card">
                <h3>Tech Stack</h3>
                <p><strong>Frontend:</strong> ${stack.frontend || 'Pending'}</p>
                <p><strong>Backend:</strong> ${stack.backend || 'Pending'}</p>
                <p><strong>Database:</strong> ${stack.database || 'Pending'}</p>
                <p><strong>Auth:</strong> ${stack.auth || 'Pending'}</p>
            </div>
            <div class="agent-output-card">
                <h3>Deployment</h3>
                <p>${deployment.frontend_hosting || 'Frontend hosting pending'} / ${deployment.backend_hosting || 'Backend hosting pending'}</p>
                <p><strong>Phase 1 Cost:</strong> ${deployment.phase_1_cost || 'Pending'}</p>
            </div>
            <div class="agent-output-card">
                <h3>Data Model Preview</h3>
                ${entities.length ? formatList(entities) : '<p>Entity model will show up here.</p>'}
            </div>
        `;
    }

    if (stageName === 'feature_agent') {
        const expanded = (features.expanded_features || []).map(feature => `<strong>${feature.name}</strong><br>${feature.subtasks?.length || 0} subtasks`);
        return `
            ${cardIntro}
            <div class="agent-output-card">
                <h3>Feature Groups</h3>
                ${expanded.length ? formatList(expanded) : '<p>Expanded task breakdown is being created.</p>'}
            </div>
        `;
    }

    if (stageName === 'api_agent') {
        const endpoints = (api.endpoints || []).map(endpoint => `<strong>${endpoint.method}</strong> ${endpoint.path}<br>${endpoint.description}`);
        return `
            ${cardIntro}
            <div class="agent-output-card">
                <h3>Endpoints</h3>
                ${endpoints.length ? formatList(endpoints) : '<p>API routes are still being drafted.</p>'}
            </div>
        `;
    }

    if (stageName === 'db_agent') {
        return `
            ${cardIntro}
            <div class="agent-output-card">
                <h3>Schema SQL</h3>
                <pre class="agent-code">${schema || 'Schema generation in progress...'}</pre>
            </div>
        `;
    }

    if (stageName === 'ui_agent') {
        const pages = (ui.pages || []).map(page => `<strong>${page.name}</strong><br>${page.purpose}`);
        return `
            ${cardIntro}
            <div class="agent-output-card">
                <h3>Pages</h3>
                ${pages.length ? formatList(pages) : '<p>User-facing page structure is being finalized.</p>'}
            </div>
        `;
    }

    if (stageState === 'running') {
        return `${cardIntro}<div class="agent-output-card"><p>Working...</p></div>`;
    }

    return `${cardIntro}<div class="agent-output-card"><p>No output yet.</p></div>`;
}

function renderLiveWorkspace(status) {
    state.lastStatus = status;
    const outputs = status.outputs || state.outputs || {};
    const steps = status.status?.steps || {};
    const currentStage = status.current_stage || state.selectedStage || 'requirement_agent';
    
    // Auto-select the current stage if it's running and the user hasn't manually switched recently
    if (status.running && currentStage && currentStage !== state.selectedStage && !state.userManuallySelected) {
        const selectedStatus = steps[state.selectedStage]?.status || 'pending';
        if (selectedStatus === 'done' || selectedStatus === 'pending') {
            state.selectedStage = currentStage;
        }
    }
    
    const selectedStage = state.selectedStage || currentStage;

    document.querySelectorAll('.agent-card').forEach(card => {
        const stageName = card.dataset.stage;
        const stageStatus = steps[stageName]?.status || 'pending';
        card.classList.toggle('is-active', stageName === selectedStage);
        card.classList.toggle('is-running', stageName === currentStage);
        card.classList.toggle('is-done', stageStatus === 'done');
        card.classList.toggle('is-failed', stageStatus === 'failed');

        const label = card.querySelector('.stage-status');
        if (label) {
            const labelMap = {
                pending: 'Waiting',
                running: status.status?.steps[stageName]?.current_activity || 'Working',
                done: 'Done',
                failed: 'Failed'
            };
            label.textContent = labelMap[stageStatus] || 'Waiting';
        }
    });

    const stageMeta = AGENT_STAGE_META[selectedStage] || AGENT_STAGE_META.requirement_agent;
    const screenTitle = document.getElementById('agentScreenTitle');
    const screenState = document.getElementById('agentScreenState');
    const screenMeta = document.getElementById('agentScreenMeta');
    const screenOutput = document.getElementById('agentScreenOutput');

    if (screenTitle) screenTitle.textContent = stageMeta.title;
    if (screenState) screenState.textContent = steps[selectedStage]?.status === 'done' ? 'Completed' : (selectedStage === currentStage ? 'Working' : 'Inspecting');
    if (screenMeta) {
        const currentLabel = AGENT_STAGE_META[currentStage]?.label || 'Current stage';
        const activity = steps[selectedStage]?.current_activity;
        const isSelectedRunning = steps[selectedStage]?.status === 'running';
        
        if (isSelectedRunning) {
            screenMeta.innerHTML = `
                <div style="margin-bottom: 8px;">${stageMeta.description}</div>
                ${activity ? `<div class="activity-pill">⚡ ${activity}</div>` : ''}
            `;
        } else if (currentStage && selectedStage !== currentStage && steps[currentStage]?.status === 'running') {
            screenMeta.textContent = `Viewing ${stageMeta.label.toLowerCase()} output while ${currentLabel.toLowerCase()} is in progress.`;
        } else {
            screenMeta.textContent = stageMeta.description;
        }
    }
    if (screenOutput) {
        screenOutput.innerHTML = renderStageOutput(selectedStage, outputs, status);
    }

    const prototypeScreen = document.getElementById('prototypeScreen');
    if (prototypeScreen && (selectedStage === 'ui_agent' || outputs.ui_spec)) {
        prototypeScreen.innerHTML = renderVisualPrototype(outputs.ui_spec || outputs);
    } else if (prototypeScreen) {
        prototypeScreen.innerHTML = '<p class="muted">Visual preview is available for the UI Agent stage.</p>';
    }

    // Toggle tab visibility
    const tabPrototype = document.getElementById('tabPrototype');
    if (tabPrototype) {
        tabPrototype.style.display = (selectedStage === 'ui_agent' || outputs.ui_spec) ? 'block' : 'none';
    }

    updateLoadingStages(steps);
}

async function requestCancelBuild() {
    try {
        const response = await fetch('/api/pipeline/cancel', { method: 'POST' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Unable to cancel build');
        }
        setLoadingMessage('Cancellation requested. The active agent will stop after the current stage.');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function prepareRevision() {
    state.pendingRevision = true;
    await requestCancelBuild();
    setLoadingMessage('Preparing to return to the editor so you can revise the requirements.');
}

function selectAgentStage(stageName, button) {
    state.selectedStage = stageName;
    state.userManuallySelected = true;
    
    document.querySelectorAll('.agent-card').forEach(card => card.classList.remove('is-active'));
    if (button) {
        button.classList.add('is-active');
    }
    if (state.lastStatus) {
        renderLiveWorkspace(state.lastStatus);
    }
}

async function fetchPipelineStatus() {
    const response = await fetch('/api/pipeline/status');
    if (!response.ok) {
        throw new Error('Unable to load pipeline status');
    }
    return response.json();
}

// Step Navigation
function nextStep(current) {
    if (current === 1) {
        const idea = document.getElementById('ideaInput').value.trim();
        if (idea.length < 20) {
            alert('Please describe your idea in at least 20 characters');
            return;
        }
        state.idea_text = idea;
    } else if (current === 2) {
        const audience = document.getElementById('audienceInput').value.trim();
        if (!audience) {
            alert('Please describe your target audience');
            return;
        }
        state.audience = audience;
    }
    
    switchStep(current + 1);
}

function prevStep(current) {
    switchStep(current - 1);
}

function switchStep(step) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    
    // Show current step
    const currentStep = document.getElementById(`step${step}`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
    
    // Scroll to top
    document.querySelector('.main').scrollTop = 0;
}

// Form Helpers
function setIdea(text) {
    document.getElementById('ideaInput').value = text;
    updateCharCounter();
}

function setAudience(text) {
    document.getElementById('audienceInput').value = text;
}

function setBudget(text) {
    state.budget_range = text;
}

function updateCharCounter() {
    const input = document.getElementById('ideaInput');
    const count = input.value.length;
    document.getElementById('charCount').textContent = count;
}

// Review and Submit
function reviewAndSubmit() {
    const budget = document.querySelector('input[name="budget"]:checked');
    if (!budget) {
        alert('Please select a budget range');
        return;
    }
    
    state.budget_range = budget.value;
    
    // Populate review box
    document.getElementById('reviewIdea').textContent = state.idea_text;
    document.getElementById('reviewAudience').textContent = state.audience;
    document.getElementById('reviewBudget').textContent = state.budget_range;
    
    switchStep(4);
}

async function submitPipeline(resume = false) {
    clearPipelineTimers();
    state.pendingRevision = false;
    if (!resume) {
        state.selectedStage = 'requirement_agent';
        state.chatMessages = []; // Clear chat history when starting new build
    }
    switchStep(5); // Show loading
    setLoadingMessage('Launching the build pipeline...');
    updateLoadingStages();
    renderLiveWorkspace({
        running: true,
        current_stage: 'requirement_agent',
        status: { steps: {} },
        outputs: {}
    });
    
    try {
        const response = await fetch('/api/pipeline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idea_text: state.idea_text,
                audience: state.audience,
                budget_range: state.budget_range,
                resume: resume
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Pipeline failed');
        }
        
        const data = await response.json();

        if (data.outputs) {
            state.outputs = data.outputs;
            populateResults();
            switchStep(6);
            return;
        }

        const pollStatus = async () => {
            try {
                const status = await fetchPipelineStatus();

                renderLiveWorkspace(status);

                if (status.error && !state.pendingRevision) {
                    clearPipelineTimers();
                    throw new Error(status.error);
                }

                if (status.complete && status.outputs) {
                    clearPipelineTimers();
                    state.outputs = status.outputs;
                    populateResults();
                    switchStep(6);
                    return 'done';
                }

                if (state.pendingRevision && !status.running) {
                    clearPipelineTimers();
                    switchStep(4);
                    return 'revision-ready';
                }

                const runningStep = Object.entries(status.status?.steps || {}).find(([, step]) => step.status === 'running');
                if (runningStep) {
                    setLoadingMessage(`Building ${runningStep[0].replace(/_/g, ' ')}...`);
                } else {
                    setLoadingMessage('Preparing the next stage...');
                }

                return 'running';
            } catch (error) {
                clearPipelineTimers();
                alert('Error: ' + error.message);
                switchStep(4);
                return 'error';
            }
        };

        const initialPollState = await pollStatus();
        state.pollTimer = setInterval(async () => {
            const nextState = await pollStatus();
            if (nextState !== 'running' && nextState !== 'pending') {
                // Only stop if we reached a terminal state
                // Note: we might want to keep polling even if failed to show errors?
            }
        }, 1500);
        
    } catch (error) {
        clearPipelineTimers();
        alert('Error: ' + error.message);
        switchStep(4);
    }
}

// Results Display
function populateResults() {
    const req = state.outputs.req_doc || {};
    const spec = state.outputs.build_spec || {};
    const features = state.outputs.features || {};
    const api = state.outputs.api_spec || {};
    const ui = state.outputs.ui_spec || {};
    
    // Overview
    document.getElementById('overviewContent').innerHTML = `
        <div class="content-section">
            <h3>${req.product_title || 'Your Product'}</h3>
            <div class="content-item">
                <strong>Business Goal:</strong><br>
                ${req.business_intent?.value || 'N/A'}
            </div>
            <div class="content-item">
                <strong>Type:</strong> ${req.saas_type || 'N/A'}
            </div>
            <div class="content-item">
                <strong>Monetization:</strong> ${req.monetization?.model || 'N/A'} - ${req.monetization?.tiers?.join(', ') || 'N/A'}
            </div>
        </div>
        
        <div class="content-section">
            <h3>Personas</h3>
            <ul class="content-list">
                ${(req.user_personas || []).map(p => `
                    <li><strong>${p.name}</strong><br>${p.description}</li>
                `).join('')}
            </ul>
        </div>
    `;
    
    // Features
    document.getElementById('featuresContent').innerHTML = `
        <div class="content-section">
            <h3>Core Features</h3>
            ${['must_have', 'should_have', 'nice_to_have'].map(priority => {
                const items = (req.core_features || []).filter(f => f.priority === priority);
                if (items.length === 0) return '';
                const labels = { must_have: 'Must Have', should_have: 'Should Have', nice_to_have: 'Nice to Have' };
                return `
                    <div class="content-item" style="margin-top: 16px;">
                        <strong style="color: var(--primary);">${labels[priority]}</strong>
                        <ul class="content-list">
                            ${items.map(f => `
                                <li><strong>${f.name}</strong><br>${f.description}</li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="content-section" style="margin-top: 24px;">
            <h3>Expanded Tasks</h3>
            ${(features.expanded_features || []).map(f => `
                <div class="content-item">
                    <strong>${f.name}</strong><br>
                    ${f.subtasks?.length || 0} subtasks
                </div>
            `).join('')}
        </div>
    `;
    
    // Architecture
    const stack = spec.tech_stack || {};
    const deploy = spec.deployment_config || {};
    document.getElementById('architectureContent').innerHTML = `
        <div class="content-section">
            <h3>Tech Stack</h3>
            <div class="content-item"><strong>Frontend:</strong> ${stack.frontend || 'N/A'}</div>
            <div class="content-item"><strong>Backend:</strong> ${stack.backend || 'N/A'}</div>
            <div class="content-item"><strong>Database:</strong> ${stack.database || 'N/A'}</div>
            <div class="content-item"><strong>Auth:</strong> ${stack.auth || 'N/A'}</div>
        </div>
        
        <div class="content-section">
            <h3>Deployment</h3>
            <div class="content-item"><strong>Frontend Hosting:</strong> ${deploy.frontend_hosting || 'N/A'}</div>
            <div class="content-item"><strong>Backend Hosting:</strong> ${deploy.backend_hosting || 'N/A'}</div>
            <div class="content-item"><strong>Database:</strong> ${deploy.database || 'N/A'}</div>
            <div class="content-item"><strong>Monthly Cost (Phase 1):</strong> ${deploy.phase_1_cost || 'N/A'}</div>
        </div>
    `;
    
    // Pages
    document.getElementById('pagesContent').innerHTML = `
        <div class="content-section">
            <h3>User Pages</h3>
            ${(ui.pages || []).map(p => `
                <div class="content-item" style="margin-bottom: 20px; padding: 12px; background: var(--bg-light); border-radius: 6px;">
                    <strong>${p.name}</strong><br>
                    <small style="color: var(--text-light);">${p.purpose}</small><br>
                    ${p.components && p.components.length > 0 ? `
                        <small style="margin-top: 8px; display: block;">
                            <strong>Components:</strong> ${p.components.join(', ')}
                        </small>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    // Data Model
    document.getElementById('dataContent').innerHTML = `
        <div class="content-section">
            <h3>Entities</h3>
            ${(spec.entity_model || []).map(e => `
                <div class="content-item">
                    <strong>${e.entity}</strong><br>
                    <small>${(e.fields || []).map(f => `${f.name} (${f.type})`).join(', ')}</small>
                </div>
            `).join('')}
        </div>
    `;
    
    // API
    document.getElementById('apiContent').innerHTML = `
        <div class="content-section">
            <h3>Endpoints</h3>
            <div class="code-block">
                ${(api.endpoints || []).map(ep => `
                    <div><strong>${ep.method}</strong> ${ep.path}<br>
                    <small>${ep.description}</small></div>
                `).join('<br>')}
            </div>
        </div>
    `;
}

// Tab Switching
function switchTab(tab, button) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // Show current tab
    document.getElementById(tab).classList.add('active');
    if (button) {
        button.classList.add('active');
    }
}

// Export
async function exportSpec() {
    try {
        const response = await fetch('/api/export');
        if (!response.ok) throw new Error('Export failed');
        
        const data = await response.json();
        const markdown = data.markdown;
        
        // Create download
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdown));
        element.setAttribute('download', 'product-spec.md');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
    } catch (error) {
        alert('Error exporting: ' + error.message);
    }
}

// Chat Functionality
function renderChatMessages() {
    const chatMessagesDiv = document.getElementById('chatMessages');
    if (!chatMessagesDiv) return;
    
    chatMessagesDiv.innerHTML = state.chatMessages.map((msg, idx) => `
        <div class="chat-message ${msg.role}">
            <div class="chat-message-bubble">${msg.content}</div>
        </div>
    `).join('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }, 50);
}

function addChatMessage(role, content) {
    state.chatMessages.push({ role, content });
    renderChatMessages();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    
    const userMessage = input.value.trim();
    input.value = '';
    
    // Add user message to chat
    addChatMessage('user', userMessage);
    
    // Get AI response from Gemini
    try {
        const response = await fetch('/api/chat/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                outputs: state.outputs,
                currentStage: state.selectedStage,
                buildContext: {
                    idea: state.idea_text,
                    audience: state.audience,
                    budget: state.budget_range
                }
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            addChatMessage('assistant', `I encountered an error: ${error.error || 'Unable to process your request'}`);
            return;
        }
        
        const result = await response.json();
        
        if (result.response) {
            addChatMessage('assistant', result.response);
        }
        
        // If there's an action to perform
        if (result.action) {
            if (result.action.type === 'invoke_agent') {
                addChatMessage('assistant', `Let me re-run the ${result.action.agent} for you...`);
                await invokeAgentDirectly(result.action.agent);
            }
        }
    } catch (error) {
        addChatMessage('assistant', `Error: ${error.message}`);
    }
}

function handleChatKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

function handleQuickAction(action) {
    let message = '';
    switch(action) {
        case 'refine':
            message = 'Refine and improve the requirements based on best practices';
            break;
        case 'edit':
            message = 'Help me edit the current output to better match the product vision';
            break;
        case 'add':
            message = 'What features should I add to make this product more competitive?';
            break;
    }
    
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = message;
        input.focus();
    }
}

async function applyInstruction(userMessage) {
    // Parse the instruction
    const instruction = parseInstruction(userMessage);
    
    if (!instruction) {
        addChatMessage('assistant', 'I understood your message, but I need more details. Try mentioning which agent to invoke or what to change.');
        return;
    }
    
    try {
        // Send instruction to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instruction: instruction,
                message: userMessage,
                outputs: state.outputs,
                pipelineId: state.pipelineId
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            addChatMessage('system', `Error: ${error.error || 'Unable to process instruction'}`);
            return;
        }
        
        const result = await response.json();
        
        // Handle different instruction types
        if (instruction.type === 'invoke_agent') {
            addChatMessage('assistant', `Invoking ${instruction.agent}... This may take a moment.`);
            // Re-run the specific agent
            await invokeAgentDirectly(instruction.agent);
        } else if (instruction.type === 'edit_output') {
            if (result.updated) {
                addChatMessage('assistant', `Updated the ${instruction.stage || 'agent'} output. You can see the changes on the right panel.`);
                if (state.outputs) {
                    state.outputs[instruction.stage] = result.updated;
                    renderLiveWorkspace(state.lastStatus);
                }
            }
        } else if (instruction.type === 'add_requirement') {
            addChatMessage('assistant', `Added: "${instruction.requirement}". This will be considered in the next agent pass.`);
        } else {
            addChatMessage('assistant', result.message || 'Instruction processed.');
        }
    } catch (error) {
        addChatMessage('system', `Error: ${error.message}`);
    }
}

function parseInstruction(message) {
    const msg = message.toLowerCase();
    
    // Detect: "invoke requirement agent", "re-run requirement agent", etc.
    if (msg.match(/invoke|re-run|rerun|refine|analyze/i) && msg.match(/requirement|idea/i)) {
        return { type: 'invoke_agent', agent: 'requirement_agent' };
    }
    
    if (msg.match(/invoke|re-run|rerun/i) && msg.match(/feature|capability/i)) {
        return { type: 'invoke_agent', agent: 'feature_agent' };
    }
    
    if (msg.match(/invoke|re-run|rerun/i) && msg.match(/api|endpoint/i)) {
        return { type: 'invoke_agent', agent: 'api_agent' };
    }
    
    if (msg.match(/invoke|re-run|rerun/i) && msg.match(/database|db|schema/i)) {
        return { type: 'invoke_agent', agent: 'db_agent' };
    }
    
    if (msg.match(/invoke|re-run|rerun/i) && msg.match(/ui|page|interface|design/i)) {
        return { type: 'invoke_agent', agent: 'ui_agent' };
    }
    
    // Detect: "edit output", "change persona", etc.
    if (msg.match(/edit|change|modify|update/) && msg.match(/requirement|persona|feature|output/i)) {
        const stageMatch = msg.match(/requirement|feature|api|database|db|ui|page|persona/);
        return {
            type: 'edit_output',
            stage: stageMatch ? stageMatch[0] : null,
            modification: message
        };
    }
    
    // Detect: "add feature", "add requirement", etc.
    const addMatch = message.match(/add\s+(a|an)?\s+(new\s+)?(requirement|feature|persona|page|endpoint|field|api|database)(.*)/i);
    if (addMatch) {
        const itemType = addMatch[3];
        const description = addMatch[4] ? addMatch[4].trim() : '';
        const requirement = description || `a new ${itemType}`;
        return {
            type: 'add_requirement',
            requirement: requirement
        };
    }
    
    return null;
}

async function invokeAgentDirectly(agentName) {
    try {
        const response = await fetch('/api/chat/invoke-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent: agentName,
                currentOutputs: state.outputs,
                pipelineId: state.pipelineId
            })
        });
        
        if (!response.ok) {
            throw new Error('Unable to invoke agent');
        }
        
        const result = await response.json();
        
        if (result.success && result.output) {
            // Update state with new output
            if (state.outputs) {
                state.outputs[agentName] = result.output;
            }
            
            // Update the display
            state.selectedStage = agentName;
            if (state.lastStatus) {
                renderLiveWorkspace(state.lastStatus);
            }
            
            addChatMessage('assistant', `✅ ${agentName} has been re-executed. Check the output on the right panel.`);
        }
    } catch (error) {
        addChatMessage('system', `Error invoking agent: ${error.message}`);
    }
}

// Start Over
function startOver() {
    clearPipelineTimers();
    resetWorkspaceSelection();
    state.idea_text = '';
    state.audience = '';
    state.budget_range = '';
    state.outputs = null;
    state.chatMessages = [];
    state.pipelineId = null;
    
    document.getElementById('ideaInput').value = '';
    document.getElementById('audienceInput').value = '';
    document.querySelectorAll('input[name="budget"]').forEach(r => r.checked = false);
    
    switchStep(1);
}

// View Switching
function switchView(view) {
    const rawView = document.getElementById('rawView');
    const prototypeView = document.getElementById('prototypeView');
    const tabRaw = document.getElementById('tabRaw');
    const tabPrototype = document.getElementById('tabPrototype');

    if (view === 'raw') {
        rawView.style.display = 'block';
        prototypeView.style.display = 'none';
        tabRaw.classList.add('active');
        tabPrototype.classList.remove('active');
    } else {
        rawView.style.display = 'none';
        prototypeView.style.display = 'flex';
        tabRaw.classList.remove('active');
        tabPrototype.classList.add('active');
    }
}

function renderVisualPrototype(uiSpec) {
    if (!uiSpec || !uiSpec.pages) return '<p class="muted">No UI specification found.</p>';
    
    return uiSpec.pages.map(page => `
        <div class="proto-page">
            <div class="proto-header">
                <h4>${page.name}</h4>
                <span class="proto-route">${page.route}</span>
            </div>
            <div class="proto-body">
                <p style="font-size: 0.8rem; margin-bottom: 15px; color: #aaa;">${page.purpose}</p>
                <div class="proto-components">
                    ${(page.components || []).map(comp => `
                        <div class="proto-comp">
                            <h5>${comp.name}</h5>
                            <p>${comp.type} - ${comp.data_source}</p>
                            <div class="proto-state">States: ${Object.keys(comp.states || {}).join(', ')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('ideaInput')?.addEventListener('input', updateCharCounter);
    
    // Check for previous pipeline to show resume button
    try {
        const response = await fetch('/api/pipeline/status');
        if (response.ok) {
            const status = await response.json();
            if (status && status.status && Object.keys(status.status.steps).length > 0) {
                const resumeBtn = document.getElementById('resumeBtn');
                if (resumeBtn) resumeBtn.style.display = 'block';
            }
        }
    } catch (e) {
        console.log('No previous pipeline found');
    }
});

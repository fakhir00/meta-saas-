'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ---- AI Simulation Engine ---- */
const AI_RESPONSES = {
  intake: {
    analysis: (answers) => {
      const industry = answers[0] || 'technology';
      const skill = answers[1] || 'operations management';
      return {
        founderFit: `Based on your background in **${industry}** and strengths in **${skill}**, you have a strong "Founder-Market Fit" for B2B operational tools. Your domain knowledge gives you an unfair advantage in understanding customer pain points that generic founders miss.`,
        pains: [
          {
            title: `${industry} Client Onboarding Bottleneck`,
            desc: `Small ${industry} businesses waste 8-12 hours/week on manual client intake, document collection, and follow-ups. This costs an average of $2,400/month in lost productivity.`,
            severity: 'Critical',
            revenue: '$28,800/year lost per business',
          },
          {
            title: `${industry} Reporting & Analytics Gap`,
            desc: `65% of small ${industry} firms rely on spreadsheets for client reporting, leading to errors and 4+ hours of weekly manual work. Clients churn when they can't see ROI.`,
            severity: 'High',
            revenue: '$18,000/year lost per business',
          },
          {
            title: `${industry} Lead Follow-up Decay`,
            desc: `78% of ${industry} leads go cold within 48 hours due to lack of automated follow-up sequences. Each lost lead costs ~$500 in acquisition spend.`,
            severity: 'High',
            revenue: '$24,000/year lost per business',
          },
        ],
        recommendation: `We recommend targeting **"${industry} Client Onboarding Automation"** — it has the highest severity, clearest ROI, and the most urgent buyer intent. Businesses are actively losing money every day they don't solve this.`,
      };
    },
  },
  blueprint: (answers) => {
    const industry = answers[0] || 'technology';
    return {
      name: `${industry}Flow — Intelligent Client Onboarding`,
      tagline: 'Turn chaotic client intake into a 5-minute automated workflow',
      architecture: {
        frontend: 'React + Next.js (App Router)',
        backend: 'Node.js + Express API',
        database: 'PostgreSQL with Prisma ORM',
        auth: 'NextAuth.js + JWT tokens',
        hosting: 'Vercel (Frontend) + Railway (Backend)',
        storage: 'AWS S3 for documents',
      },
      coreFeatures: [
        'Smart intake forms with conditional logic',
        'Automated document collection & reminders',
        'Client portal with progress tracking',
        'E-signature integration',
        'Automated welcome email sequences',
        'Dashboard with onboarding analytics',
      ],
      security: [
        'AES-256 encryption at rest',
        'TLS 1.3 in transit',
        'Rate limiting: 100 req/min per user',
        'RBAC with role-based permissions',
        'SOC 2 compliant architecture',
        'Automated backups every 6 hours',
      ],
      mvpTimeline: '4-6 weeks',
      estimatedCost: '$2,400 total (vs $180,000 traditional)',
    };
  },
  aiLogic: (answers) => {
    const industry = answers[0] || 'technology';
    return {
      systemPrompt: `You are an intelligent onboarding assistant for ${industry} businesses. Your role is to guide new clients through a seamless intake process. You must:\n1. Collect required information in a conversational manner\n2. Validate data formats (email, phone, addresses)\n3. Flag missing documents and send automated reminders\n4. Categorize clients by service tier and priority\n5. Generate personalized welcome messages\n6. Escalate complex cases to human operators\n\nTone: Professional, warm, and efficient. Never use jargon the client won't understand.`,
      jsonSchema: JSON.stringify({
        clientIntake: {
          type: 'object',
          required: ['business_name', 'contact_email', 'service_tier'],
          properties: {
            business_name: { type: 'string', maxLength: 200 },
            contact_email: { type: 'string', format: 'email' },
            contact_phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
            service_tier: { type: 'string', enum: ['starter', 'growth', 'enterprise'] },
            onboarding_priority: { type: 'string', enum: ['standard', 'expedited', 'vip'] },
            documents_required: {
              type: 'array',
              items: { type: 'string' },
            },
            notes: { type: 'string', maxLength: 2000 },
          },
        },
      }, null, 2),
      agentLogic: [
        { step: 1, action: 'INTAKE_FORM_SUBMIT', handler: 'validateAndStore()', next: 'step2' },
        { step: 2, action: 'DOCUMENT_CHECK', handler: 'checkRequiredDocs()', next: 'step3|waitForDocs' },
        { step: 3, action: 'CLIENT_CATEGORIZE', handler: 'classifyByTier()', next: 'step4' },
        { step: 4, action: 'WELCOME_SEQUENCE', handler: 'triggerEmailChain()', next: 'step5' },
        { step: 5, action: 'DASHBOARD_UPDATE', handler: 'syncToDashboard()', next: 'complete' },
      ],
      dashboardWidgets: [
        { name: 'Active Onboardings', type: 'counter', source: 'onboarding.active' },
        { name: 'Avg. Completion Time', type: 'gauge', source: 'onboarding.avg_time' },
        { name: 'Document Completion Rate', type: 'progress', source: 'docs.completion_rate' },
        { name: 'Client Satisfaction', type: 'rating', source: 'feedback.avg_score' },
      ],
    };
  },
  sales: (answers) => {
    const industry = answers[0] || 'technology';
    return {
      idealCustomer: {
        size: '5-50 employees',
        role: 'Operations Manager / Founder',
        pain: 'Spending 10+ hrs/week on manual onboarding',
        budget: '$99-299/month',
        channel: 'LinkedIn + Cold Email',
      },
      emailTemplate: `Subject: Cutting your ${industry} onboarding time by 80%\n\nHi [First Name],\n\nI noticed [Company] is growing fast — congrats! With growth comes onboarding chaos.\n\nWe built a tool specifically for ${industry} businesses that turns a 2-hour client intake into a 5-minute automated flow.\n\nOne of our early customers, [Similar Company], reduced their onboarding time from 12 hours/week to 2 hours/week — saving $2,400/month.\n\nWould you be open to a 15-min call this week to see if it could work for you?\n\nBest,\n[Your Name]`,
      linkedinScript: `Hey [First Name] 👋\n\nI see you're running ops at [Company] — I know ${industry} onboarding can be a nightmare.\n\nWe just launched a tool that automates the entire client intake process. Thought you might find it interesting since you're dealing with [specific pain].\n\nHappy to share a quick demo if you're curious. No pressure!`,
      thirtyDayPlan: [
        { week: 'Week 1', actions: ['Build target list of 200 prospects', 'Set up email sequences (3-touch)', 'Optimize LinkedIn profile', 'Send 50 connection requests/day'] },
        { week: 'Week 2', actions: ['Launch email campaign batch 1 (100 prospects)', 'Follow up on LinkedIn accepts', 'Post 3 LinkedIn content pieces', 'Book first 5 demo calls'] },
        { week: 'Week 3', actions: ['Launch email batch 2', 'Refine messaging based on replies', 'Run 5-10 demo calls', 'Send personalized Loom videos to warm leads'] },
        { week: 'Week 4', actions: ['Close first 3-5 paying customers', 'Collect testimonials', 'Set up referral incentive', 'Begin onboarding customers'] },
      ],
      projectedResults: {
        emailsSent: 200,
        expectedReplies: '15-25 (8-12%)',
        expectedDemos: '8-12',
        expectedCustomers: '3-5',
        monthlyRevenue: '$297 - $1,495',
      },
    };
  },
};

/* ---- Typing Indicator ---- */
function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <span /><span /><span />
      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-blue);
          animation: typingBounce 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ---- Typewriter for AI responses ---- */
function AITypewriter({ text, speed = 15, onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        onComplete && onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span style={{ whiteSpace: 'pre-wrap' }}>{displayed}</span>;
}

/* ---- Progress Bar ---- */
function ProgressBar({ currentPhase, totalPhases = 4 }) {
  const phases = ['Deep Intake', 'Blueprint', 'AI Engineering', 'Sales'];
  return (
    <div className="progress-bar-container">
      <div className="progress-steps">
        {phases.map((label, i) => (
          <div key={i} className={`progress-step ${i < currentPhase ? 'completed' : ''} ${i === currentPhase ? 'active' : ''}`}>
            <div className="progress-dot">
              {i < currentPhase ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="progress-label">{label}</span>
            {i < totalPhases - 1 && <div className="progress-line" />}
          </div>
        ))}
      </div>
      <style jsx>{`
        .progress-bar-container {
          padding: var(--space-xl) 0;
          margin-bottom: var(--space-xl);
        }
        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
        }
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
          max-width: 180px;
        }
        .progress-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-glass);
          color: var(--text-tertiary);
          transition: all var(--transition-base);
          z-index: 1;
        }
        .progress-step.active .progress-dot {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .progress-step.completed .progress-dot {
          background: var(--accent-green);
          border-color: var(--accent-green);
          color: white;
        }
        .progress-label {
          margin-top: 0.5rem;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--text-tertiary);
          text-align: center;
        }
        .progress-step.active .progress-label {
          color: var(--accent-blue);
          font-weight: 600;
        }
        .progress-step.completed .progress-label {
          color: var(--accent-green);
        }
        .progress-line {
          position: absolute;
          top: 20px;
          left: calc(50% + 24px);
          width: calc(100% - 48px);
          height: 2px;
          background: var(--border-glass);
        }
        .progress-step.completed .progress-line {
          background: var(--accent-green);
        }
        @media (max-width: 600px) {
          .progress-label { display: none; }
          .progress-step { max-width: 80px; }
        }
      `}</style>
    </div>
  );
}

/* ===== MAIN LAUNCH PAGE ===== */
export default function LaunchPage() {
  const [phase, setPhase] = useState(0);
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  const [isThinking, setIsThinking] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [selectedPain, setSelectedPain] = useState(null);
  const contentRef = useRef(null);

  const questions = [
    { q: 'What industry do you have the most experience or interest in?', placeholder: 'e.g., Healthcare, E-commerce, Real Estate, SaaS, Education...', icon: '🏢' },
    { q: 'What is your strongest professional skill?', placeholder: 'e.g., Sales, Marketing, Operations, Finance, Engineering...', icon: '💪' },
    { q: 'How many hours per week can you dedicate to this venture?', placeholder: 'e.g., 10, 20, 40...', icon: '⏰' },
    { q: 'What is your monthly budget for tools and infrastructure?', placeholder: 'e.g., $50, $200, $500...', icon: '💳' },
    { q: 'Describe your ideal customer in one sentence.', placeholder: 'e.g., Small business owners who struggle with client management...', icon: '🎯' },
  ];

  const handleAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const simulateAI = (responseGenerator) => {
    setIsThinking(true);
    const thinkTime = 2000 + Math.random() * 2000;
    setTimeout(() => {
      const result = typeof responseGenerator === 'function' ? responseGenerator(answers) : responseGenerator;
      setAiResult(result);
      setIsThinking(false);
    }, thinkTime);
  };

  const advancePhase = () => {
    setAiResult(null);
    const nextPhase = phase + 1;
    setPhase(nextPhase);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (nextPhase === 1) {
      simulateAI(AI_RESPONSES.intake.analysis);
    } else if (nextPhase === 2) {
      simulateAI(AI_RESPONSES.blueprint);
    } else if (nextPhase === 3) {
      simulateAI(AI_RESPONSES.aiLogic);
    }
  };

  const handleIntakeSubmit = () => {
    const filled = answers.filter(a => a.trim().length > 0).length;
    if (filled < 3) {
      alert('Please answer at least 3 questions to continue.');
      return;
    }
    advancePhase();
  };

  return (
    <div className="launch-page">
      <div className="launch-bg">
        <div className="launch-glow launch-glow-1" />
        <div className="launch-glow launch-glow-2" />
      </div>

      <div className="container" ref={contentRef}>
        <div className="launch-header text-center animate-fade-in-up">
          <span className="badge badge-blue">🚀 Launch Wizard</span>
          <h1 style={{ marginTop: '1rem' }}>Build Your <span className="text-gradient">SaaS</span></h1>
          <p className="launch-subtitle">Follow the guided 4-phase process. Your AI Co-Founder handles the heavy lifting.</p>
        </div>

        <ProgressBar currentPhase={phase} />

        {/* ===== PHASE 0: INTAKE ===== */}
        {phase === 0 && (
          <div className="phase-content animate-fade-in-up">
            <div className="phase-title-bar">
              <span className="phase-badge">Phase 1</span>
              <h2>Deep Intake & Founder Alignment</h2>
              <p>Answer these high-leverage questions so our AI can identify your unique strengths and discover profitable operational pains.</p>
            </div>
            <div className="intake-form">
              {questions.map((q, i) => (
                <div key={i} className="intake-question glass-card">
                  <div className="intake-q-header">
                    <span className="intake-q-icon">{q.icon}</span>
                    <label>{q.q}</label>
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={q.placeholder}
                    value={answers[i]}
                    onChange={(e) => handleAnswer(i, e.target.value)}
                  />
                </div>
              ))}
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} onClick={handleIntakeSubmit}>
                🔍 Analyze My Profile →
              </button>
            </div>
          </div>
        )}

        {/* ===== PHASE 1: ANALYSIS RESULTS ===== */}
        {phase === 1 && (
          <div className="phase-content animate-fade-in-up">
            <div className="phase-title-bar">
              <span className="phase-badge">Phase 1 Results</span>
              <h2>Predictive Market Analysis</h2>
              <p>Your AI Co-Founder identified these opportunities based on your profile.</p>
            </div>
            {isThinking ? (
              <div className="glass-card thinking-card">
                <TypingIndicator />
                <p>Analyzing your founder profile, scanning market data, and identifying operational pains...</p>
              </div>
            ) : aiResult && (
              <div className="analysis-results">
                <div className="glass-card result-card">
                  <h3>🎯 Founder-Market Fit</h3>
                  <p>{aiResult.founderFit}</p>
                </div>

                <h3 style={{ margin: '2rem 0 1rem', textAlign: 'center' }}>Identified Operational Pains</h3>
                <div className="pains-grid">
                  {aiResult.pains.map((pain, i) => (
                    <div
                      key={i}
                      className={`glass-card pain-result-card ${selectedPain === i ? 'selected' : ''}`}
                      onClick={() => setSelectedPain(i)}
                    >
                      <div className="pain-header">
                        <span className={`badge ${pain.severity === 'Critical' ? 'badge-orange' : 'badge-blue'}`}>{pain.severity}</span>
                      </div>
                      <h4>{pain.title}</h4>
                      <p>{pain.desc}</p>
                      <div className="pain-revenue">💰 {pain.revenue}</div>
                    </div>
                  ))}
                </div>

                <div className="glass-card result-card recommendation">
                  <h3>🏆 AI Recommendation</h3>
                  <p>{aiResult.recommendation}</p>
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }} onClick={advancePhase}>
                  📐 Generate Blueprint →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== PHASE 2: BLUEPRINT ===== */}
        {phase === 2 && (
          <div className="phase-content animate-fade-in-up">
            <div className="phase-title-bar">
              <span className="phase-badge">Phase 2</span>
              <h2>Anti-Bloat Blueprint</h2>
              <p>Your strict, no-nonsense technical blueprint. Zero bloat, maximum efficiency.</p>
            </div>
            {isThinking ? (
              <div className="glass-card thinking-card">
                <TypingIndicator />
                <p>Engineering your optimal architecture, defining security protocols, and calculating costs...</p>
              </div>
            ) : aiResult && (
              <div className="blueprint-results">
                <div className="glass-card blueprint-header-card">
                  <span className="badge badge-green">Recommended Product</span>
                  <h2 style={{ margin: '0.75rem 0 0.25rem' }}>{aiResult.name}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{aiResult.tagline}</p>
                  <div className="blueprint-meta">
                    <span>⏱️ MVP: {aiResult.mvpTimeline}</span>
                    <span>💰 Cost: {aiResult.estimatedCost}</span>
                  </div>
                </div>

                <div className="blueprint-grid">
                  <div className="glass-card">
                    <h3>🏗️ Technical Architecture</h3>
                    <div className="tech-stack-list">
                      {Object.entries(aiResult.architecture).map(([key, val]) => (
                        <div key={key} className="tech-item">
                          <span className="tech-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="tech-value text-mono">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3>✨ Core Features (MVP)</h3>
                    <ul className="feature-list">
                      {aiResult.coreFeatures.map((f, i) => (
                        <li key={i}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <h3>🔒 Security & Scaling Protocols</h3>
                    <div className="security-grid">
                      {aiResult.security.map((s, i) => (
                        <div key={i} className="security-item">
                          <span className="security-icon">🛡️</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }} onClick={advancePhase}>
                  ⚙️ Generate AI Logic →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== PHASE 3: AI LOGIC ===== */}
        {phase === 3 && (
          <div className="phase-content animate-fade-in-up">
            <div className="phase-title-bar">
              <span className="phase-badge">Phase 3</span>
              <h2>AI Logic Engineering</h2>
              <p>System prompts, data schemas, and agentic logic chains generated for your micro-SaaS.</p>
            </div>
            {isThinking ? (
              <div className="glass-card thinking-card">
                <TypingIndicator />
                <p>Compiling system prompts, generating JSON schemas, and building agentic logic chains...</p>
              </div>
            ) : aiResult && (
              <div className="ai-logic-results">
                <div className="glass-card code-card">
                  <div className="code-header">
                    <span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" />
                    <span className="code-title">system_prompt.txt</span>
                  </div>
                  <pre className="code-block">{aiResult.systemPrompt}</pre>
                </div>

                <div className="glass-card code-card">
                  <div className="code-header">
                    <span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" />
                    <span className="code-title">intake_schema.json</span>
                  </div>
                  <pre className="code-block">{aiResult.jsonSchema}</pre>
                </div>

                <div className="glass-card">
                  <h3>🔄 Agentic Logic Pipeline</h3>
                  <div className="logic-pipeline">
                    {aiResult.agentLogic.map((step, i) => (
                      <div key={i} className="logic-step">
                        <div className="logic-step-num">{step.step}</div>
                        <div className="logic-step-content">
                          <span className="badge badge-blue">{step.action}</span>
                          <code className="text-mono">{step.handler}</code>
                          <span className="logic-arrow">→ {step.next}</span>
                        </div>
                        {i < aiResult.agentLogic.length - 1 && <div className="logic-connector" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card">
                  <h3>📊 Dashboard Widgets</h3>
                  <div className="widgets-grid">
                    {aiResult.dashboardWidgets.map((w, i) => (
                      <div key={i} className="widget-preview">
                        <span className="widget-type">{w.type}</span>
                        <h4>{w.name}</h4>
                        <code className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{w.source}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => {
                  setAiResult(null);
                  setPhase(4);
                  contentRef.current?.scrollIntoView({ behavior: 'smooth' });
                  simulateAI(AI_RESPONSES.sales);
                }}>
                  🚀 Generate Sales Playbook →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== PHASE 4: SALES ===== */}
        {phase === 4 && (
          <div className="phase-content animate-fade-in-up">
            <div className="phase-title-bar">
              <span className="phase-badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)', borderColor: 'rgba(16,185,129,0.25)' }}>Phase 4 — Final</span>
              <h2>Sales Automation & Go-to-Market</h2>
              <p>Your complete outreach arsenal and 30-day plan to secure your first 5 paying customers.</p>
            </div>
            {isThinking ? (
              <div className="glass-card thinking-card">
                <TypingIndicator />
                <p>Building your outreach arsenal, crafting scripts, and designing the 30-day playbook...</p>
              </div>
            ) : aiResult && (
              <div className="sales-results">
                <div className="glass-card">
                  <h3>🎯 Ideal Customer Profile</h3>
                  <div className="icp-grid">
                    {Object.entries(aiResult.idealCustomer).map(([k, v]) => (
                      <div key={k} className="icp-item">
                        <span className="icp-label">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="icp-value">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="scripts-grid">
                  <div className="glass-card code-card">
                    <div className="code-header">
                      <span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" />
                      <span className="code-title">📧 Email Outreach Script</span>
                    </div>
                    <pre className="code-block" style={{ fontSize: '0.85rem' }}>{aiResult.emailTemplate}</pre>
                  </div>

                  <div className="glass-card code-card">
                    <div className="code-header">
                      <span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" />
                      <span className="code-title">💼 LinkedIn DM Script</span>
                    </div>
                    <pre className="code-block" style={{ fontSize: '0.85rem' }}>{aiResult.linkedinScript}</pre>
                  </div>
                </div>

                <div className="glass-card">
                  <h3>📅 30-Day Outreach Schedule</h3>
                  <div className="schedule-grid">
                    {aiResult.thirtyDayPlan.map((week, i) => (
                      <div key={i} className="schedule-week">
                        <div className="week-label">{week.week}</div>
                        <ul>
                          {week.actions.map((a, j) => (
                            <li key={j}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card">
                  <h3>📈 Projected Results (30 Days)</h3>
                  <div className="results-grid">
                    {Object.entries(aiResult.projectedResults).map(([k, v]) => (
                      <div key={k} className="result-metric">
                        <span className="metric-value">{v}</span>
                        <span className="metric-label">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card completion-card text-center">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <h2>Your SaaS Plan is Complete!</h2>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
                    You now have a complete blueprint, AI logic, and sales playbook. Head to your Strategic Director Dashboard to manage everything.
                  </p>
                  <Link href="/dashboard" className="btn btn-primary btn-lg">
                    Open Dashboard →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .launch-page {
          position: relative;
          min-height: 100vh;
          padding: var(--space-2xl) 0 var(--space-4xl);
        }
        .launch-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
        }
        .launch-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(150px);
        }
        .launch-glow-1 {
          width: 500px; height: 500px;
          background: rgba(99, 102, 241, 0.08);
          top: 10%; right: -10%;
        }
        .launch-glow-2 {
          width: 400px; height: 400px;
          background: rgba(6, 182, 212, 0.06);
          bottom: 20%; left: -10%;
        }
        .launch-header {
          margin-bottom: var(--space-md);
        }
        .launch-subtitle {
          color: var(--text-tertiary);
          font-size: 1.05rem;
          margin-top: 0.5rem;
        }

        .phase-content {
          max-width: 900px;
          margin: 0 auto;
        }
        .phase-title-bar {
          margin-bottom: var(--space-xl);
        }
        .phase-title-bar h2 {
          margin: 0.75rem 0 0.4rem;
        }
        .phase-title-bar p {
          color: var(--text-tertiary);
        }
        .phase-badge {
          display: inline-block;
          padding: 0.3rem 0.9rem;
          font-size: 0.78rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent-blue);
          border: 1px solid rgba(59, 130, 246, 0.25);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Intake */
        .intake-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .intake-question {
          padding: var(--space-lg);
        }
        .intake-q-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.75rem;
        }
        .intake-q-icon {
          font-size: 1.3rem;
        }
        .intake-q-header label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        /* Thinking */
        .thinking-card {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-xl);
        }
        .thinking-card p {
          color: var(--text-secondary);
          font-style: italic;
        }

        /* Analysis Results */
        .result-card {
          padding: var(--space-xl);
          margin-bottom: var(--space-lg);
        }
        .result-card h3 {
          margin-bottom: 0.75rem;
        }
        .result-card p {
          line-height: 1.7;
        }
        .recommendation {
          background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08));
          border-color: rgba(16,185,129,0.2);
        }

        .pains-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }
        .pain-result-card {
          padding: var(--space-lg);
          cursor: pointer;
          transition: all var(--transition-base);
        }
        .pain-result-card.selected {
          border-color: var(--accent-blue);
          box-shadow: var(--shadow-glow);
        }
        .pain-header {
          margin-bottom: 0.75rem;
        }
        .pain-result-card h4 {
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        .pain-result-card p {
          font-size: 0.88rem;
          color: var(--text-tertiary);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .pain-revenue {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent-orange);
        }

        /* Blueprint */
        .blueprint-header-card {
          padding: var(--space-2xl);
          text-align: center;
          margin-bottom: var(--space-xl);
          background: var(--gradient-card);
        }
        .blueprint-meta {
          display: flex;
          justify-content: center;
          gap: var(--space-xl);
          margin-top: var(--space-md);
          font-weight: 600;
          color: var(--text-secondary);
        }
        .blueprint-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }
        .tech-stack-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .tech-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-glass);
        }
        .tech-label {
          text-transform: capitalize;
          color: var(--text-tertiary);
          font-size: 0.88rem;
        }
        .tech-value {
          color: var(--accent-cyan);
          font-size: 0.82rem;
        }
        .feature-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .feature-list li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .security-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .security-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        /* Code Blocks */
        .code-card {
          overflow: hidden;
        }
        .code-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid var(--border-glass);
        }
        .code-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .code-dot.red { background: #ef4444; }
        .code-dot.yellow { background: #f59e0b; }
        .code-dot.green { background: #10b981; }
        .code-title {
          margin-left: 8px;
          font-size: 0.82rem;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }
        .code-block {
          padding: 1.25rem;
          font-size: 0.82rem;
          line-height: 1.6;
          color: var(--text-secondary);
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* AI Logic */
        .ai-logic-results {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .logic-pipeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .logic-step {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          padding: var(--space-md) 0;
          position: relative;
        }
        .logic-step-num {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 2px solid var(--accent-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--accent-blue);
        }
        .logic-step-content {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }
        .logic-step-content code {
          font-size: 0.82rem;
          color: var(--accent-cyan);
          background: rgba(6, 182, 212, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .logic-arrow {
          color: var(--text-tertiary);
          font-size: 0.82rem;
        }
        .logic-connector {
          position: absolute;
          left: 17px;
          top: 52px;
          bottom: -4px;
          width: 2px;
          background: var(--border-glass);
        }
        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-md);
        }
        .widget-preview {
          padding: var(--space-md);
          background: rgba(0,0,0,0.2);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }
        .widget-type {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--accent-purple);
          font-weight: 600;
          letter-spacing: 0.08em;
        }
        .widget-preview h4 {
          font-size: 0.9rem;
          margin: 0.4rem 0;
        }

        /* Sales */
        .sales-results {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .icp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-md);
        }
        .icp-item {
          padding: var(--space-md);
          background: rgba(0,0,0,0.2);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }
        .icp-label {
          text-transform: capitalize;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          display: block;
          margin-bottom: 0.3rem;
        }
        .icp-value {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }
        .scripts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }
        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-md);
        }
        .schedule-week {
          padding: var(--space-md);
          background: rgba(0,0,0,0.2);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }
        .week-label {
          font-weight: 700;
          color: var(--accent-blue);
          font-size: 0.85rem;
          margin-bottom: 0.6rem;
        }
        .schedule-week ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .schedule-week li {
          font-size: 0.82rem;
          color: var(--text-tertiary);
          padding-left: 0.8rem;
          position: relative;
        }
        .schedule-week li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--accent-cyan);
          font-size: 0.7rem;
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-md);
        }
        .result-metric {
          text-align: center;
          padding: var(--space-md);
          background: rgba(0,0,0,0.2);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }
        .metric-value {
          display: block;
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--accent-green);
          margin-bottom: 0.3rem;
        }
        .metric-label {
          text-transform: capitalize;
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }
        .completion-card {
          padding: var(--space-2xl);
          background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08));
          border-color: rgba(16,185,129,0.2);
          margin-top: var(--space-lg);
        }

        @media (max-width: 768px) {
          .blueprint-grid {
            grid-template-columns: 1fr;
          }
          .blueprint-grid .glass-card:last-child {
            grid-column: span 1;
          }
          .security-grid {
            grid-template-columns: 1fr;
          }
          .scripts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';

/* ---- Typing Indicator ---- */
function TypingIndicator({ text = "Processing..." }) {
  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-indicator">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
      <p className="typing-text">{text}</p>
    </div>
  );
}

/* ---- Progress Bar ---- */
function ProgressBar({ currentPhase, totalPhases = 5 }) {
  const phases = ['Intake Matrix', 'Architecture', 'Logic Synthesis', 'GTM Strategy', 'Compilation'];
  return (
    <div className="progress-bar-container">
      <div className="progress-steps">
        {phases.map((label, i) => (
          <div key={i} className={`progress-step ${i < currentPhase ? 'completed' : ''} ${i === currentPhase ? 'active' : ''}`}>
            <div className="progress-dot glow-container">
              {i < currentPhase ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <span>0{i + 1}</span>
              )}
            </div>
            <span className="progress-label">{label}</span>
            {i < totalPhases - 1 && <div className="progress-line"><div className="progress-line-fill" /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== MAIN LAUNCH PAGE ===== */
export default function LaunchPage() {
  const [phase, setPhase] = useState(0);
  const [answers, setAnswers] = useState(['Technology', 'Software Engineering', '40', '$500', 'Startups needing CRM tools']);
  const [isThinking, setIsThinking] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  
  const [savedBlueprint, setSavedBlueprint] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);


  const contentRef = useRef(null);

  const questions = [
    { q: 'Target Industry or Sector Context', placeholder: 'e.g., Healthcare, E-commerce, Real Estate...', icon: '1️⃣' },
    { q: 'Primary Founder Skillset Matrix', placeholder: 'e.g., Sales, Full-stack Engineering, Operations...', icon: '2️⃣' },
    { q: 'Weekly Bandwidth Allocation (Hrs)', placeholder: 'e.g., 10, 40...', icon: '3️⃣' },
    { q: 'Infrastructure Operating Budget', placeholder: 'e.g., $50, $500...', icon: '4️⃣' },
    { q: 'Calculated Ideal Customer Profile', placeholder: 'e.g., Small business owners needing automation...', icon: '5️⃣' },
  ];

  const handleAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const callPhase = async (targetPhase) => {
    setIsThinking(true);
    setAiResult(null);
    setApiError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: targetPhase,
          answers,
          blueprint: savedBlueprint,
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
         let errMsg = data.error || 'The core engine failed to respond. Please try again.';
         if (data.error && typeof data.error === 'object' && data.error.message) {
            errMsg = data.error.message;
         }
         if (response.status === 503) {
            errMsg = "The MetaBox Core is currently experiencing extremely high demand. Please wait a few moments and reconnect.";
         }
         
         setApiError(errMsg);
         setIsThinking(false);
         return; 
      }

      setAiResult(data);
      if (targetPhase === 'blueprint') setSavedBlueprint(data);
      if (targetPhase === 'code') setGeneratedCode(data);

    } catch (err) {
      console.error(err);
      setApiError(err.message || "A network disruption disconnected the MetaBox Core.");
    } finally {
      setIsThinking(false);
    }
  };

  const advancePhase = () => {
    const nextPhase = phase + 1;
    setPhase(nextPhase);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    let apiPhasePhaseMap = {
      1: 'intake',
      2: 'blueprint',
      3: 'aiLogic',
      4: 'sales',
      5: 'code'
    };

    if (apiPhasePhaseMap[nextPhase]) {
      callPhase(apiPhasePhaseMap[nextPhase]);
    }
  };

  const handleIntakeSubmit = () => {
    const filled = answers.filter(a => a.trim().length > 0).length;
    if (filled < 3) {
      alert('Please complete the intake matrix parameters.');
      return;
    }
    advancePhase();
  };

  const handleDownloadZip = async () => {
    if (!generatedCode || !Array.isArray(generatedCode)) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      generatedCode.forEach(file => {
        zip.file(file.filename, file.content);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${savedBlueprint?.name?.replace(/\s+/g, '-').toLowerCase() || 'saas-system'}-core.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("ZIP Generation Failed:", err);
      alert("ZIP payload assembly failed.");
    } finally {
      setIsDownloading(false);
    }
  };



  return (
    <div className="launch-page">
      <div className="ambient-background">
         <div className="grid-overlay" />
         <div className="glow glow-blue" />
         <div className="glow glow-cyan" />
      </div>

      <div className="container" ref={contentRef} style={{ position: 'relative', zIndex: 10 }}>
        <div className="launch-header text-center animate-fade-in-up">
          <span className="badge badge-cyan" style={{ border: '1px solid var(--accent-cyan)', background: 'rgba(6,182,212,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 0 20px rgba(6,182,212,0.2)' }}>
            System Initialized // Node Active
          </span>
          <h1 style={{ marginTop: '1.5rem', fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-1px' }}>
             Deploy <span className="text-gradient">Sequence</span>
          </h1>
        </div>

        <ProgressBar currentPhase={phase} />

        {apiError && (
          <div className="glass-card animate-fade-in-up" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.05)', marginBottom: '2rem', padding: '2rem' }}>
             <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Processing Fault
             </h3>
             <p style={{ margin: '15px 0', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{apiError}</p>
             
             <button className="btn btn-secondary" style={{ marginTop: '10px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }} onClick={() => callPhase(Object.values({1:'intake',2:'blueprint',3:'aiLogic',4:'sales',5:'code'})[phase - 1])}>
               Refresh Data Stream ⟳
             </button>
          </div>
        )}

        {phase === 0 && (
          <div className="phase-content animate-fade-in-up">
            <div className="phase-title-bar text-center">
              <h2>Founder Variables Override</h2>
              <p>Populate the matrix below to generate customized intelligence.</p>
            </div>
            <div className="intake-form">
              {questions.map((q, i) => (
                <div key={i} className="intake-question glass-card hover-lift">
                  <div className="intake-q-header">
                    <span className="intake-q-icon">{q.icon}</span>
                    <label>{q.q}</label>
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder={q.placeholder}
                    value={answers[i]}
                    onChange={(e) => handleAnswer(i, e.target.value)}
                  />
                </div>
              ))}
              <div className="text-center" style={{ marginTop: '2rem' }}>
                <button className="btn btn-primary btn-lg shine-effect" style={{ padding: '1.2rem 4rem', fontSize: '1.1rem' }} onClick={handleIntakeSubmit}>
                  Initialize Box Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 1 && !apiError && (
          <div className="phase-content animate-fade-in-up">
            {isThinking ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                 <TypingIndicator text="Compiling strategic market vectors..." />
              </div>
            ) : aiResult && (
              <div className="analysis-results">
                <div className="glass-card result-card recommendation-card">
                  <h3>🎯 Calculated Action Path</h3>
                  <p className="text-mono" style={{ color: 'var(--accent-cyan)', marginBottom: '1rem', fontSize: '0.8rem' }}>&gt; Primary Directive Found</p>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>{aiResult.recommendation}</p>
                </div>
                <div className="pains-grid">
                  {aiResult.pains?.map((pain, i) => (
                    <div key={i} className="glass-card pain-result-card hover-lift">
                      <div className="pain-header">
                        <span className={`badge ${pain.severity?.includes('Critical') ? 'badge-orange' : 'badge-blue'}`}>{pain.severity} Risk</span>
                      </div>
                      <h4 style={{ color: '#fff' }}>{pain.title}</h4>
                      <p>{pain.desc}</p>
                      <div className="pain-revenue bg-black/50 px-3 py-2 rounded-md border border-white/10 mt-3 inline-block">
                        Proprietary Cost: <span style={{ color: 'var(--accent-green)' }}>{pain.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <button className="btn btn-primary btn-lg shine-effect mt-8" onClick={advancePhase}>
                    Construct Architectural Blueprint →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 2 && !apiError && (
          <div className="phase-content animate-fade-in-up">
            {isThinking ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                 <TypingIndicator text="Designing anti-bloat logic gates..." />
               </div>
            ) : aiResult && (
              <div className="blueprint-results">
                <div className="glass-card text-center mb-8 interactive-border" style={{ padding: '3rem' }}>
                  <span className="badge badge-cyan mb-4">Core Construct Ready</span>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{aiResult.name}</h2>
                  <p style={{ color: 'var(--accent-blue)', fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>{aiResult.tagline}</p>
                  <div className="flex justify-center gap-8 mt-6 font-mono text-sm opacity-70">
                    <span>BUILD_TIME: {aiResult.mvpTimeline}</span>
                    <span>OVERHEAD: {aiResult.estimatedCost}</span>
                  </div>
                </div>
                <div className="blueprint-grid">
                  <div className="glass-card">
                    <h3 className="mb-4 text-cyan-400">❖ Stack Matrix</h3>
                    <div className="flex flex-col gap-3">
                      {aiResult.architecture && Object.entries(aiResult.architecture).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="uppercase text-xs tracking-wider opacity-60">{key}</span>
                          <span className="font-mono text-sm text-blue-300">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card">
                    <h3 className="mb-4 text-green-400">❖ Execution Features</h3>
                    <ul className="flex flex-col gap-3">
                      {aiResult.coreFeatures?.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm opacity-80">
                          <span className="text-green-500 font-mono mt-1">►</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="text-center mt-10">
                  <button className="btn btn-primary btn-lg shine-effect" onClick={advancePhase}>
                    Compile Generative Logic Core →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 3 && !apiError && (
          <div className="phase-content animate-fade-in-up">
            {isThinking ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                 <TypingIndicator text="Training specialized system behavior..." />
               </div>
            ) : aiResult && (
              <div className="ai-logic-results">
                <div className="glass-card code-card mb-6">
                  <div className="code-header">
                    <span className="font-mono text-xs text-blue-400">/sys/core/prompt.sys</span>
                  </div>
                  <pre className="code-block text-gray-300">{aiResult.systemPrompt}</pre>
                </div>
                <div className="glass-card code-card">
                  <div className="code-header">
                    <span className="font-mono text-xs text-emerald-400">/sys/schema/payload.json</span>
                  </div>
                  <pre className="code-block text-emerald-200/70">{typeof aiResult.jsonSchema === 'string' ? aiResult.jsonSchema : JSON.stringify(aiResult.jsonSchema, null, 2)}</pre>
                </div>
                <div className="text-center mt-10">
                  <button className="btn btn-primary btn-lg shine-effect" onClick={advancePhase}>
                    Initialize Market Distribution Protocol →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 4 && !apiError && (
          <div className="phase-content animate-fade-in-up">
            {isThinking ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                 <TypingIndicator text="Calculating outreach permutations..." />
               </div>
            ) : aiResult && (
              <div className="sales-results">
                <div className="glass-card mb-6 border-l-4 border-l-blue-500">
                   <h3 className="mb-4">Target Node Structure</h3>
                   <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                      {Object.entries(aiResult.idealCustomer || {}).map(([key, val]) => (
                         <div key={key}>
                            <span className="block opacity-50 mb-1">{key}</span>
                            <span className="text-blue-300">{val}</span>
                         </div>
                      ))}
                   </div>
                </div>
                <div className="scripts-grid grid-cols-2 gap-6 mt-6">
                  <div className="glass-card code-card">
                    <div className="code-header"><span className="font-mono text-xs text-orange-400">outreach/mail_template.txt</span></div>
                    <pre className="code-block text-xs">{aiResult.emailTemplate}</pre>
                  </div>
                  <div className="glass-card code-card">
                    <div className="code-header"><span className="font-mono text-xs text-cyan-400">outreach/social_template.txt</span></div>
                    <pre className="code-block text-xs">{aiResult.linkedinScript}</pre>
                  </div>
                </div>
                <div className="text-center mt-12">
                  <button className="btn btn-primary btn-lg shine-effect py-5 px-10 text-lg shadow-[0_0_40px_rgba(16,185,129,0.4)] border border-green-500/50" onClick={advancePhase}>
                    ⚡ Execute Final Node Compile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 5 && !apiError && (
          <div className="phase-content animate-fade-in-up">
            {isThinking ? (
              <div className="glass-card" style={{ padding: '5rem 2rem', border: '1px solid var(--accent-cyan)', background: 'rgba(6,182,212,0.05)', boxShadow: '0 0 30px rgba(6,182,212,0.1)'}}>
                <div className="flex justify-center mb-8 scale-150">
                  <TypingIndicator text="" />
                </div>
                <h3 className="text-center text-2xl text-cyan-400 font-mono uppercase tracking-widest">Building Application Instance</h3>
                <p className="text-center mt-4 text-gray-400 opacity-80">Writing binary logic and containerizing scripts. Please stand by...</p>
              </div>
            ) : aiResult && (
              <div className="code-results">
                
                 {/* ── Success Banner ── */}
                <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2.5rem', overflow: 'hidden', position: 'relative', borderTop: '2px solid #10b981', boxShadow: '0 10px 50px rgba(16,185,129,0.2)', padding: '3rem 2rem' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.04)' }} />
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginBottom: '1rem' }}>System Synthesis Complete</h2>
                  <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    The core engine generated <strong style={{ color: '#f1f5f9' }}>{Array.isArray(aiResult) ? aiResult.length : 0} files</strong> for your platform.
                  </p>
                  
                  {/* ── Brand & Identity ── */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)', marginBottom: '2rem', textAlign: 'left' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '10px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img 
                        src={`https://logo.clearbit.com/${(blueprint?.name || 'saas').toLowerCase().replace(/\s+/g, '') + '.com'}`} 
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(blueprint?.name || 'S')}&background=06b6d4&color=fff&size=128&bold=true`; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="Logo"
                      />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem' }}>{blueprint?.name || "New SaaS Project"}</h4>
                      <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '2px 0 0' }}>AI-Generated Brand Identity</p>
                    </div>
                  </div>

                  <div style={{ display: 'block' }}>
                    <button onClick={handleDownloadZip} className="btn btn-primary btn-lg" style={{ padding: '1rem 2.5rem' }} disabled={isDownloading}>
                      {isDownloading ? 'Compressing...' : '⬇️ Download Source (.zip)'}
                    </button>
                  </div>
                </div>

                {/* ── File Explorer ── */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                    Generated Source Code
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{Array.isArray(aiResult) ? aiResult.length : 0} files</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {Array.isArray(aiResult) && aiResult.map((file, i) => {
                    const ext = file.filename.split('.').pop();
                    const langColors = { js: '#f59e0b', json: '#10b981', html: '#ec4899', css: '#8b5cf6', md: '#3b82f6', py: '#06b6d4' };
                    const dotColor = langColors[ext] || '#64748b';
                    return (
                      <div key={i} className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#e2e8f0', letterSpacing: '0.02em' }}>{file.filename}</span>
                            <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{ext}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'var(--font-mono)' }}>{file.content?.length || 0} chars</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(file.content); }}
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 10px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
                              onMouseOver={e => { e.target.style.color = '#60a5fa'; e.target.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                              onMouseOut={e => { e.target.style.color = '#94a3b8'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                            >Copy</button>
                          </div>
                        </div>
                        <pre style={{ padding: '1.25rem', margin: 0, background: '#040408', color: '#c9d1d9', fontSize: '0.78rem', lineHeight: 1.7, fontFamily: 'var(--font-mono)', overflowX: 'auto', maxHeight: 420, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{file.content}</pre>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', paddingBottom: '3rem' }}>
                  <Link href="/dashboard" style={{ display: 'inline-block', padding: '1rem 2.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#06b6d4', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '100px', transition: 'all 0.3s' }}>
                    Access System Dashboard →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

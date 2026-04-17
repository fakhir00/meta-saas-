'use client';
import { useState, useRef } from 'react';
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
          blueprint: savedBlueprint
        })
      });

      const data = await response.json();
      
      // If the API failed (e.g. 503 high demand), we handle it smoothly without throwing an error
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
         return; // exit early without crashing dev server
      }

      setAiResult(data);
      if (targetPhase === 'blueprint') setSavedBlueprint(data);
      if (targetPhase === 'code') setGeneratedCode(data);

    } catch (err) {
      // Hard network errors (like offline)
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
      a.download = `${savedBlueprint?.name?.replace(/\\s+/g, '-').toLowerCase() || 'saas-system'}-core.zip`;
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
         {/* Cyber grid and subtle glowing spheres */}
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

        {/* Global Error Handler */}
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

        {/* ===== PHASE 0: INTAKE ===== */}
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

        {/* ===== PHASE 1: ANALYSIS RESULTS ===== */}
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

        {/* ===== PHASE 2: BLUEPRINT ===== */}
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

        {/* ===== PHASE 3: AI LOGIC ===== */}
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

        {/* ===== PHASE 4: SALES ===== */}
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
                    ⚡ Execute Final Node Compile (Download Code)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PHASE 5: CODE GENERATION / DOWNLOAD ===== */}
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
                <div className="glass-card text-center mb-10 overflow-hidden relative border-t-2 border-t-green-500 shadow-[0_10px_50px_rgba(16,185,129,0.3)]">
                  <div className="absolute inset-0 bg-green-500/5 mix-blend-overlay"></div>
                  <div className="text-6xl mb-4">📦</div>
                  <h2 className="text-4xl font-bold mb-4 text-green-500 drop-shadow-md">System Synthesis Complete</h2>
                  <p className="text-gray-300 mb-8 max-w-xl mx-auto text-lg">
                    The core engine has successfully generated {aiResult.length || 0} secure files to initialize your platform. Extract this archive into your local directory.
                  </p>
                  
                  <button onClick={handleDownloadZip} className="btn btn-primary btn-lg shine-effect px-12 py-5 shadow-[0_0_40px_rgba(59,130,246,0.6)] text-xl font-bold" disabled={isDownloading}>
                    {isDownloading ? 'Compressing Package...' : '⬇️ Download Compiled Source (.zip)'}
                  </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-mono text-gray-300 tracking-wider uppercase border-b border-white/10 pb-2 inline-block">Directory Blueprint:</h3>
                </div>

                <div className="files-grid grid gap-6">
                  {Array.isArray(aiResult) && aiResult.map((file, i) => (
                    <div key={i} className="glass-card code-card" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="code-header bg-[#0a0a0f] border-b border-white/5 py-3 px-4 flex gap-2 items-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                        <span className="font-mono text-sm text-cyan-300 tracking-wider">{file.filename}</span>
                      </div>
                      <pre className="code-block max-h-[300px] overflow-y-auto font-mono text-[11px] p-6 bg-[#040406] text-gray-300">
                        {file.content}
                      </pre>
                    </div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <Link href="/dashboard" className="inline-block py-4 px-8 text-sm uppercase tracking-widest text-cyan-500 font-bold hover:text-cyan-400 hover:tracking-[0.15em] transition-all duration-300 border border-cyan-500/30 rounded-full hover:bg-cyan-500/10">
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

'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [promptValue, setPromptValue] = useState("");
  
  return (
    <div className="bolt-landing">
      
      {/* 🚀 Horizon Hero Section */}
      <section className="hero-section text-center">
         <div className="horizon-arch"></div>
         <div className="hero-content">
            <h1 className="hero-title">
               What will you <span className="text-gradient-blue font-italic">build</span> today?
            </h1>
            <p className="hero-subtitle">
               Create stunning apps & websites by chatting with the Neural Engine.
            </p>

            <div className="prompt-container">
               <div className="prompt-box">
                  <input 
                    type="text" 
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    placeholder="Let's build a dashboard to track local SaaS sales..." 
                    className="prompt-input"
                  />
                  <div className="prompt-actions">
                     <button className="icon-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                     </button>
                     <div className="flex-row gap-sm items-center">
                        <button className="plan-btn">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> Plan
                        </button>
                        <button className="build-btn" onClick={() => window.location.href='/launch'}>
                           Build now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                     </div>
                  </div>
               </div>
               <div className="import-row text-xs text-gray-500 font-medium">
                  <span>or import from</span>
                  <button className="import-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 4a4 4 0 1 1 0 8H8a4 4 0 0 1 4-8zm0 16a4 4 0 0 1-4-4v-4h4a4 4 0 0 1 0 8z"/></svg> Figma
                  </button>
                  <button className="import-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg> GitHub
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 🏎️ Design System Carousel */}
      <section className="carousel-section text-center">
         <div className="mb-md">
            <h2 className="title-bold">Your company's design system, now in NeuralSaaS</h2>
         </div>
         
         <div className="carousel-grid">
            <div className="ds-card ds-washpost">
               <div className="ds-content">
                  <div className="logo-placeholder">WP</div>
                  <h3>Washington Post</h3>
                  <p>In-House Design Guidelines</p>
               </div>
            </div>
            <div className="ds-card ds-porsche main-focus">
               <div className="ds-content">
                  <div className="logo-placeholder">P</div>
                  <h3>Enterprise</h3>
                  <p>Custom Brand Assets</p>
               </div>
            </div>
            <div className="ds-card ds-material">
               <div className="ds-content">
                  <div className="logo-placeholder">MU</div>
                  <h3>Material UI</h3>
                  <p>Design Components</p>
               </div>
            </div>
         </div>

         <div className="flex-row justify-center mt-sm gap-sm">
            <button className="ds-nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6"/></svg></button>
            <button className="ds-nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6"/></svg></button>
         </div>

         <div className="mt-md text-center">
            <p className="text-sm font-semibold mb-xs text-white">Use your team's components and brand guidelines to build for production</p>
            <p className="text-xs text-gray-400 mb-sm">Try one of the examples above or get started with your own.</p>
            <div className="flex-row justify-center gap-sm">
               <button className="ds-action-btn btn-outline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z M6.5 2v20"/></svg>
                  Learn more
               </button>
               <button className="ds-action-btn btn-blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Import your design system
               </button>
            </div>
         </div>
      </section>

      {/* 💼 Trusted Logos */}
      <section className="trusted-section">
         <p className="trusted-label">
            The AI Professional Web Coding Tool Trusted By
         </p>
         <div className="logo-flex">
            {['accenture', 'Google', 'intel', '∞ Meta', 'salesforce', 'shopify', 'stripe'].map((logo, i) => (
               <span key={i} className="trusted-logo">{logo}</span>
            ))}
         </div>
      </section>

      {/* 🔌 Central Nexus Connection */}
      <div className="central-nexus">
         <div className="nexus-line" />
         <div className="nexus-dot" />
      </div>

      {/* 📦 Power Grid Container */}
      <section className="power-grid-container text-center">
         <div className="mb-lg">
            <h2 className="title-bold title-lg mb-sm">Empowering founders <br/>with the <span className="text-white">most powerful AI agents</span></h2>
            <p className="text-gray-400 text-sm">NeuralSaaS does the heavy lifting for you, so you can focus on <br/>your vision instead of fighting deployment errors.</p>
         </div>

         {/* Grid Row 1 */}
         <div className="bento-grid">
            <div className="bento-card relative align-left w-66">
               <div className="relative z-10 p-md">
                  <h3 className="font-bold text-md mb-xs text-white">Always the best, without switching tools</h3>
                  <p className="text-xs text-gray-400 w-60 lh-relax">NeuralSaaS integrates the frontier coding agents from the top labs directly inside one familiar interface. No more AI anxiety or juggle.</p>
               </div>
               
               <div className="ui-mockup-agents">
                  <div className="agent-row active">
                     <span className="flex-row items-center gap-xs font-semibold text-orange-400"><div className="agent-icon bg-orange" /> Neural Core V2</span>
                  </div>
                  <div className="agent-row opacity-50">
                     <span className="flex-row items-center gap-xs font-semibold text-white"><div className="agent-icon bg-gray" /> LogicNet Pro</span>
                     <span className="text-micro text-gray-500">coming soon</span>
                  </div>
                  <div className="agent-row opacity-50">
                     <span className="flex-row items-center gap-xs font-semibold text-blue-400"><div className="agent-icon bg-blue rot-45" /> Quantum Flow</span>
                     <span className="text-micro text-gray-500">coming soon</span>
                  </div>
               </div>
            </div>

            <div className="bento-card text-center justify-center flex-col items-center w-33">
               <h2 className="massive-number text-white mb-xs">98%</h2>
               <h3 className="font-semibold text-gray-400 mb-sm">less errors</h3>
               <p className="text-xs text-gray-500 p-md">NeuralSaaS automatically tests, refactors, and iterates reducing errors so you keep building instead of fixing.</p>
            </div>
         </div>
         
         <div className="bento-grid mt-sm">
            <div className="bento-card relative align-left overflow-hidden group w-66 h-40">
               <div className="relative z-10 pt-md pl-md">
                  <h3 className="font-bold text-sm mb-xs text-white">Build big without breaking</h3>
                  <p className="text-xs text-gray-400 w-60 lh-relax">NeuralSaaS handles projects 1,000 times larger than the average template. Its improved context management handles infinite complexity.</p>
               </div>
               <div className="wireframe-mockup">
                  <div className="wf-left">
                     <div className="wf-bar w-50"></div><div className="wf-bar w-100"></div><div className="wf-bar w-75"></div>
                  </div>
                  <div className="wf-center">
                      <span className="wf-massive">1000x</span>
                  </div>
                  <div className="wf-right"></div>
               </div>
            </div>

            <div className="bento-card align-center flex-col justify-center h-40 border-top-pink bg-pink-gradient w-33">
               <div className="flex-row gap-xs mb-sm">
                  <div className="dot ring-pink"></div>
                  <div className="dot ring-purple"></div>
                  <div className="dot ring-blue"></div>
                  <div className="dot ring-indigo"></div>
               </div>
               <h3 className="font-bold mb-xs text-white text-sm">Build with <span className="text-pink">your</span> design system</h3>
               <p className="text-micro text-gray-400">Stop building from scratch. Start building on-brand.</p>
            </div>
         </div>
      </section>

      {/* 🚀 Scaling Infrastructure */}
      <section className="scaling-section text-center mt-xl">
         <div className="mb-lg">
            <h2 className="title-bold title-lg mb-xs">Everything you need to scale<br/><span className="text-white">Built in.</span></h2>
            <p className="text-sm text-gray-400">Stop stitching together platforms. Neural Cloud gives you enterprise-grade backend infrastructure including hosting and high-performance databases.</p>
         </div>

         <div className="max-w-5xl flex-row gap-sm h-60">
            
            <div className="scale-card flex-1 align-center overflow-hidden h-full group hover-border-blue text-center">
               <h4 className="text-white font-bold text-xs mt-sm z-10 relative">Unlimited databases</h4>
               <div className="absolute-center neon-fade group-hover-scale mt-lg">
                  <div className="infinity-glow-box">
                    <svg width="200" height="100" viewBox="0 0 200 100">
                       <path d="M 50 50 C 0 0, 0 100, 50 50 C 100 0, 100 100, 50 50" fill="none" stroke="url(#blueGrad)" strokeWidth="12" strokeLinecap="round" />
                       <path d="M 150 50 C 200 0, 200 100, 150 50 C 100 0, 100 100, 150 50" fill="none" stroke="url(#blueGrad)" strokeWidth="12" strokeLinecap="round" />
                       <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
                             <stop offset="0%" stopColor="#2563eb" />
                             <stop offset="100%" stopColor="#0ea5e9" />
                          </linearGradient>
                       </defs>
                    </svg>
                  </div>
               </div>
            </div>

            <div className="flex-col gap-sm flex-1 h-full">
               <div className="scale-card flex-1 overflow-hidden relative">
                  <h4 className="text-white font-bold text-xs pt-sm text-center z-10 relative">Enterprise-grade</h4>
                  <div className="enterprise-curve"></div>
               </div>
               <div className="flex-row gap-sm flex-1">
                  <div className="scale-card flex-1 flex-col justify-end p-sm text-center relative">
                     <h2 className="absolute-top-center number-shield">100</h2>
                     <p className="text-micro text-gray-400 lh-tight">SEO optimization built into every page from day one.</p>
                  </div>
                  <div className="scale-card flex-1 relative overflow-hidden flex-col justify-end p-sm">
                     <div className="publish-stamp">
                        <span className="font-bold text-md text-white">Publish</span>
                     </div>
                     <p className="text-micro text-gray-300 font-bold w-66">Global hosting with custom domains.</p>
                  </div>
               </div>
            </div>

            <div className="scale-card flex-1 align-center overflow-hidden h-full text-center group hover-elevate">
               <h4 className="text-white font-bold text-xs mt-sm z-10 relative">Authentication Flow</h4>
               <div className="absolute-center mt-lg">
                  <div className="auth-lock relative">
                    <div className="lock-shackle"></div>
                    <div className="lock-keyhole"></div>
                  </div>
               </div>
            </div>

         </div>
      </section>

      {/* ⚡ Superpowers Persona Grid */}
      <section className="superpowers-section text-center pt-xl pb-xl mt-lg">
         <div className="mb-lg relative z-10">
            <h2 className="font-semibold text-gray-400 text-md mb-micro">Whatever your role</h2>
            <h1 className="title-bold title-xl drop-shadow-glow">NeuralSaaS gives you superpowers</h1>
            <p className="text-micro text-gray-500 mt-xs tracking-wide txt-uppercase">From idea to live product, adapting to the way you work.</p>
         </div>

         <div className="max-w-5xl bento-grid mt-lg w-full">
            
            <div className="bento-card bg-card-deep hover-bg-deeper p-md align-left relative overflow-hidden">
               <h4 className="text-white font-bold text-sm mb-micro z-10 relative">Product managers</h4>
               <p className="text-micro text-gray-400 lh-relax mb-md z-10 relative">Go from insight to prototype in hours, not weeks.</p>
               
               <div className="mock-panel border-box mb-sm">
                  <p className="text-micro text-gray-300 font-bold">Version history</p>
                  <p className="text-nano text-gray-500 mb-xs">Review changes, revert to a version</p>
                  <div className="mock-search"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search for a version...</div>
               </div>
               <div className="mock-panel border-box">
                  <p className="text-micro text-gray-300 font-bold flex-row items-center gap-xs"><div className="dot bg-green"></div> Project: SaaS Dashboard</p>
                  <p className="text-nano text-gray-500 mt-micro">Published • Ready for User Pilots</p>
               </div>
            </div>

            <div className="bento-card border-box bg-card-deep p-md align-left relative">
               <h4 className="text-white font-bold text-sm mb-micro">Entrepreneurs</h4>
               <p className="text-micro text-gray-400 lh-relax mb-md">Launch a full business in days. From landing to logic, all in one flow.</p>
               
               <div className="mock-panel border-box">
                  <p className="text-micro text-gray-300 font-bold mb-xs">Publish your project</p>
                  <p className="text-nano text-gray-400 flex-row items-center gap-xs mb-micro"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg> https://app.neuralsaas.com/my-app</p>
                  <p className="text-nano text-green flex-row items-center gap-xs mb-xs"><div className="dot bg-green"></div> Status: Production Live</p>
                  <div className="mock-btn font-bold">Update App</div>
               </div>
            </div>

            <div className="bento-card border-box bg-card-deep p-md align-left overflow-hidden relative">
               <h4 className="text-white font-bold text-sm mb-micro z-10 relative">Marketers</h4>
               <p className="text-micro text-gray-400 lh-relax w-75 z-10 relative">Spin up high-performing campaign pages with built-in speed.</p>
               
               <div className="mock-chart-gradient"></div>
               <svg className="mock-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                 <path d="M0,30 L0,20 C10,20 15,10 25,10 C35,10 40,25 50,25 C60,25 65,5 75,5 C85,5 90,15 100,15 L100,30 Z" fill="rgba(59,130,246,0.3)" stroke="rgba(96,165,250,0.8)" strokeWidth="1" />
               </svg>
            </div>
            
         </div>
      </section>

      <style jsx>{`
        /* Minimalist Modern Aesthetics */
        * { box-sizing: border-box; }
        
        .bolt-landing {
          background-color: #030303;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .text-center { text-align: center; }
        .text-white { color: #ffffff; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-gray-300 { color: #d1d5db; }
        .text-blue-400 { color: #60a5fa; }
        .text-orange-400 { color: #fb923c; }
        .text-pink { color: #ec4899; }
        .text-green { color: #4ade80; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-italic { font-style: italic; font-weight: 800; padding-right: 0.25rem; }
        
        .title-xl { font-size: 2.5rem; }
        .title-lg { font-size: 2rem; }
        .title-bold { font-weight: 800; line-height: 1.2; }
        .text-md { font-size: 1.1rem; }
        .text-sm { font-size: 0.95rem; }
        .text-xs { font-size: 0.85rem; }
        .text-micro { font-size: 0.70rem; }
        .text-nano { font-size: 0.60rem; }
        
        .mb-xs { margin-bottom: 0.5rem; }
        .mb-sm { margin-bottom: 1rem; }
        .mb-md { margin-bottom: 1.5rem; }
        .mb-lg { margin-bottom: 3rem; }
        .mt-xs { margin-top: 0.5rem; }
        .mt-sm { margin-top: 1rem; }
        .mt-md { margin-top: 1.5rem; }
        .mt-xl { margin-top: 5rem; }
        .pt-md { padding-top: 1.5rem; }
        .pt-xl { padding-top: 5rem; }
        .pb-xl { padding-bottom: 5rem; }
        .pl-md { padding-left: 1.5rem; }
        .p-md { padding: 1.5rem; }
        
        .flex-row { display: flex; flex-direction: row; }
        .flex-col { display: flex; flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .justify-end { justify-content: flex-end; }
        .gap-sm { gap: 1rem; }
        .gap-xs { gap: 0.5rem; }
        .flex-1 { flex: 1; }
        .relative { position: relative; }
        .absolute-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        .absolute-top-center { position: absolute; left: 50%; top: 1rem; transform: translateX(-50%); }
        .z-10 { z-index: 10; }
        .overflow-hidden { overflow: hidden; }

        .align-left { text-align: left; }
        .border-box { border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }

        /* 🚀 Horizon Hero */
        .hero-section {
          width: 100%;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 15vh;
          position: relative;
          background: linear-gradient(180deg, #030303 0%, #060913 100%);
        }
        
        .horizon-arch {
          position: absolute;
          bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 150vw;
          height: 100vw;
          border-radius: 50%;
          box-shadow: inset 0 -30px 40px -10px rgba(59, 130, 246, 0.8), inset 0 -5px 15px rgba(255, 255, 255, 0.8);
          background: transparent;
          z-index: 0;
          pointer-events: none;
        }

        .hero-content { z-index: 10; position: relative; width: 100%; }

        .hero-title {
          font-size: 3.5rem; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 0.5rem;
          text-shadow: 0 4px 20px rgba(255,255,255,0.2);
        }
        
        .text-gradient-blue {
          background: linear-gradient(90deg, #93c5fd, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 10px rgba(59,130,246,0.5));
        }
        
        .hero-subtitle { color: #9ca3af; margin-bottom: 2rem; font-size: 1.1rem; }

        .prompt-container { max-width: 650px; width: 90%; margin: 0 auto; }
        .prompt-box {
           background: #111111; border: 1px solid #222; border-radius: 12px; padding: 4px;
           display: flex; flex-direction: column;
           box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05);
           transition: border-color 0.3s;
        }
        .prompt-box:focus-within { border-color: rgba(59, 130, 246, 0.4); }
        .prompt-input {
           width: 100%; background: transparent; border: none; color: #fff; padding: 1.2rem 1rem;
           font-size: 1.1rem; outline: none; font-family: inherit;
        }
        .prompt-input::placeholder { color: #555; }
        
        .prompt-actions {
           display: flex; justify-content: space-between; align-items: center; padding: 0.5rem;
           background: #18181A; border-top: 1px solid #222; border-radius: 0 0 10px 10px;
        }
        .icon-btn { background: #252525; padding: 6px; border-radius: 8px; color: #aaa; transition: 0.2s; border: none; cursor: pointer; }
        .plan-btn { background: transparent; border: none; color: #9ca3af; font-size: 0.85rem; display: flex; align-items: center; gap: 4px; cursor: pointer; }
        .build-btn {
           background: #2563eb; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
           display: flex; align-items: center; gap: 4px; transition: 0.2s; border: none; cursor: pointer;
        }
        .build-btn:hover { background: #3b82f6; transform: scale(1.02); }
        
        .import-row { display: flex; justify-content: center; align-items: center; gap: 0.75rem; margin-top: 1rem; }
        .import-badge {
           background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 8px;
           display: flex; align-items: center; gap: 4px; transition: 0.2s; color: #9ca3af; cursor: pointer; font-size: 0.75rem;
        }

        /* 🏎️ Design Carousel */
        .carousel-section { width: 100%; padding: 4rem 1rem 6rem; position: relative; }
        .carousel-grid {
           display: flex; justify-content: center; gap: 1.5rem; overflow: hidden; padding-bottom: 2.5rem;
           mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .ds-card {
           width: 250px; height: 350px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
           position: relative; overflow: hidden; transition: 0.4s; opacity: 0.5; transform: scale(0.9) perspective(800px) rotateY(-10deg);
        }
        .ds-card.main-focus { opacity: 1; transform: scale(1) perspective(800px) rotateY(0deg); z-index: 2; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .ds-washpost { background: linear-gradient(to bottom, #1e293b, #0f172a); }
        .ds-porsche { background: linear-gradient(to bottom, #78350f, #451a03); }
        .ds-material { background: linear-gradient(to bottom, #4c1d95, #2e1065); }
        .ds-content { position: absolute; bottom: 0; left: 0; width: 100%; padding: 1.5rem; text-align: left; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); }
        .logo-placeholder { width: 32px; height: 32px; border-radius: 50%; background: #fff; color: #000; display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 12px; margin-bottom: 8px; }

        /* 📦 Power Grids */
        .power-grid-container { width: 100%; max-width: 1024px; padding: 5rem 1rem 0; margin: 0 auto; }
        .bento-grid { display: flex; gap: 1rem; width: 100%; margin-bottom: 1rem; }
        .bento-card { background: #101012; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; position: relative; transition: 0.3s; }
        .bento-card:hover { border-color: rgba(255,255,255,0.1); }
        .w-66 { width: 66%; } .w-33 { width: 33%; }
        
        .ui-mockup-agents {
           position: absolute; right: 1rem; top: 2rem; bottom: 2rem; width: 14rem; background: #111; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem;
        }
        .agent-row { display: flex; justify-content: space-between; padding: 0.4rem 0.6rem; border-radius: 6px; margin-bottom: 0.4rem; font-size: 0.75rem; }
        .agent-row.active { background: rgba(59,130,246,0.1); color: #fff; }
        .agent-icon { width: 12px; height: 12px; border-radius: 3px; }
        .bg-orange { background: #fb923c; }

        .massive-number { font-size: 3.5rem; font-weight: 800; line-height: 1; }
        
        /* Infrastructure Icons */
        .scale-card { background: #0a0a0c; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem; }
        .enterprise-curve { position: absolute; bottom: 0; left: 0; width: 100%; height: 50%; border-top: 2px solid #3b82f6; border-radius: 100% 100% 0 0; opacity: 0.3; }
        .number-shield { background: #222; border: 1px solid #444; border-radius: 30px; padding: 0.5rem 1rem; font-size: 1.5rem; font-weight: 800; }
        
        /* Persona Cards */
        .mock-panel { background: #151515; border: 1px solid #222; border-radius: 8px; padding: 0.8rem; margin-top: 1rem; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .bg-green { background: #22c55e; }
        .mock-btn { background: #2563eb; color: #fff; text-align: center; padding: 0.4rem; border-radius: 4px; font-size: 0.7rem; margin-top: 0.5rem; }

        @media (max-width: 768px) {
           .bento-grid { flex-direction: column; }
           .w-66, .w-33 { width: 100%; }
           .ui-mockup-agents { display: none; }
           .hero-title { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}

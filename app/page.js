'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ThreeDScene = dynamic(() => import('@/components/ThreeDScene'), { ssr: false });

/* ── Intersection Observer Hook ── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Animated Counter ── */
function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Typing Terminal ── */
function TypingTerminal() {
  const lines = [
    { text: '$ metabox init --blueprint "AI CRM for realtors"', color: '#94a3b8', delay: 0 },
    { text: '✓ Industry analyzed: Real Estate', color: '#4ade80', delay: 800 },
    { text: '✓ Architecture: Next.js + Supabase + Stripe', color: '#4ade80', delay: 1600 },
    { text: '✓ 6 core features identified', color: '#4ade80', delay: 2400 },
    { text: '$ metabox deploy --production', color: '#94a3b8', delay: 3200 },
    { text: '⚡ Building frontend...  done', color: '#60a5fa', delay: 4000 },
    { text: '⚡ Compiling API routes... done', color: '#60a5fa', delay: 4800 },
    { text: '⚡ Provisioning database... done', color: '#60a5fa', delay: 5600 },
    { text: '🚀 Live at → https://ai-crm.metabox.app', color: '#f472b6', delay: 6400 },
  ];
  const [visible, setVisible] = useState(0);
  const [ref, inView] = useInView(0.4);

  useEffect(() => {
    if (!inView) return;
    const timers = lines.map((l, i) => setTimeout(() => setVisible(i + 1), l.delay));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="live-terminal">
      <div className="term-bar">
        <div className="term-dots"><span /><span /><span /></div>
        <span className="term-title">metabox-cli — zsh</span>
      </div>
      <div className="term-body">
        {lines.slice(0, visible).map((l, i) => (
          <div key={i} className="term-line" style={{ color: l.color, animationDelay: `${i * 0.05}s` }}>{l.text}</div>
        ))}
        {visible < lines.length && <span className="term-cursor">▋</span>}
      </div>
    </div>
  );
}

/* ── FAQ Item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-card ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-header">
        <h3>{q}</h3>
        <span className="faq-icon">{open ? '−' : '+'}</span>
      </div>
      <div className="faq-body">
        <div className="faq-body-inner"><p>{a}</p></div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════ */
export default function Home() {
  const [heroRef, heroInView] = useInView(0.1);
  const [featRef, featInView] = useInView(0.15);

  const features = [
    { icon: '🧠', title: 'AI Architecture', desc: 'Generates a custom tech stack and database schema tailored to your niche in seconds.', accent: '#8b5cf6' },
    { icon: '⚡', title: 'Instant Code Gen', desc: 'Full-stack production code — frontend, API, database — written and tested automatically.', accent: '#3b82f6' },
    { icon: '🎯', title: 'GTM Strategy', desc: 'AI-powered go-to-market playbook with cold email templates, outreach scripts, and ICP analysis.', accent: '#10b981' },
    { icon: '🌐', title: 'One-Click Deploy', desc: 'Custom domains, SSL, and global CDN. Your SaaS goes live the moment you hit deploy.', accent: '#f59e0b' },
    { icon: '🔐', title: 'Auth & Payments', desc: 'Built-in authentication flows and Stripe integration. Start charging from day one.', accent: '#ec4899' },
    { icon: '📊', title: 'Live Analytics', desc: 'Real-time dashboard with MRR, churn, user growth, and AI-powered insights.', accent: '#06b6d4' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Founder, TalentFlow', quote: 'MetaBox replaced my entire dev team for the MVP phase. I went from idea to paying customers in 72 hours.', avatar: 'SC' },
    { name: 'Marcus Rodriguez', role: 'CEO, DataPilot', quote: 'The AI architecture suggestions were spot-on. It even recommended a pricing model I hadn\'t considered.', avatar: 'MR' },
    { name: 'Aisha Patel', role: 'Product Lead, NexGen', quote: 'We use MetaBox to rapidly prototype client projects. What used to take 3 weeks now takes an afternoon.', avatar: 'AP' },
  ];

  const faqs = [
    { q: 'What exactly is a "Box"?', a: 'A Box is a complete, deployable SaaS application. It includes your database schema, frontend code, API routes, authentication, and business logic — all integrated and production-ready.' },
    { q: 'Do I own the code MetaBox generates?', a: 'Absolutely. On the Founder and Studio plans, you can export your entire project as a clean codebase. It\'s yours — no lock-in, no royalties.' },
    { q: 'Do I need coding experience?', a: 'Not at all. MetaBox is designed for non-technical founders. Just describe your business idea in plain English, and the AI builds everything for you.' },
    { q: 'How is this different from no-code tools?', a: 'No-code tools give you templates. MetaBox gives you custom, production-grade code that\'s fully extensible. You get a real codebase, not a walled garden.' },
    { q: 'Can I use my own domain?', a: 'Yes. All paid plans support custom domains with automatic SSL provisioning. Your SaaS runs on your brand, not ours.' },
  ];

  return (
    <div className="landing">

      {/* ═══ SECTION 1: 3D HERO ═══ */}
      <section className="hero" ref={heroRef}>
        <div className="hero-orb"><ThreeDScene /></div>
        <div className="hero-gradient" />

        <div className={`hero-inner ${heroInView ? 'visible' : ''}`}>
          <div className="hero-badge">
            <span className="badge-dot" />
            Now in Public Beta — Free to Start
          </div>

          <h1 className="hero-h1">
            Turn Your Idea Into a<br />
            <span className="hero-gradient-text">Live SaaS Product</span>
          </h1>

          <p className="hero-sub">
            Describe your business. MetaBox AI builds the architecture, writes the code,<br className="hide-mobile" />
            generates sales strategies, and deploys it — all in under 5 minutes.
          </p>

          <div className="hero-ctas">
            <Link href="/launch" className="cta-primary">
              Start Building Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <button className="cta-secondary" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Watch it Build
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-pill"><strong>2,400+</strong> Boxes Deployed</div>
            <div className="stat-pill"><strong>98%</strong> Less Errors</div>
            <div className="stat-pill"><strong>&lt; 5 min</strong> to MVP</div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: SOCIAL PROOF ═══ */}
      <section className="social-proof">
        <p className="proof-label">Trusted by founders and teams at</p>
        <div className="marquee-track">
          <div className="marquee-inner">
            {['Google', 'Stripe', 'Shopify', 'Accenture', 'Intel', 'Salesforce', 'Meta', 'Vercel', 'Google', 'Stripe', 'Shopify', 'Accenture', 'Intel', 'Salesforce', 'Meta', 'Vercel'].map((name, i) => (
              <span key={i} className="logo-text">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: HOW IT WORKS ═══ */}
      <section className="how-section">
        <div className="section-header">
          <span className="section-badge">How It Works</span>
          <h2>Three steps. Zero friction.</h2>
          <p>From napkin sketch to live product — MetaBox handles every layer.</p>
        </div>

        <div className="steps-grid">
          {[
            { num: '01', title: 'Describe', desc: 'Tell MetaBox about your business idea, target customer, and budget. Our AI intake system maps the opportunity space.', icon: '💬' },
            { num: '02', title: 'Build', desc: 'MetaBox architects the stack, writes production code, and wires up auth, payments, and analytics automatically.', icon: '🔨' },
            { num: '03', title: 'Deploy', desc: 'One click and you\'re live. Custom domain, SSL, database — everything provisioned and ready for customers.', icon: '🚀' },
          ].map((s, i) => (
            <div key={i} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 4: LIVE TERMINAL DEMO ═══ */}
      <section className="demo-section" id="demo">
        <div className="section-header">
          <span className="section-badge">Live Demo</span>
          <h2>Watch MetaBox build a SaaS in real-time</h2>
          <p>This is what happens when you hit "Build". No smoke and mirrors.</p>
        </div>
        <TypingTerminal />
      </section>

      {/* ═══ SECTION 5: FEATURE BENTO GRID ═══ */}
      <section className="features-section" ref={featRef}>
        <div className="section-header">
          <span className="section-badge">Superpowers</span>
          <h2>Everything you need. Nothing you don't.</h2>
          <p>MetaBox isn't another template. It's an AI co-founder that builds with you.</p>
        </div>

        <div className={`bento ${featInView ? 'visible' : ''}`}>
          {features.map((f, i) => (
            <div key={i} className="bento-card" style={{ '--accent': f.accent, animationDelay: `${i * 0.1}s` }}>
              <div className="bento-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="bento-glow" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 6: STATS ═══ */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-block">
            <div className="stat-num"><Counter end={3000} suffix="+" /></div>
            <div className="stat-label">SaaS Products Launched</div>
          </div>
          <div className="stat-block">
            <div className="stat-num"><Counter end={50} suffix="K+" /></div>
            <div className="stat-label">Lines of Code Generated</div>
          </div>
          <div className="stat-block">
            <div className="stat-num"><Counter end={2} suffix="M+" /></div>
            <div className="stat-label">Revenue Enabled</div>
          </div>
          <div className="stat-block">
            <div className="stat-num"><Counter end={4.9} suffix="/5" duration={1500} /></div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7: PRICING ═══ */}
      <section className="pricing-section" id="pricing">
        <div className="section-header">
          <span className="section-badge">Pricing</span>
          <h2>Simple, transparent pricing</h2>
          <p>Start free. Scale when you're ready.</p>
        </div>

        <div className="price-grid">
          <div className="price-card">
            <h4>Starter</h4>
            <div className="price-amount">$0</div>
            <p className="price-period">Forever free</p>
            <ul>
              <li>1 Active Box</li>
              <li>Draft Deployment</li>
              <li>Community Support</li>
              <li>Basic Analytics</li>
            </ul>
            <Link href="/launch" className="price-btn secondary">Start Free</Link>
          </div>

          <div className="price-card featured">
            <div className="featured-tag">Most Popular</div>
            <h4>Founder</h4>
            <div className="price-amount">$49<span>/mo</span></div>
            <p className="price-period">Everything to launch and grow</p>
            <ul>
              <li>10 Active Boxes</li>
              <li>Custom Domains</li>
              <li>Priority AI Queue</li>
              <li>GTM Copy Engine</li>
              <li>Code Export</li>
            </ul>
            <Link href="/launch" className="price-btn primary">Get Started</Link>
          </div>

          <div className="price-card">
            <h4>Studio</h4>
            <div className="price-amount">$199<span>/mo</span></div>
            <p className="price-period">For agencies & power users</p>
            <ul>
              <li>Unlimited Boxes</li>
              <li>Full Code Export</li>
              <li>Direct API Access</li>
              <li>White-Label Options</li>
              <li>24/7 Concierge</li>
            </ul>
            <Link href="/launch" className="price-btn secondary">Go Studio</Link>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8: TESTIMONIALS ═══ */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-badge">Wall of Love</span>
          <h2>Founders who shipped with MetaBox</h2>
        </div>
        <div className="test-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="test-card">
              <p className="test-quote">"{t.quote}"</p>
              <div className="test-author">
                <div className="test-avatar">{t.avatar}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 9: FAQ ═══ */}
      <section className="faq-section">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2>Got questions?</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ═══ SECTION 10: FINAL CTA ═══ */}
      <section className="final-cta">
        <div className="cta-glow" />
        <h2>Ready to build your next big thing?</h2>
        <p>Join 3,000+ founders who launched their SaaS with MetaBox.</p>
        <Link href="/launch" className="cta-primary large">
          Start Building — It's Free
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </section>

      {/* ═══ STYLES ═══ */}
      <style jsx>{`
        /* ── Globals ── */
        .landing { width: 100%; overflow-x: hidden; }

        .section-header { text-align: center; max-width: 700px; margin: 0 auto 4rem; }
        .section-header h2 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.03em; }
        .section-header p { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; }
        .section-badge {
          display: inline-block; padding: 6px 16px; border-radius: 100px;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);
          color: #60a5fa; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 1.25rem;
        }
        .hide-mobile { display: inline; }

        /* ── 1. HERO ── */
        .hero {
          position: relative; min-height: 100vh; display: flex; align-items: center;
          justify-content: center; text-align: center; padding: 0 1.5rem;
          overflow: hidden;
        }
        .hero-orb { position: absolute; inset: 0; z-index: 0; opacity: 0.7; pointer-events: none; }
        .hero-gradient {
          position: absolute; inset: 0; z-index: 1;
          background: radial-gradient(ellipse 80% 60% at 50% 40%, transparent 40%, #050811 85%);
          pointer-events: none;
        }
        .hero-inner {
          position: relative; z-index: 10; max-width: 800px;
          opacity: 0; transform: translateY(40px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .hero-inner.visible { opacity: 1; transform: translateY(0); }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25);
          padding: 6px 18px; border-radius: 100px; font-size: 0.8rem;
          color: #4ade80; font-weight: 600; margin-bottom: 2rem;
        }
        .badge-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #4ade80;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(74,222,128,0.4)} 50%{opacity:0.8;box-shadow:0 0 0 6px rgba(74,222,128,0)} }

        .hero-h1 {
          font-size: clamp(2.5rem, 6vw, 4.2rem); font-weight: 900;
          line-height: 1.1; letter-spacing: -0.04em; margin-bottom: 1.5rem;
          color: #f1f5f9;
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6, #60a5fa);
          background-size: 300% 300%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-flow 6s ease infinite;
        }
        @keyframes gradient-flow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

        .hero-sub { color: #94a3b8; font-size: 1.15rem; line-height: 1.7; margin-bottom: 2.5rem; }

        .hero-ctas { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem; }

        .cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 14px; font-weight: 700; font-size: 1rem;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff; text-decoration: none; border: none;
          box-shadow: 0 6px 30px rgba(59,130,246,0.35);
          transition: all 0.3s ease; cursor: pointer;
        }
        .cta-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(59,130,246,0.5); color: #fff; }
        .cta-primary.large { padding: 18px 42px; font-size: 1.15rem; border-radius: 16px; }

        .cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 14px; font-weight: 600; font-size: 1rem;
          background: rgba(255,255,255,0.04); color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
          transition: all 0.3s ease;
        }
        .cta-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }

        .hero-stats { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .stat-pill {
          padding: 8px 20px; border-radius: 100px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          font-size: 0.85rem; color: #cbd5e1;
        }
        .stat-pill strong { color: #f1f5f9; }

        /* ── 2. SOCIAL PROOF ── */
        .social-proof {
          padding: 3rem 0; border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          overflow: hidden; text-align: center;
        }
        .proof-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 1.5rem; }
        .marquee-track { overflow: hidden; mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); }
        .marquee-inner {
          display: flex; gap: 4rem; white-space: nowrap;
          animation: marquee 30s linear infinite;
        }
        .logo-text { font-size: 1.1rem; font-weight: 700; color: #334155; letter-spacing: 0.02em; }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        /* ── 3. HOW IT WORKS ── */
        .how-section { padding: 7rem 1.5rem; max-width: 1200px; margin: 0 auto; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .step-card {
          position: relative; padding: 2.5rem 2rem; border-radius: 24px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.4s ease; text-align: left;
        }
        .step-card:hover {
          transform: translateY(-8px) perspective(600px) rotateX(2deg);
          border-color: rgba(59,130,246,0.3);
          box-shadow: 0 20px 60px rgba(59,130,246,0.1);
        }
        .step-num {
          position: absolute; top: 1.5rem; right: 1.5rem;
          font-size: 3rem; font-weight: 900; color: rgba(59,130,246,0.06);
          line-height: 1;
        }
        .step-icon { font-size: 2.5rem; margin-bottom: 1.5rem; }
        .step-card h3 { font-size: 1.35rem; margin-bottom: 0.75rem; color: #f1f5f9; font-weight: 700; }
        .step-card p { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }

        /* ── 4. LIVE TERMINAL ── */
        .demo-section { padding: 7rem 1.5rem; max-width: 800px; margin: 0 auto; }
        .live-terminal {
          background: #0a0a0f; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(59,130,246,0.06);
        }
        .term-bar {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; background: #111118;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .term-dots { display: flex; gap: 6px; }
        .term-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .term-dots span:nth-child(1) { background: #ff5f56; }
        .term-dots span:nth-child(2) { background: #ffbd2e; }
        .term-dots span:nth-child(3) { background: #27c93f; }
        .term-title { font-family: var(--font-mono); font-size: 0.75rem; color: #64748b; }
        .term-body {
          padding: 1.5rem; font-family: var(--font-mono); font-size: 0.85rem;
          line-height: 1.8; min-height: 280px;
        }
        .term-line { animation: fadeInUp 0.3s ease forwards; }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .term-cursor { color: #60a5fa; animation: blink-cursor 1s step-end infinite; }
        @keyframes blink-cursor { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── 5. FEATURE BENTO ── */
        .features-section { padding: 7rem 1.5rem; max-width: 1200px; margin: 0 auto; }
        .bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .bento.visible .bento-card { opacity: 1; transform: translateY(0); }
        .bento-card {
          position: relative; padding: 2.5rem 2rem; border-radius: 20px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.4s ease; overflow: hidden; text-align: left;
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .bento-card:hover {
          border-color: var(--accent, #3b82f6);
          box-shadow: 0 0 40px color-mix(in srgb, var(--accent, #3b82f6) 15%, transparent);
          transform: translateY(-4px) !important;
        }
        .bento-icon { font-size: 2.2rem; margin-bottom: 1.25rem; }
        .bento-card h3 { font-size: 1.15rem; margin-bottom: 0.6rem; color: #f1f5f9; font-weight: 700; }
        .bento-card p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }
        .bento-glow {
          position: absolute; bottom: -40px; right: -40px; width: 120px; height: 120px;
          border-radius: 50%; background: var(--accent, #3b82f6); opacity: 0.04;
          filter: blur(40px); pointer-events: none;
        }

        /* ── 6. STATS ── */
        .stats-section {
          padding: 5rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; max-width: 1000px; margin: 0 auto; text-align: center; }
        .stat-num { font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: #f1f5f9; margin-bottom: 0.5rem; }
        .stat-label { font-size: 0.9rem; color: #64748b; }

        /* ── 7. PRICING ── */
        .pricing-section { padding: 7rem 1.5rem; max-width: 1100px; margin: 0 auto; }
        .price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; align-items: start; }
        .price-card {
          position: relative; padding: 3rem 2rem; border-radius: 24px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          text-align: left; transition: all 0.3s ease;
        }
        .price-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.12); }
        .price-card.featured {
          background: linear-gradient(145deg, rgba(59,130,246,0.06), rgba(139,92,246,0.04));
          border-color: rgba(59,130,246,0.3);
          box-shadow: 0 20px 60px rgba(59,130,246,0.1);
        }
        .featured-tag {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          padding: 4px 16px; border-radius: 100px; font-size: 0.75rem; font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff;
        }
        .price-card h4 { font-size: 1rem; color: #94a3b8; font-weight: 600; margin-bottom: 0.5rem; }
        .price-amount { font-size: 3rem; font-weight: 900; color: #f1f5f9; margin-bottom: 0.25rem; }
        .price-amount span { font-size: 1rem; font-weight: 500; color: #64748b; }
        .price-period { font-size: 0.85rem; color: #64748b; margin-bottom: 2rem; }
        .price-card ul { list-style: none; padding: 0; margin: 0 0 2.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
        .price-card li { font-size: 0.9rem; color: #94a3b8; display: flex; align-items: center; gap: 10px; }
        .price-card li::before { content: "✓"; color: #3b82f6; font-weight: 800; font-size: 0.95rem; }

        .price-btn {
          display: block; width: 100%; padding: 14px; border-radius: 12px;
          font-weight: 700; font-size: 1rem; text-align: center;
          text-decoration: none; transition: all 0.3s ease; border: none; cursor: pointer;
        }
        .price-btn.primary { background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; box-shadow: 0 4px 20px rgba(59,130,246,0.3); }
        .price-btn.primary:hover { box-shadow: 0 8px 30px rgba(59,130,246,0.5); transform: translateY(-2px); color: #fff; }
        .price-btn.secondary { background: rgba(255,255,255,0.04); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); }
        .price-btn.secondary:hover { background: rgba(255,255,255,0.08); color: #fff; }

        /* ── 8. TESTIMONIALS ── */
        .testimonials-section { padding: 7rem 1.5rem; max-width: 1200px; margin: 0 auto; }
        .test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .test-card {
          padding: 2.5rem 2rem; border-radius: 20px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s ease; text-align: left;
        }
        .test-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-4px); }
        .test-quote { font-size: 0.95rem; color: #cbd5e1; line-height: 1.7; margin-bottom: 1.5rem; font-style: italic; }
        .test-author { display: flex; align-items: center; gap: 12px; }
        .test-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 800; color: #fff;
        }
        .test-author strong { display: block; color: #f1f5f9; font-size: 0.9rem; }
        .test-author span { font-size: 0.8rem; color: #64748b; }

        /* ── 9. FAQ ── */
        .faq-section { padding: 7rem 1.5rem; max-width: 750px; margin: 0 auto; }
        .faq-list { display: flex; flex-direction: column; gap: 1rem; }
        .faq-card {
          padding: 1.5rem 2rem; border-radius: 16px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer; transition: all 0.3s ease;
        }
        .faq-card:hover { border-color: rgba(255,255,255,0.12); }
        .faq-card.open { border-color: rgba(59,130,246,0.25); background: rgba(59,130,246,0.03); }
        .faq-header { display: flex; justify-content: space-between; align-items: center; }
        .faq-header h3 { font-size: 1rem; color: #e2e8f0; font-weight: 600; margin: 0; }
        .faq-icon { font-size: 1.4rem; color: #64748b; font-weight: 300; transition: color 0.3s; }
        .faq-card.open .faq-icon { color: #60a5fa; }
        .faq-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.4s ease, padding-top 0.4s ease;
          padding-top: 0;
        }
        .faq-card.open .faq-body {
          grid-template-rows: 1fr;
          padding-top: 1rem;
        }
        .faq-body-inner {
          overflow: hidden;
        }
        .faq-body p { font-size: 0.9rem; color: #94a3b8; line-height: 1.7; margin: 0; }

        /* ── 10. FINAL CTA ── */
        .final-cta {
          position: relative; text-align: center; padding: 7rem 1.5rem;
          margin: 4rem 1.5rem; border-radius: 32px;
          background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06));
          border: 1px solid rgba(59,130,246,0.15);
          overflow: hidden;
        }
        .cta-glow {
          position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%);
          pointer-events: none;
        }
        .final-cta h2 { font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 800; margin-bottom: 1rem; position: relative; z-index: 1; }
        .final-cta p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 2.5rem; position: relative; z-index: 1; }
        .final-cta .cta-primary { position: relative; z-index: 1; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .steps-grid, .bento, .price-grid, .test-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 3rem; }
        }
        @media (max-width: 640px) {
          .steps-grid, .bento, .price-grid, .test-grid, .stats-grid { grid-template-columns: 1fr; }
          .hero-h1 { font-size: 2.2rem; }
          .hero-sub { font-size: 1rem; }
          .hide-mobile { display: none; }
          .hero-ctas { flex-direction: column; align-items: center; }
          .hero-stats { flex-direction: column; align-items: center; }
          .final-cta { margin: 2rem 0.75rem; padding: 4rem 1.5rem; border-radius: 24px; }
        }
      `}</style>
    </div>
  );
}

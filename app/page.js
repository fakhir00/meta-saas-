'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
        <span className="faq-plus">+</span>
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
    <>
    <Navbar />
    <div className="landing" style={{ paddingTop: 'var(--nav-height, 72px)' }}>

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
            <Link href="/ideaforge" className="cta-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>✨</span> Discover My Idea
            </Link>
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

      {/* ═══ SECTION 3: THE 4-PHASE ARCHITECTURE ═══ */}
      <section className="how-section">
        <div className="section-header">
          <span className="section-badge">The MetaBox Method</span>
          <h2>A Strategic Four-Phase Architecture</h2>
          <p>We don't just write code. We build a market-ready venture using the proprietary 4-Phase System.</p>
        </div>

        <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[
            { num: '01', title: 'Founder Alignment', desc: 'Predictive market analysis and pain-point mapping to ensure product-market fit before a single line of code is written.', icon: '🎯' },
            { num: '02', title: 'Anti-Bloat Blueprint', desc: 'Strict scoping that eliminates technical debt and feature creep. We build the narrowest MVP that solves the pain.', icon: '🏗️' },
            { num: '03', title: 'Agentic Engineering', desc: 'Sophisticated AI logic synthesis. We generate the system prompts, JSON schemas, and backend handlers for your app.', icon: '🧠' },
            { num: '04', title: 'Revenue Engine', desc: 'Complete GTM arsenal. Automated lead scoring, cold outreach sequences, and a 30-day launch schedule.', icon: '📈' },
          ].map((s, i) => (
            <div key={i} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>{s.desc}</p>
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

      {/* ═══ IDEAFORGE SPOTLIGHT ═══ */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ borderRadius: '28px', background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))', border: '1px solid rgba(139,92,246,0.2)', padding: '3.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)', pointerEvents: 'none' }} />
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '100px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✨ New Feature</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.15, marginBottom: '1rem' }}>Don’t have an idea yet?<br /><span style={{ background: 'linear-gradient(135deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IdeaForge has you covered.</span></h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>Answer 10 quick questions about your background and goals. Our AI co-founder will craft a <strong style={{ color: '#f1f5f9' }}>personalised SaaS blueprint</strong> — complete with features, monetization model, and target users.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/ideaforge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(139,92,246,0.35)', transition: 'all 0.3s' }}>✨ Find My SaaS Idea →</Link>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[['💬','Just chat','Answer 10 conversational questions about your skills and goals.'],['🧠','AI analysis','Our model maps your profile to thousands of validated SaaS niches.'],['📋','Full blueprint','Get a complete idea with features, monetization, and a build plan.'],['🚀','Build it','Jump straight into the Launch Builder with your idea pre-loaded.']].map(([icon,title,desc],i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{icon}</span>
                <div>
                  <strong style={{ display: 'block', color: '#f1f5f9', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{title}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* ═══ SECTION 9: FAQ ── */}
      <section className="faq-section">
        <div className="section-header" style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Frequently Asked Questions</h2>
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

      
    </div>
    <Footer />
    </>
  );
}

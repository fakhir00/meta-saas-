'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ---- Animated Counter ---- */
function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ---- Typewriter ---- */
function TypewriterText({ texts, speed = 60, pause = 2000 }) {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(current.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        if (charIndex + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        setDisplayed(current.slice(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        if (charIndex <= 1) {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  return (
    <span>
      {displayed}
      <span style={{
        display: 'inline-block',
        width: '2px',
        height: '1em',
        background: 'var(--accent-blue)',
        marginLeft: '2px',
        animation: 'blink 1s infinite',
        verticalAlign: 'text-bottom'
      }} />
    </span>
  );
}

/* ---- Hero Particles ---- */
function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 700;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ---- Main Page ---- */
export default function HomePage() {
  const painPoints = [
    {
      icon: '🧠',
      title: 'Decision Fatigue',
      subtitle: 'The "Brain Drain"',
      desc: 'Hundreds of micro-decisions drain your mental battery. We use "Direction over Choice" to limit options to the optimal path.',
      color: 'var(--accent-purple)',
    },
    {
      icon: '📄',
      title: 'The Blank Page',
      subtitle: 'Building What Nobody Wants',
      desc: 'Most founders fail by solving problems nobody has. Our Predictive Analytics ensures immediate product-market fit.',
      color: 'var(--accent-cyan)',
    },
    {
      icon: '💰',
      title: 'High Cost of Entry',
      subtitle: '6 Months & $500K+',
      desc: 'Traditional AI apps cost $500K and take 6 months. We reduce dev time by 90% and costs by 74% using no-code automation.',
      color: 'var(--accent-orange)',
    },
  ];

  const phases = [
    {
      num: '01',
      title: 'Deep Intake & Analysis',
      desc: 'Answer 5 high-leverage questions. Our AI identifies your founder-market fit and discovers 3 revenue-bleeding operational pains.',
      icon: '🔍',
      color: 'var(--accent-blue)',
    },
    {
      num: '02',
      title: 'Anti-Bloat Blueprint',
      desc: 'No options—just the single most efficient path. A strict blueprint that solves the core problem without feature bloat.',
      icon: '📐',
      color: 'var(--accent-purple)',
    },
    {
      num: '03',
      title: 'AI Logic Engineering',
      desc: 'System prompts, JSON schemas, and logic scripts generated automatically. Your Strategic Director Dashboard is ready.',
      icon: '⚙️',
      color: 'var(--accent-cyan)',
    },
    {
      num: '04',
      title: 'Sales Automation',
      desc: 'Lead intelligence, outreach scripts, and a 30-day schedule to secure your first 5 paying customers.',
      icon: '🚀',
      color: 'var(--accent-green)',
    },
  ];

  const stats = [
    { value: 273, suffix: 'B+', prefix: '$', label: 'Global SaaS Market' },
    { value: 90, suffix: '%', label: 'Faster to Market' },
    { value: 74, suffix: '%', label: 'Cost Reduction' },
    { value: 300, suffix: '%', label: 'Reply Rate Boost' },
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '29',
      period: '/month',
      desc: 'Perfect for exploring your first micro-SaaS idea',
      features: [
        'AI Niche Discovery',
        '1 Blueprint Generation',
        'Basic Market Analysis',
        'Email Outreach Templates',
        'Community Support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Growth',
      price: '99',
      period: '/month',
      desc: 'For serious founders ready to launch and scale',
      features: [
        'Everything in Starter',
        'Unlimited Blueprints',
        'Full AI Logic Engineering',
        'Lead Intelligence Engine',
        '30-Day Sales Playbook',
        'Priority Support',
        'Dashboard Analytics',
      ],
      cta: 'Start Building',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '299',
      period: '/month',
      desc: 'White-glove service for agencies and venture builders',
      features: [
        'Everything in Growth',
        'Custom AI Models',
        'Multi-Tenant Architecture',
        'API Access',
        'Dedicated Account Manager',
        'SLA Guarantee',
        'Onboarding Workshop',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <HeroParticles />
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
        </div>
        <div className="container hero-content">
          <div className="animate-fade-in-up">
            <span className="badge badge-blue" style={{ marginBottom: '1.25rem' }}>
              ✨ AI-Powered Business Builder
            </span>
          </div>
          <h1 className="hero-title animate-fade-in-up delay-100">
            Your AI <span className="text-gradient">Co-Founder</span>
          </h1>
          <p className="hero-subtitle animate-fade-in-up delay-200">
            <TypewriterText
              texts={[
                'Discover profitable niches instantly',
                'Generate anti-bloat SaaS blueprints',
                'Automate your first 5 sales',
                'Launch in days, not months',
              ]}
            />
          </p>
          <p className="hero-desc animate-fade-in-up delay-300">
            Stop drowning in decision fatigue. Our Business-in-a-Box robot handles niche research,
            UI/UX architecture, AI logic engineering, and sales automation—so you become the
            Strategic Director, not the laborer.
          </p>
          <div className="hero-actions animate-fade-in-up delay-400">
            <Link href="/launch" className="btn btn-primary btn-lg">
              Start Building Free →
            </Link>
            <Link href="/#how-it-works" className="btn btn-secondary btn-lg">
              See How It Works
            </Link>
          </div>
          <div className="hero-trust animate-fade-in-up delay-500">
            <div className="hero-trust-avatars">
              {['🧑‍💻', '👩‍🔬', '👨‍💼', '👩‍🎨', '🧑‍🚀'].map((e, i) => (
                <div key={i} className="hero-avatar">{e}</div>
              ))}
            </div>
            <span>Join <strong>2,400+</strong> founders already building</span>
          </div>
        </div>
      </section>

      {/* ===== PAIN POINTS ===== */}
      <section className="section" id="problems">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-purple">The Problem</span>
            <h2 style={{ marginTop: '1rem' }}>Why 90% of Founders Never Ship</h2>
            <p className="section-subtitle">Three critical bottlenecks that kill startups before they launch</p>
          </div>
          <div className="pain-grid">
            {painPoints.map((p, i) => (
              <div key={i} className="glass-card pain-card animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s`, opacity: 0 }}>
                <div className="pain-icon" style={{ background: `${p.color}15`, color: p.color }}>{p.icon}</div>
                <h3>{p.title}</h3>
                <span className="pain-subtitle" style={{ color: p.color }}>{p.subtitle}</span>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section section-dark" id="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-blue">How It Works</span>
            <h2 style={{ marginTop: '1rem' }}>Idea to Revenue in 4 Phases</h2>
            <p className="section-subtitle">A guided, opinionated pipeline that eliminates guesswork</p>
          </div>
          <div className="phases-grid">
            {phases.map((phase, i) => (
              <div key={i} className="phase-card animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s`, opacity: 0 }}>
                <div className="phase-num" style={{ color: phase.color }}>{phase.num}</div>
                <div className="phase-icon">{phase.icon}</div>
                <h3>{phase.title}</h3>
                <p>{phase.desc}</p>
                {i < phases.length - 1 && <div className="phase-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <div className="stat-value">
                  <AnimatedCounter end={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SHOWCASE ===== */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-green">Features</span>
            <h2 style={{ marginTop: '1rem' }}>Everything You Need to Launch</h2>
            <p className="section-subtitle">From market research to your first paying customer</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '🎯', title: 'Niche Discovery Engine', desc: 'AI scans 10,000+ data points to find profitable, underserved niches with immediate product-market fit.' },
              { icon: '🏗️', title: 'Blueprint Generator', desc: 'Strict, anti-bloat architecture that defines auth, security, database, and deployment from day one.' },
              { icon: '🤖', title: 'AI Logic Compiler', desc: 'Auto-generates system prompts, JSON schemas, and agentic logic chains for your SaaS core engine.' },
              { icon: '📊', title: 'Director Dashboard', desc: 'Real-time command center with MRR tracking, user analytics, and AI performance monitoring.' },
              { icon: '📧', title: 'Outreach Arsenal', desc: 'Pre-built email and LinkedIn scripts with a 30-day playbook to land your first 5 paying customers.' },
              { icon: '🔒', title: 'Enterprise Security', desc: 'Built-in encryption, rate limiting, error handling, and scalable infrastructure from the start.' },
            ].map((f, i) => (
              <div key={i} className="glass-card feature-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="section section-dark" id="pricing">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-orange">Pricing</span>
            <h2 style={{ marginTop: '1rem' }}>Simple, Transparent Pricing</h2>
            <p className="section-subtitle">Start free. Scale when you{"'"}re ready.</p>
          </div>
          <div className="pricing-grid">
            {pricingTiers.map((tier, i) => (
              <div key={i} className={`glass-card pricing-card ${tier.popular ? 'pricing-popular' : ''}`}>
                {tier.popular && <div className="pricing-badge">Most Popular</div>}
                <h3>{tier.name}</h3>
                <p className="pricing-desc">{tier.desc}</p>
                <div className="pricing-price">
                  <span className="pricing-dollar">$</span>
                  <span className="pricing-amount">{tier.price}</span>
                  <span className="pricing-period">{tier.period}</span>
                </div>
                <ul className="pricing-features">
                  {tier.features.map((f, j) => (
                    <li key={j}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/launch"
                  className={`btn ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card glass-card text-center">
            <h2>Ready to Build Your <span className="text-gradient">SaaS Empire</span>?</h2>
            <p>Join thousands of founders who turned their ideas into revenue-generating products with AI.</p>
            <Link href="/launch" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
              Launch Your SaaS Now →
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* ===== HERO ===== */
        .hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: var(--space-4xl) 0;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
        }
        .hero-glow-1 {
          width: 600px;
          height: 600px;
          background: rgba(99, 102, 241, 0.12);
          top: -200px;
          right: -100px;
        }
        .hero-glow-2 {
          width: 500px;
          height: 500px;
          background: rgba(6, 182, 212, 0.08);
          bottom: -100px;
          left: -100px;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 720px;
        }
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        .hero-subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: var(--text-primary);
          min-height: 2.5rem;
          margin-bottom: 1rem;
        }
        .hero-desc {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 560px;
          margin-bottom: 2rem;
          line-height: 1.7;
        }
        .hero-actions {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }
        .hero-trust {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          color: var(--text-tertiary);
          font-size: 0.9rem;
        }
        .hero-trust strong {
          color: var(--text-primary);
        }
        .hero-trust-avatars {
          display: flex;
        }
        .hero-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 2px solid var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          margin-left: -8px;
        }
        .hero-avatar:first-child {
          margin-left: 0;
        }

        /* ===== PAIN POINTS ===== */
        .section-header {
          margin-bottom: var(--space-3xl);
        }
        .section-subtitle {
          color: var(--text-tertiary);
          font-size: 1.1rem;
          margin-top: 0.75rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .section-dark {
          background: var(--bg-secondary);
        }
        .pain-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
        }
        .pain-card {
          text-align: center;
          padding: var(--space-2xl);
        }
        .pain-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin: 0 auto var(--space-lg);
        }
        .pain-card h3 {
          margin-bottom: 0.4rem;
        }
        .pain-subtitle {
          font-size: 0.85rem;
          font-weight: 600;
          display: block;
          margin-bottom: var(--space-md);
        }
        .pain-card p {
          font-size: 0.92rem;
          color: var(--text-tertiary);
          line-height: 1.6;
        }

        /* ===== PHASES ===== */
        .phases-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-xl);
          position: relative;
        }
        .phase-card {
          text-align: center;
          padding: var(--space-xl);
          background: var(--bg-glass);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          position: relative;
          transition: all var(--transition-base);
        }
        .phase-card:hover {
          border-color: var(--border-glass-hover);
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
        }
        .phase-num {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
        }
        .phase-icon {
          font-size: 2.2rem;
          margin-bottom: var(--space-md);
        }
        .phase-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.6rem;
        }
        .phase-card p {
          font-size: 0.88rem;
          color: var(--text-tertiary);
          line-height: 1.5;
        }
        .phase-connector {
          display: none;
        }

        /* ===== STATS ===== */
        .stats-section {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(6, 182, 212, 0.06));
          border-top: 1px solid var(--border-glass);
          border-bottom: 1px solid var(--border-glass);
          padding: var(--space-2xl) 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-xl);
          text-align: center;
        }
        .stat-value {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          background: var(--gradient-hero);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          color: var(--text-tertiary);
          font-size: 0.9rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        /* ===== FEATURES ===== */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
        }
        .feature-card {
          padding: var(--space-xl);
        }
        .feature-icon {
          font-size: 2rem;
          margin-bottom: var(--space-md);
        }
        .feature-card h4 {
          margin-bottom: 0.5rem;
        }
        .feature-card p {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          line-height: 1.6;
        }

        /* ===== PRICING ===== */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
          align-items: start;
        }
        .pricing-card {
          padding: var(--space-2xl);
          position: relative;
        }
        .pricing-popular {
          border-color: var(--accent-blue);
          box-shadow: var(--shadow-glow);
          transform: scale(1.03);
        }
        .pricing-popular:hover {
          transform: scale(1.05);
        }
        .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gradient-primary);
          color: white;
          padding: 0.3rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pricing-card h3 {
          font-size: 1.3rem;
          margin-bottom: 0.4rem;
        }
        .pricing-desc {
          color: var(--text-tertiary);
          font-size: 0.88rem;
          margin-bottom: var(--space-lg);
        }
        .pricing-price {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;
          margin-bottom: var(--space-xl);
        }
        .pricing-dollar {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .pricing-amount {
          font-size: 3rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
        }
        .pricing-period {
          color: var(--text-tertiary);
          font-size: 0.9rem;
        }
        .pricing-features {
          list-style: none;
          margin-bottom: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .pricing-features li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        /* ===== CTA ===== */
        .cta-section {
          padding: var(--space-3xl) 0;
        }
        .cta-card {
          padding: var(--space-3xl);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(59, 130, 246, 0.08));
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .cta-card h2 {
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          margin-bottom: 1rem;
        }
        .cta-card p {
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .phases-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .hero {
            min-height: auto;
            padding: var(--space-3xl) 0 var(--space-2xl);
          }
          .pain-grid,
          .features-grid,
          .pricing-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-lg);
          }
          .pricing-popular {
            transform: scale(1);
          }
          .pricing-popular:hover {
            transform: scale(1);
          }
          .hero-actions {
            flex-direction: column;
          }
          .hero-actions .btn {
            width: 100%;
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .phases-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

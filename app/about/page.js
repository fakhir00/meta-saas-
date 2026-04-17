'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
    <Navbar />
    <div className="about-page">
      {/* ── HERO ── */}
      <section className="about-hero">
        <span className="badge-pill">Our Mission</span>
        <h1>We're building the ultimate<br/><span className="text-gradient">AI Co-Founder</span></h1>
        <p>MetaBox was founded on a simple belief: the barrier to entry for building software is too high. We're giving every visionary the technical execution power of a senior engineering team.</p>
      </section>

      {/* ── METRICS ── */}
      <section className="about-metrics">
        <div className="metric-box">
          <h3>3,000+</h3>
          <p>Projects Launched</p>
        </div>
        <div className="metric-box">
          <h3>99.9%</h3>
          <p>Code Success Rate</p>
        </div>
        <div className="metric-box">
          <h3>14</h3>
          <p>Team Members</p>
        </div>
        <div className="metric-box">
          <h3>Remote</h3>
          <p>Global presence</p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="about-story">
        <div className="story-content">
          <h2>The story of MetaBox</h2>
          <p>In 2024, our founders realized that the hardest part of launching a startup wasn't coming up with the idea—it was the technical execution. Non-technical founders were spending thousands on agencies, while developers were burning out on repetitive boilerplate code.</p>
          <p>We built MetaBox to bridge that gap. By combining advanced LLM reasoning with a proprietary code generation engine, we created a system that doesn't just write code snippets, but architects, builds, and deploys full production-grade applications in minutes.</p>
        </div>
        <div className="story-image-placeholder">
          {/* Abstract geometric representation */}
          <div className="abstract-art">
            <div className="glass-shape circle"></div>
            <div className="glass-shape square"></div>
            <div className="grid-lines"></div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="about-team">
        <div className="section-header">
          <h2>Meet the Team</h2>
          <p>The engineers, designers, and thinkers behind the engine.</p>
        </div>
        
        <div className="team-grid">
          {/* Founder 1 */}
          <div className="team-card">
            <div className="avatar-placeholder">AH</div>
            <h4>Alex Hayes</h4>
            <p className="role">CEO & Co-Founder</p>
            <p className="bio">Former Lead Architect at Stripe. Passionate about democratizing software creation and lowering the barrier for entry.</p>
          </div>

          {/* Founder 2 */}
          <div className="team-card">
            <div className="avatar-placeholder">SJ</div>
            <h4>Sarah Jenkins</h4>
            <p className="role">CTO & Co-Founder</p>
            <p className="bio">AI researcher previously at DeepMind. Leads development on the MetaBox proprietary logic synthesis engine.</p>
          </div>

          {/* Team Member 3 */}
          <div className="team-card">
            <div className="avatar-placeholder">DK</div>
            <h4>David Kim</h4>
            <p className="role">Head of Product</p>
            <p className="bio">Obsessed with developer experience. Ensures the generated code isn't just functional, but beautiful and maintainable.</p>
          </div>

          {/* Team Member 4 */}
          <div className="team-card">
            <div className="avatar-placeholder">MR</div>
            <h4>Maria Ross</h4>
            <p className="role">Lead Designer</p>
            <p className="bio">Crafts the aesthetic of the platform and the default design systems injected into generated applications.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page { padding: 8rem 1.5rem 5rem; max-width: 1100px; margin: 0 auto; }
        
        .about-hero { text-align: center; margin-bottom: 5rem; }
        .badge-pill { display: inline-block; padding: 6px 16px; border-radius: 100px; background: rgba(59,130,246,0.1); color: #60a5fa; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.5rem; }
        .about-hero h1 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 900; color: #f1f5f9; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.03em; }
        .text-gradient { background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .about-hero p { font-size: 1.15rem; color: #94a3b8; max-width: 700px; margin: 0 auto; line-height: 1.7; }

        .about-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 6rem; }
        .metric-box { padding: 2rem 1rem; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center; }
        .metric-box h3 { font-size: 2rem; font-weight: 800; color: #60a5fa; margin-bottom: 0.5rem; }
        .metric-box p { color: #94a3b8; font-size: 0.9rem; margin: 0; }

        .about-story { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; margin-bottom: 8rem; }
        .story-content h2 { font-size: 2.2rem; font-weight: 800; color: #f1f5f9; margin-bottom: 1.5rem; }
        .story-content p { color: #94a3b8; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem; }
        
        .story-image-placeholder { position: relative; height: 400px; border-radius: 24px; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .abstract-art { position: relative; width: 100%; height: 100%; }
        .glass-shape { position: absolute; background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2)); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .circle { width: 150px; height: 150px; border-radius: 50%; top: 20%; left: 30%; animation: float 6s infinite ease-in-out; }
        .square { width: 120px; height: 120px; border-radius: 20px; bottom: 25%; right: 25%; animation: float 8s infinite ease-in-out reverse; }
        .grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

        .section-header { text-align: center; margin-bottom: 3rem; }
        .section-header h2 { font-size: 2.2rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; }
        .section-header p { color: #94a3b8; font-size: 1.05rem; }

        .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .team-card { padding: 2rem 1.5rem; border-radius: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center; transition: 0.3s; }
        .team-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.15); }
        .avatar-placeholder { width: 80px; height: 80px; margin: 0 auto 1.5rem; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: #fff; }
        .team-card h4 { font-size: 1.1rem; color: #f1f5f9; margin-bottom: 0.2rem; }
        .role { font-size: 0.85rem; color: #60a5fa; font-weight: 600; margin-bottom: 1rem; }
        .bio { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; }

        @media (max-width: 900px) {
          .about-metrics { grid-template-columns: repeat(2, 1fr); }
          .about-story { grid-template-columns: 1fr; }
          .team-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .team-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
    <Footer />
    </>
  );
}

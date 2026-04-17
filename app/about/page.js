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

      
    </div>
    <Footer />
    </>
  );
}

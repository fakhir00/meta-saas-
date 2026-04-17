'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
    <Navbar />
    <div className="pricing-page">
      {/* ── HERO ── */}
      <section className="pricing-hero">
        <h1>Simple, transparent pricing</h1>
        <p>Start for free. Scale your SaaS empire when you're ready.</p>
        
        <div className="billing-toggle">
          <span className={!annual ? 'active' : ''}>Monthly</span>
          <button className={`toggle-btn ${annual ? 'on' : ''}`} onClick={() => setAnnual(!annual)}>
            <div className="toggle-knob" />
          </button>
          <span className={annual ? 'active' : ''}>Annually <span className="save-badge">Save 20%</span></span>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="prices">
        <div className="price-grid">
          {/* Starter */}
          <div className="price-card">
            <h4>Starter</h4>
            <div className="price-amount">$0</div>
            <p className="price-period">Forever free</p>
            <ul>
              <li>1 Active Box (Project)</li>
              <li>Draft Deployment</li>
              <li>Community Support</li>
              <li>Basic AI Suggestions</li>
            </ul>
            <Link href="/launch" className="price-btn secondary">Start Free</Link>
          </div>

          {/* Founder */}
          <div className="price-card featured">
            <div className="featured-tag">Most Popular</div>
            <h4>Founder</h4>
            <div className="price-amount">
              ${annual ? '39' : '49'}<span>/mo</span>
            </div>
            <p className="price-period">Billed {annual ? 'annually' : 'monthly'}</p>
            <ul>
              <li>10 Active Boxes</li>
              <li>Custom Domains & SSL</li>
              <li>Priority AI Assembly Queue</li>
              <li>GTM Copy Engine</li>
              <li>Code Export (.zip)</li>
            </ul>
            <Link href="/launch" className="price-btn primary">Get Started</Link>
          </div>

          {/* Studio */}
          <div className="price-card">
            <h4>Studio</h4>
            <div className="price-amount">
              ${annual ? '159' : '199'}<span>/mo</span>
            </div>
            <p className="price-period">Billed {annual ? 'annually' : 'monthly'}</p>
            <ul>
              <li>Unlimited Boxes</li>
              <li>Full GitHub Integration</li>
              <li>Direct Database API Access</li>
              <li>White-Label Deployments</li>
              <li>24/7 Concierge Support</li>
            </ul>
            <Link href="/launch" className="price-btn secondary">Go Studio</Link>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="comparison">
        <div className="section-header">
          <h2>Compare Features</h2>
        </div>
        <div className="table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Features</th>
                <th>Starter</th>
                <th>Founder</th>
                <th>Studio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Active Boxes</td>
                <td>1</td>
                <td>10</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Deployment</td>
                <td>Draft / Staging</td>
                <td>Production + Custom Domain</td>
                <td>White-labeled Production</td>
              </tr>
              <tr>
                <td>Code Export</td>
                <td>-</td>
                <td>.ZIP Export</td>
                <td>GitHub Sync</td>
              </tr>
              <tr>
                <td>AI Engine Access</td>
                <td>Standard Model</td>
                <td>Premium MetaBox Model</td>
                <td>Custom Pre-trained Models</td>
              </tr>
              <tr>
                <td>Support</td>
                <td>Community</td>
                <td>Priority Email</td>
                <td>Dedicated Account Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I switch plans later?</h4>
            <p>Yes, you can upgrade or downgrade your plan at any time. Prorated charges will be applied automatically.</p>
          </div>
          <div className="faq-item">
            <h4>What happens if I cancel?</h4>
            <p>You will retain access until the end of your billing cycle. If you exported your code, you own it forever.</p>
          </div>
          <div className="faq-item">
            <h4>Is there a setup fee?</h4>
            <p>No, there are zero setup fees or hidden charges. You only pay the listed monthly or annual subscription.</p>
          </div>
          <div className="faq-item">
            <h4>Do I need a credit card for the free plan?</h4>
            <p>No credit card is required to start building on the free Starter plan.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .pricing-page { padding: 8rem 1.5rem 5rem; max-width: 1200px; margin: 0 auto; }
        
        .pricing-hero { text-align: center; margin-bottom: 4rem; }
        .pricing-hero h1 { font-size: clamp(2.5rem, 5vw, 3.5rem); margin-bottom: 1rem; color: #f1f5f9; font-weight: 800; letter-spacing: -0.03em; }
        .pricing-hero p { font-size: 1.1rem; color: #94a3b8; max-width: 500px; margin: 0 auto 2.5rem; }
        
        .billing-toggle { display: inline-flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); padding: 0.75rem 1.5rem; border-radius: 100px; border: 1px solid rgba(255,255,255,0.08); }
        .billing-toggle span { font-size: 0.9rem; font-weight: 600; color: #64748b; transition: 0.3s; }
        .billing-toggle span.active { color: #f1f5f9; }
        .save-badge { background: rgba(16,185,129,0.15); color: #4ade80; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; margin-left: 6px; }
        
        .toggle-btn { width: 44px; height: 24px; border-radius: 12px; background: rgba(255,255,255,0.1); border: none; cursor: pointer; position: relative; transition: 0.3s; }
        .toggle-btn.on { background: #3b82f6; }
        .toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 3px; transition: 0.3s; }
        .toggle-btn.on .toggle-knob { left: 23px; }

        .price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; align-items: start; margin-bottom: 6rem; }
        .price-card { position: relative; padding: 3rem 2rem; border-radius: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: left; }
        .price-card.featured { background: linear-gradient(145deg, rgba(59,130,246,0.06), rgba(139,92,246,0.04)); border-color: rgba(59,130,246,0.3); box-shadow: 0 20px 60px rgba(59,130,246,0.1); transform: scale(1.02); }
        
        .featured-tag { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 4px 16px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; }
        
        .price-card h4 { font-size: 1rem; color: #94a3b8; font-weight: 600; margin-bottom: 0.5rem; }
        .price-amount { font-size: 3.5rem; font-weight: 900; color: #f1f5f9; margin-bottom: 0.25rem; line-height: 1; }
        .price-amount span { font-size: 1rem; font-weight: 500; color: #64748b; }
        .price-period { font-size: 0.85rem; color: #64748b; margin-bottom: 2rem; }
        
        .price-card ul { list-style: none; padding: 0; margin: 0 0 2.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
        .price-card li { font-size: 0.9rem; color: #94a3b8; display: flex; align-items: center; gap: 10px; }
        .price-card li::before { content: "✓"; color: #3b82f6; font-weight: 800; font-size: 0.95rem; }

        .price-btn { display: block; width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 1rem; text-align: center; text-decoration: none; transition: 0.3s; }
        .price-btn.primary { background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; }
        .price-btn.primary:hover { opacity: 0.9; transform: translateY(-2px); }
        .price-btn.secondary { background: rgba(255,255,255,0.04); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); }
        .price-btn.secondary:hover { background: rgba(255,255,255,0.08); }

        .section-header { text-align: center; margin-bottom: 3rem; }
        .section-header h2 { font-size: 2rem; font-weight: 800; color: #f1f5f9; }

        .compare-table { width: 100%; border-collapse: collapse; text-align: left; }
        .compare-table th { padding: 1.5rem 1rem; font-weight: 600; color: #f1f5f9; border-bottom: 2px solid rgba(255,255,255,0.1); font-size: 1.1rem; }
        .compare-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.95rem; }
        .compare-table tbody tr:hover td { background: rgba(255,255,255,0.02); }
        .table-wrapper { overflow-x: auto; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; margin-bottom: 6rem; }

        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .faq-item h4 { font-size: 1.1rem; color: #f1f5f9; margin-bottom: 0.5rem; }
        .faq-item p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }

        @media (max-width: 900px) {
          .price-grid { grid-template-columns: 1fr; gap: 2rem; }
          .price-card.featured { transform: scale(1); }
          .faq-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
    <Footer />
    </>
  );
}

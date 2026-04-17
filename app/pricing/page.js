'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const faqs = [
    { q: "Can I switch plans later?", a: "Yes, you can upgrade or downgrade your plan at any time. Prorated charges will be applied automatically." },
    { q: "What happens if I cancel?", a: "You will retain access until the end of your billing cycle. If you exported your code, you own it forever." },
    { q: "Is there a setup fee?", a: "No, there are zero setup fees or hidden charges. You only pay the listed monthly or annual subscription." },
    { q: "Do I need a credit card for the free plan?", a: "No credit card is required to start building on the free Starter plan." }
  ];

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
        <div className="section-header" style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      
    </div>
    <Footer />
    </>
  );
}

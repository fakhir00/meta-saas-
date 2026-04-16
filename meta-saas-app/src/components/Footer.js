'use client';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#footer-grad)" />
                <path d="M8 16L12 10L16 16L20 10L24 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 20L12 14L16 20L20 14L24 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                <defs>
                  <linearGradient id="footer-grad" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#6366f1"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>Meta<span className="text-gradient">SaaS</span></span>
            </div>
            <p className="footer-desc">Your AI Co-Founder. Turn ideas into market-ready SaaS products in minutes, not months.</p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/launch">Launch Wizard</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/#features">Features</Link>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Blog</a>
            <a href="#">Changelog</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} MetaSaaS. All rights reserved.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="#" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          border-top: 1px solid var(--border-glass);
          padding: var(--space-3xl) 0 var(--space-xl);
          background: var(--bg-secondary);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .footer-desc {
          color: var(--text-tertiary);
          font-size: 0.9rem;
          max-width: 280px;
          line-height: 1.6;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .footer-col h4 {
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .footer-col a {
          color: var(--text-tertiary);
          font-size: 0.88rem;
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .footer-col a:hover {
          color: var(--text-primary);
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-xl);
          border-top: 1px solid var(--border-glass);
        }
        .footer-bottom p {
          color: var(--text-tertiary);
          font-size: 0.85rem;
        }
        .footer-socials {
          display: flex;
          gap: var(--space-md);
        }
        .footer-socials a {
          color: var(--text-tertiary);
          transition: color var(--transition-fast);
        }
        .footer-socials a:hover {
          color: var(--accent-blue);
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-xl);
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
          .footer-bottom {
            flex-direction: column;
            gap: var(--space-md);
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}

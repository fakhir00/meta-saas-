'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-bolt">
      <div className="footer-container">
        
        <div className="footer-brand">
          <div className="brand-logo-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="brand-logo">
               <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="brand-text">NeuralSaaS</h3>
          </div>
          <p className="brand-tagline">The premium Business-in-a-Box co-founder engine.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4 className="col-header">Resources</h4>
            <ul className="col-list">
              <li><Link href="/pricing" className="col-link list-row">Pricing <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link></li>
              <li><Link href="/docs" className="col-link list-row">Support <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link></li>
              <li><Link href="/blog" className="col-link list-row">Blog <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="col-header">Platform</h4>
            <ul className="col-list">
              <li><Link href="/launch" className="col-link">Launch Wizard</Link></li>
              <li><Link href="/dashboard" className="col-link">Live Dashboard</Link></li>
              <li><Link href="#" className="col-link">Neural Engine</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="col-header">Social</h4>
            <ul className="col-list">
              <li><Link href="#" className="col-link">Discord</Link></li>
              <li><Link href="#" className="col-link">LinkedIn</Link></li>
              <li><Link href="#" className="col-link">Twitter/X</Link></li>
            </ul>
          </div>
        </div>

      </div>

      <style jsx>{`
        .footer-bolt {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background-color: #030303;
          padding: 6rem 0 4rem;
          margin-top: 5rem;
        }

        .footer-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 3rem;
        }

        .footer-brand {
          flex: 1;
          min-width: 250px;
        }

        .brand-logo-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .brand-logo {
          color: #ffffff;
        }

        .brand-text {
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.05em;
          font-style: italic;
          color: #ffffff;
          margin: 0;
        }

        .brand-tagline {
          font-size: 0.8rem;
          color: #6b7280;
          max-width: 200px;
          line-height: 1.5;
        }

        .footer-links {
          display: flex;
          gap: 5rem;
          flex: 2;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          min-width: 120px;
        }

        .col-header {
          color: #ffffff;
          font-weight: 600;
          font-size: 0.75rem;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .col-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .col-link {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.3s;
        }
        
        .list-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 90px;
        }

        .col-link:hover {
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .footer-container {
            flex-direction: column;
          }
          
          .footer-links {
            justify-content: flex-start;
            gap: 3rem;
          }
        }
      `}</style>
    </footer>
  );
}

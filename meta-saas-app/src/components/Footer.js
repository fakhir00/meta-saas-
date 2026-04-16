 'use client';

import Link from 'next/link';

const quickLinks = [
  { label: 'Overview', href: '/#overview' },
  { label: 'Workflow', href: '/#workflow' },
  { label: 'Metrics', href: '/#metrics' },
  { label: 'Roadmap', href: '/#roadmap' }
];

const productLinks = [
  { label: 'Launch Console', href: '/launch' },
  { label: 'Live Dashboard', href: '/dashboard' },
  { label: 'API Status', href: '/launch' }
];

export default function Footer() {
  return (
    <footer className="meta-footer">
      <div className="meta-footer-inner">
        <div className="brand-block">
          <p className="brand">MetaSaaS</p>
          <p>Personalized AI co-founder workspace for shipping and monetizing focused SaaS products.</p>
          <a href="mailto:hello@metasaas.ai">hello@metasaas.ai</a>
        </div>

        <div className="link-col">
          <h4>Explore</h4>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="link-col">
          <h4>Product</h4>
          {productLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <p className="copyright">© {new Date().getFullYear()} MetaSaaS. Built for focused execution.</p>

      <style jsx>{`
        .meta-footer {
          margin-top: 2rem;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
          background: #020617;
          padding: 3rem 0 2rem;
        }

        .meta-footer-inner {
          width: min(1120px, calc(100% - 2rem));
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr;
          gap: 1rem;
        }

        .brand-block {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .brand {
          margin: 0;
          color: #f8fafc;
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .brand-block p {
          margin: 0;
          color: #9eb2d8;
          font-size: 0.86rem;
          max-width: 46ch;
        }

        .brand-block a {
          width: fit-content;
          color: #7dd3fc;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 700;
        }

        .link-col {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .link-col h4 {
          margin: 0 0 0.35rem;
          color: #f8fafc;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .link-col a {
          color: #a9c0e8;
          text-decoration: none;
          font-size: 0.84rem;
          width: fit-content;
        }

        .link-col a:hover {
          color: #e0f2fe;
        }

        .copyright {
          width: min(1120px, calc(100% - 2rem));
          margin: 1.6rem auto 0;
          color: #7d90b6;
          font-size: 0.75rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          padding-top: 1rem;
        }

        @media (max-width: 860px) {
          .meta-footer-inner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { label: 'Overview', href: '/#overview' },
  { label: 'Workflow', href: '/#workflow' },
  { label: 'Metrics', href: '/#metrics' },
  { label: 'Roadmap', href: '/#roadmap' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`meta-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="meta-nav-inner">
        <Link href="/" className="brand" aria-label="MetaSaaS home">
          MetaSaaS
        </Link>

        <nav className="meta-links" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="meta-cta">
          <Link href="/launch" className="ghost-btn">
            Launch
          </Link>
          <Link href="/dashboard" className="solid-btn">
            Dashboard
          </Link>
        </div>
      </div>

      <style jsx>{`
        .meta-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1200;
          padding: 0.85rem 0;
          transition: background 0.25s ease, border-color 0.25s ease;
          border-bottom: 1px solid transparent;
        }

        .meta-nav.scrolled {
          background: rgba(2, 6, 23, 0.84);
          backdrop-filter: blur(10px);
          border-color: rgba(148, 163, 184, 0.16);
        }

        .meta-nav-inner {
          width: min(1120px, calc(100% - 2rem));
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .brand {
          color: #f8fafc;
          font-weight: 800;
          letter-spacing: -0.03em;
          text-decoration: none;
          font-size: 1.15rem;
        }

        .meta-links {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .meta-links a {
          color: #acc2e7;
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 600;
        }

        .meta-links a:hover {
          color: #e0f2fe;
        }

        .meta-cta {
          display: flex;
          gap: 0.5rem;
        }

        .ghost-btn,
        .solid-btn {
          text-decoration: none;
          border-radius: 999px;
          padding: 0.45rem 0.9rem;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .ghost-btn {
          border: 1px solid rgba(125, 211, 252, 0.38);
          color: #dbeafe;
        }

        .solid-btn {
          color: #031019;
          background: linear-gradient(120deg, #22d3ee, #60a5fa);
        }

        @media (max-width: 860px) {
          .meta-nav-inner {
            flex-wrap: wrap;
            justify-content: center;
          }

          .meta-links {
            order: 3;
            width: 100%;
          }
        }
      `}</style>
    </header>
  );
}

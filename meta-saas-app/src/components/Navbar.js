'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/launch', label: 'Launch' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link href="/" className="navbar-brand">
          <div className="navbar-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
              <path d="M8 16L12 10L16 16L20 10L24 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 20L12 14L16 20L20 14L24 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1"/>
                  <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="navbar-brand-text">Meta<span className="text-gradient">SaaS</span></span>
          </div>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/launch" className="btn btn-primary btn-sm navbar-cta" onClick={() => setMenuOpen(false)}>
            Start Building →
          </Link>
        </div>

        <button className={`navbar-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: var(--nav-height);
          display: flex;
          align-items: center;
          transition: all var(--transition-base);
          background: transparent;
        }
        .navbar-scrolled {
          background: rgba(5, 8, 17, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-glass);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .navbar-brand {
          text-decoration: none;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .navbar-brand-text {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .navbar-link {
          padding: 0.5rem 1rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          text-decoration: none;
        }
        .navbar-link:hover,
        .navbar-link.active {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        .navbar-link.active {
          color: var(--accent-blue);
        }
        .navbar-cta {
          margin-left: var(--space-sm);
          text-decoration: none;
        }
        .navbar-toggle {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .navbar-toggle span {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: all var(--transition-fast);
        }
        .navbar-toggle.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .navbar-toggle.open span:nth-child(2) {
          opacity: 0;
        }
        .navbar-toggle.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        @media (max-width: 768px) {
          .navbar-links {
            position: fixed;
            top: var(--nav-height);
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(5, 8, 17, 0.95);
            backdrop-filter: blur(20px);
            padding: var(--space-lg);
            gap: var(--space-sm);
            transform: translateY(-120%);
            opacity: 0;
            transition: all var(--transition-base);
            border-bottom: 1px solid var(--border-glass);
          }
          .navbar-links.open {
            transform: translateY(0);
            opacity: 1;
          }
          .navbar-toggle {
            display: flex;
          }
          .navbar-cta {
            margin-left: 0;
            margin-top: var(--space-sm);
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </nav>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <span>MetaBox</span>
          </Link>

          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/ideaforge" className="nav-link">IdeaForge</Link>
            <Link href="/launch" className="nav-link">Launch</Link>
            <Link href="#pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>

          <div className="nav-right">
            {user ? (
              <Link href="/dashboard" className="nav-cta">Dashboard →</Link>
            ) : (
              <>
                <Link href="/login" className="nav-link-auth">Log In</Link>
                <Link href="/signup" className="nav-cta">Start Free →</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        .nav {
          position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
          padding: 1rem 0; transition: all 0.35s ease;
        }
        .nav.scrolled {
          padding: 0.7rem 0;
          background: rgba(5, 8, 17, 0.85);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 8px;
          color: #f1f5f9; text-decoration: none; font-weight: 800;
          font-size: 1.15rem; letter-spacing: -0.03em; font-style: italic;
        }
        .nav-logo:hover { color: #fff; }
        .nav-links { display: flex; gap: 2rem; }
        .nav-link {
          font-size: 0.82rem; font-weight: 600; color: #94a3b8;
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: #f1f5f9; }
        .nav-right { display: flex; align-items: center; gap: 1rem; }
        .nav-link-auth {
          font-size: 0.82rem; font-weight: 600; color: #94a3b8;
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link-auth:hover { color: #f1f5f9; }
        .nav-cta {
          padding: 8px 20px; border-radius: 10px; font-size: 0.82rem; font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff;
          text-decoration: none; transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(59,130,246,0.25);
        }
        .nav-cta:hover { box-shadow: 0 4px 20px rgba(59,130,246,0.45); transform: translateY(-1px); color: #fff; }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-logo span { font-size: 1rem; }
          .nav-link-auth { display: none; }
        }
      `}</style>
    </>
  );
}

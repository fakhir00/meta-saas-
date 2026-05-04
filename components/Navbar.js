'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light-mode');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newValue = !isLight;
    setIsLight(newValue);
    if (newValue) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

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
            <Link href="/launch" className="nav-link">Launch</Link>
            <Link href="/ideaforge" className="nav-link">IdeaForge ✨</Link>
            <Link href="#pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>

          <div className="nav-right">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              aria-label="Toggle Theme"
            >
              {isLight ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/></svg>
              )}
            </button>

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

        .theme-toggle {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .theme-toggle:hover {
          background: rgba(255,255,255,0.1);
          color: #f1f5f9;
          border-color: rgba(255,255,255,0.2);
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-logo span { font-size: 1rem; }
          .nav-link-auth { display: none; }
        }
      `}</style>
    </>
  );
}

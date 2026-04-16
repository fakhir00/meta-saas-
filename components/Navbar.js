'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`bolt-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="bolt-nav-links">
          <Link href="/" className="bolt-link">Home</Link>
          <Link href="/launch" className="bolt-link">Launch</Link>
          <Link href="/dashboard" className="bolt-link">Dashboard</Link>
          <div className="bolt-dropdown-trigger">
             Resources 
             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <Link href="#" className="bolt-link">Enterprise</Link>
        </div>
      </nav>
      
      <div className="top-cta-wrapper">
         <button className="top-pill-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            NeuralSaaS — Build Your Business-in-a-Box
         </button>
      </div>

      <style jsx>{`
        .bolt-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.5rem 0;
          transition: all 0.3s ease;
          background: transparent;
        }
        
        .bolt-nav.scrolled {
          padding: 1rem 0;
          background: rgba(3, 3, 3, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .bolt-nav-links {
          display: flex;
          gap: 2rem;
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
        }

        .bolt-link {
          transition: color 0.3s;
          text-decoration: none;
          color: inherit;
        }
        
        .bolt-link:hover {
          color: #ffffff;
        }

        .bolt-dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: color 0.3s;
        }
        
        .bolt-dropdown-trigger svg {
          opacity: 0.5;
          transition: opacity 0.3s;
        }
        
        .bolt-dropdown-trigger:hover {
          color: #ffffff;
        }
        
        .bolt-dropdown-trigger:hover svg {
          opacity: 1;
        }

        .top-cta-wrapper {
          position: fixed;
          top: 75px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          pointer-events: none;
        }

        .top-pill-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #111111;
          color: #d1d5db;
          font-size: 10px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          transition: all 0.3s;
          cursor: pointer;
          white-space: nowrap;
        }

        .top-pill-btn:hover {
          background: #1a1a1a;
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}

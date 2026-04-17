'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const { signup, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  if (user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = signup(name, email, password);
      if (result.error) { setError(result.error); setLoading(false); }
      else router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
          MetaBox
        </Link>

        <h1>Create your account</h1>
        <p className="auth-sub">Start building your SaaS in minutes</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" autoComplete="name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" />
          </label>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-terms">By signing up, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 2rem; background: #050811;
        }
        .auth-card {
          width: 100%; max-width: 420px; padding: 3rem; border-radius: 24px;
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .auth-logo {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 1.3rem; font-weight: 800; font-style: italic;
          color: #f1f5f9; text-decoration: none; margin-bottom: 2.5rem;
          letter-spacing: -0.03em;
        }
        h1 { font-size: 1.8rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.5rem; }
        .auth-sub { color: #64748b; font-size: 0.95rem; margin-bottom: 2rem; }
        .auth-error {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          color: #f87171; padding: 10px 16px; border-radius: 12px;
          font-size: 0.85rem; margin-bottom: 1.5rem; text-align: left;
        }
        form { display: flex; flex-direction: column; gap: 1.25rem; text-align: left; }
        label span {
          display: block; font-size: 0.82rem; font-weight: 600; color: #94a3b8;
          margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;
        }
        input {
          width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 0.95rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #f1f5f9; transition: border-color 0.2s; outline: none;
        }
        input:focus { border-color: #3b82f6; }
        input::placeholder { color: #475569; }
        .auth-btn {
          width: 100%; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 1rem;
          background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; border: none;
          cursor: pointer; transition: all 0.3s; margin-top: 0.5rem;
        }
        .auth-btn:hover { box-shadow: 0 6px 25px rgba(59,130,246,0.4); transform: translateY(-2px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .auth-terms {
          margin-top: 1.5rem; font-size: 0.75rem; color: #475569; line-height: 1.5;
        }
        .auth-switch {
          margin-top: 1rem; font-size: 0.9rem; color: #64748b;
        }
        .auth-switch a { color: #60a5fa; text-decoration: none; font-weight: 600; }
        .auth-switch a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

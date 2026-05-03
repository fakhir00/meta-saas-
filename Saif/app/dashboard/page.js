'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ── Mini Chart ── */
function MiniChart({ data, color, height = 50 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);
    const w = canvas.offsetWidth;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = w / (data.length - 1);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '00');
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = (i - 1) * stepX;
        const py = height - ((data[i - 1] - min) / range) * (height * 0.8) - height * 0.1;
        ctx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y);
      }
    });
    ctx.lineTo(w, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const px = (i - 1) * stepX;
        const py = height - ((data[i - 1] - min) / range) * (height * 0.8) - height * 0.1;
        ctx.bezierCurveTo((px + x) / 2, py, (px + x) / 2, y, x, y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [data, color, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: `${height}px` }} />;
}

/* ══════════════════════════════════════════
   DASHBOARD PAGE
   ══════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, loading, logout, getProjects, createProject, deleteProject } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) setProjects(getProjects());
  }, [user]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading...</div>;
  if (!user) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const p = createProject(newName.trim(), newDesc.trim());
    if (p) {
      setProjects(prev => [...prev, p]);
      setNewName('');
      setNewDesc('');
      setShowNewProject(false);
    }
  };

  const handleDelete = (id) => {
    deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleLogout = () => { logout(); router.push('/'); };

  const statusColors = { draft: '#f59e0b', building: '#3b82f6', live: '#10b981', paused: '#64748b' };

  const sidebarItems = [
    { id: 'projects', label: 'My Projects', icon: '📦' },
    { id: 'overview', label: 'Analytics', icon: '📊' },
    { id: 'ai', label: 'AI Assistant', icon: '🤖' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const metrics = [
    { label: 'Total Projects', value: projects.length, icon: '📦', data: [1, 2, 3, 4, projects.length], color: '#3b82f6' },
    { label: 'Live Projects', value: projects.filter(p => p.status === 'live').length, icon: '🟢', data: [0, 1, 1, 2, projects.filter(p => p.status === 'live').length], color: '#10b981' },
    { label: 'Draft Projects', value: projects.filter(p => p.status === 'draft').length, icon: '📝', data: [1, 2, 3, 2, projects.filter(p => p.status === 'draft').length], color: '#f59e0b' },
  ];

  return (
    <div className="dash">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sb-top">
          <Link href="/" className="sb-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>
            MetaBox
          </Link>
          <button className="sb-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="sb-nav">
          {sidebarItems.map(s => (
            <button key={s.id} className={`sb-item ${activeTab === s.id ? 'active' : ''}`} onClick={() => { setActiveTab(s.id); setSidebarOpen(false); }}>
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </nav>

        <div className="sb-bottom">
          <div className="sb-user">
            <div className="sb-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="sb-user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="sb-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        <header className="dash-header">
          <div className="dash-header-left">
            <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
              <span /><span /><span />
            </button>
            <h2>{sidebarItems.find(s => s.id === activeTab)?.icon} {sidebarItems.find(s => s.id === activeTab)?.label}</h2>
          </div>
          <div className="dash-header-right">
            <Link href="/launch" className="header-cta">+ New Box</Link>
          </div>
        </header>

        <div className="dash-content">

          {/* ═══ PROJECTS TAB ═══ */}
          {activeTab === 'projects' && (
            <div className="fade-in">
              {/* Quick Stats */}
              <div className="metrics-row">
                {metrics.map((m, i) => (
                  <div key={i} className="metric-card">
                    <div className="metric-top">
                      <span className="metric-icon">{m.icon}</span>
                    </div>
                    <div className="metric-val">{m.value}</div>
                    <div className="metric-lbl">{m.label}</div>
                    <MiniChart data={m.data} color={m.color} height={40} />
                  </div>
                ))}
              </div>

              {/* New Project Modal */}
              {showNewProject && (
                <div className="modal-overlay" onClick={() => setShowNewProject(false)}>
                  <div className="modal-card" onClick={e => e.stopPropagation()}>
                    <h3>Create New Project</h3>
                    <form onSubmit={handleCreate}>
                      <label>
                        <span>Project Name</span>
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="My SaaS idea..." autoFocus />
                      </label>
                      <label>
                        <span>Description (optional)</span>
                        <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="A brief description of what it does..." rows={3} />
                      </label>
                      <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={() => setShowNewProject(false)}>Cancel</button>
                        <button type="submit" className="btn-create">Create Project</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Project List */}
              <div className="project-header">
                <h3>All Projects ({projects.length})</h3>
                <button className="btn-new" onClick={() => setShowNewProject(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  New Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No projects yet</h3>
                  <p>Create your first Box to get started with MetaBox AI</p>
                  <button className="btn-new large" onClick={() => setShowNewProject(true)}>Create Your First Project</button>
                </div>
              ) : (
                <div className="project-grid">
                  {projects.map(p => (
                    <div key={p.id} className="project-card">
                      <div className="pc-top">
                        <div className="pc-status" style={{ background: statusColors[p.status] || '#64748b' }}>{p.status}</div>
                        <button className="pc-delete" onClick={() => handleDelete(p.id)} title="Delete project">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                      <h4>{p.name}</h4>
                      {p.description && <p className="pc-desc">{p.description}</p>}
                      <div className="pc-meta">
                        <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Link href="/launch" className="pc-launch">Open in Builder →</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ ANALYTICS TAB ═══ */}
          {activeTab === 'overview' && (
            <div className="fade-in">
              <div className="analytics-placeholder">
                <div className="empty-icon">📊</div>
                <h3>Analytics Dashboard</h3>
                <p>Your project analytics will appear here once you have active projects generating traffic and revenue.</p>
                <div className="demo-stats">
                  <div className="demo-stat"><strong>$0</strong><span>MRR</span></div>
                  <div className="demo-stat"><strong>0</strong><span>Active Users</span></div>
                  <div className="demo-stat"><strong>0%</strong><span>Churn Rate</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ AI ASSISTANT TAB ═══ */}
          {activeTab === 'ai' && (
            <div className="fade-in">
              <AIChat userName={user.name} />
            </div>
          )}

          {/* ═══ SETTINGS TAB ═══ */}
          {activeTab === 'settings' && (
            <div className="fade-in">
              <div className="settings-section">
                <h3>Profile</h3>
                <div className="settings-grid">
                  <div className="settings-field">
                    <span>Name</span>
                    <div className="settings-val">{user.name}</div>
                  </div>
                  <div className="settings-field">
                    <span>Email</span>
                    <div className="settings-val">{user.email}</div>
                  </div>
                  <div className="settings-field">
                    <span>Member Since</span>
                    <div className="settings-val">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="settings-field">
                    <span>Plan</span>
                    <div className="settings-val"><span className="plan-badge">Free Starter</span></div>
                  </div>
                </div>
              </div>
              <div className="settings-section danger">
                <h3>Danger Zone</h3>
                <p>Signing out will return you to the landing page. Your projects are saved locally.</p>
                <button className="btn-danger" onClick={handleLogout}>Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </main>

      
    </div>
  );
}

/* ── AI Chat Sub-Component ── */
function AIChat({ userName }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Welcome, ${userName}! 👋 I'm your MetaBox AI assistant. Ask me anything — from product strategy to code questions.` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  const send = async () => {
    if (!input.trim() || typing) return;
    
    const userMsg = { role: 'user', text: input.trim() };
    const conversation = [...messages, userMsg];
    
    setMessages(conversation);
    setInput('');
    setTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Network error fetching chat response.");
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="chat-wrap">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-row ${m.role}`}>
            <div className="chat-ava">{m.role === 'ai' ? '🤖' : '👤'}</div>
            <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="chat-row ai">
            <div className="chat-ava">🤖</div>
            <div className="chat-bubble typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text" placeholder="Ask your AI co-founder..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={typing} style={{ opacity: typing ? 0.6 : 1, cursor: typing ? 'not-allowed' : 'pointer' }}>
          {typing ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

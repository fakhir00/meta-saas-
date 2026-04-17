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

      {/* ═══ STYLES ═══ */}
      <style jsx>{`
        .dash { display: flex; min-height: 100vh; background: #050811; }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        /* ── Sidebar ── */
        .sidebar {
          width: 260px; flex-shrink: 0; display: flex; flex-direction: column;
          background: rgba(255,255,255,0.015); border-right: 1px solid rgba(255,255,255,0.06);
          padding: 1.5rem; position: sticky; top: 0; height: 100vh;
        }
        .sb-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .sb-logo {
          display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1.1rem;
          color: #f1f5f9; text-decoration: none; font-style: italic; letter-spacing: -0.03em;
        }
        .sb-close { display: none; background: none; border: none; color: #64748b; font-size: 1.2rem; cursor: pointer; }
        .sb-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .sb-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px;
          background: transparent; border: none; color: #94a3b8; font-size: 0.88rem; font-weight: 500;
          cursor: pointer; transition: all 0.2s; text-align: left; width: 100%;
        }
        .sb-item:hover { background: rgba(255,255,255,0.04); color: #e2e8f0; }
        .sb-item.active { background: rgba(59,130,246,0.1); color: #60a5fa; font-weight: 600; }
        .sb-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem; }
        .sb-user { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
        .sb-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; color: #fff; font-size: 0.9rem;
        }
        .sb-user-info strong { display: block; color: #e2e8f0; font-size: 0.85rem; }
        .sb-user-info span { font-size: 0.72rem; color: #64748b; }
        .sb-logout {
          width: 100%; padding: 8px; border-radius: 8px; background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.15); color: #f87171; font-size: 0.8rem;
          font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .sb-logout:hover { background: rgba(239,68,68,0.12); }

        /* ── Main ── */
        .dash-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .dash-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; background: rgba(5,8,17,0.9); backdrop-filter: blur(12px);
          z-index: 50;
        }
        .dash-header-left { display: flex; align-items: center; gap: 1rem; }
        .dash-header h2 { font-size: 1.15rem; font-weight: 700; color: #f1f5f9; margin: 0; }
        .mobile-menu {
          display: none; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; padding: 4px;
        }
        .mobile-menu span { width: 18px; height: 2px; background: #94a3b8; border-radius: 2px; }
        .header-cta {
          padding: 8px 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff;
          text-decoration: none; transition: 0.3s;
        }
        .header-cta:hover { box-shadow: 0 4px 18px rgba(59,130,246,0.35); color: #fff; }

        .dash-content { padding: 2rem; flex: 1; }

        /* ── Metrics Row ── */
        .metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .metric-card {
          padding: 1.5rem; border-radius: 16px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .metric-top { margin-bottom: 0.75rem; }
        .metric-icon { font-size: 1.5rem; }
        .metric-val { font-size: 2rem; font-weight: 900; color: #f1f5f9; }
        .metric-lbl { font-size: 0.8rem; color: #64748b; margin-bottom: 0.75rem; }

        /* ── Project Header ── */
        .project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .project-header h3 { font-size: 1.1rem; color: #f1f5f9; font-weight: 700; margin: 0; }
        .btn-new {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px;
          background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
          color: #60a5fa; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .btn-new:hover { background: rgba(59,130,246,0.18); }
        .btn-new.large { padding: 12px 24px; font-size: 0.95rem; }

        /* ── Empty State ── */
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 5rem 2rem; text-align: center;
        }
        .empty-icon { font-size: 4rem; margin-bottom: 1.5rem; }
        .empty-state h3 { font-size: 1.4rem; color: #f1f5f9; margin-bottom: 0.5rem; }
        .empty-state p { color: #64748b; font-size: 0.95rem; margin-bottom: 2rem; }

        /* ── Project Grid ── */
        .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .project-card {
          padding: 1.5rem; border-radius: 16px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06); transition: 0.3s;
        }
        .project-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); }
        .pc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .pc-status {
          display: inline-block; padding: 3px 10px; border-radius: 100px;
          font-size: 0.7rem; font-weight: 700; color: #fff; text-transform: uppercase;
        }
        .pc-delete {
          background: none; border: none; color: #475569; cursor: pointer; padding: 4px;
          transition: 0.2s; border-radius: 6px;
        }
        .pc-delete:hover { color: #f87171; background: rgba(239,68,68,0.08); }
        .project-card h4 { font-size: 1.1rem; color: #f1f5f9; font-weight: 700; margin-bottom: 0.4rem; }
        .pc-desc { font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem; line-height: 1.5; }
        .pc-meta { font-size: 0.75rem; color: #475569; margin-bottom: 1rem; }
        .pc-launch {
          display: block; text-align: center; padding: 10px; border-radius: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-decoration: none;
          transition: 0.2s;
        }
        .pc-launch:hover { background: rgba(59,130,246,0.08); color: #60a5fa; border-color: rgba(59,130,246,0.2); }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem;
        }
        .modal-card {
          width: 100%; max-width: 480px; padding: 2.5rem; border-radius: 20px;
          background: #0c1222; border: 1px solid rgba(255,255,255,0.08);
        }
        .modal-card h3 { font-size: 1.3rem; color: #f1f5f9; margin-bottom: 1.5rem; }
        .modal-card form { display: flex; flex-direction: column; gap: 1.25rem; }
        .modal-card label span {
          display: block; font-size: 0.82rem; font-weight: 600; color: #94a3b8;
          margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .modal-card input, .modal-card textarea {
          width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 0.95rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #f1f5f9; outline: none; resize: vertical; font-family: inherit;
        }
        .modal-card input:focus, .modal-card textarea:focus { border-color: #3b82f6; }
        .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
        .btn-cancel {
          padding: 10px 20px; border-radius: 10px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); color: #94a3b8; font-weight: 600;
          cursor: pointer; font-size: 0.9rem;
        }
        .btn-create {
          padding: 10px 24px; border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff;
          border: none; font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: 0.3s;
        }
        .btn-create:hover { box-shadow: 0 4px 18px rgba(59,130,246,0.35); }

        /* ── Analytics Placeholder ── */
        .analytics-placeholder {
          display: flex; flex-direction: column; align-items: center; padding: 4rem 2rem; text-align: center;
        }
        .analytics-placeholder h3 { font-size: 1.3rem; color: #f1f5f9; margin-bottom: 0.5rem; }
        .analytics-placeholder p { color: #64748b; max-width: 500px; margin-bottom: 2rem; }
        .demo-stats { display: flex; gap: 3rem; }
        .demo-stat strong { display: block; font-size: 2rem; font-weight: 900; color: #f1f5f9; }
        .demo-stat span { font-size: 0.8rem; color: #64748b; }

        /* ── Settings ── */
        .settings-section {
          padding: 2rem; border-radius: 16px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06); margin-bottom: 1.5rem;
        }
        .settings-section h3 { font-size: 1.1rem; color: #f1f5f9; margin-bottom: 1.5rem; }
        .settings-section.danger { border-color: rgba(239,68,68,0.15); }
        .settings-section.danger h3 { color: #f87171; }
        .settings-section p { color: #64748b; font-size: 0.9rem; margin-bottom: 1rem; }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .settings-field span { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
        .settings-val { font-size: 0.95rem; color: #e2e8f0; font-weight: 500; }
        .plan-badge {
          display: inline-block; padding: 3px 10px; border-radius: 6px;
          background: rgba(59,130,246,0.1); color: #60a5fa; font-size: 0.8rem; font-weight: 600;
        }
        .btn-danger {
          padding: 10px 24px; border-radius: 10px; background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2); color: #f87171; font-weight: 600;
          font-size: 0.9rem; cursor: pointer; transition: 0.2s;
        }
        .btn-danger:hover { background: rgba(239,68,68,0.15); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed; left: -280px; top: 0; height: 100vh; z-index: 200;
            transition: left 0.3s ease; background: #0c1222;
          }
          .sidebar.open { left: 0; }
          .sb-close { display: block; }
          .mobile-menu { display: flex; }
          .metrics-row { grid-template-columns: 1fr; }
          .project-grid { grid-template-columns: 1fr; }
          .settings-grid { grid-template-columns: 1fr; }
          .dash-content { padding: 1.25rem; }
          .demo-stats { flex-direction: column; gap: 1.5rem; }
        }
      `}</style>
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

  const responses = [
    'Based on current market trends, I\'d recommend focusing on a B2B vertical SaaS. The pain points are clearer and customers are willing to pay more.',
    'Great question! For your MVP, I suggest starting with just 3 core features. Anything more and you risk delaying launch without meaningful learnings.',
    'I analyzed your project structure. Consider adding a webhook integration — it\'s a high-value feature that enterprise customers consistently request.',
    'Your pricing looks competitive. One suggestion: add a usage-based component to the Studio tier. It aligns incentives and grows with your customers.',
    'For outreach, the most effective channel right now is LinkedIn DMs + cold email combos. I can draft templates if you\'d like.',
  ];

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: responses[Math.floor(Math.random() * responses.length)] }]);
      setTyping(false);
    }, 1200 + Math.random() * 1000);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="chat-wrap">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-row ${m.role}`}>
            <div className="chat-ava">{m.role === 'ai' ? '🤖' : '👤'}</div>
            <div className="chat-bubble">{m.text}</div>
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
        <button onClick={send}>Send</button>
      </div>

      <style jsx>{`
        .chat-wrap {
          display: flex; flex-direction: column; height: calc(100vh - 160px);
          border-radius: 16px; background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.06); overflow: hidden;
        }
        .chat-messages { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .chat-row { display: flex; gap: 10px; align-items: flex-start; }
        .chat-row.user { flex-direction: row-reverse; }
        .chat-ava {
          width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center;
          justify-content: center; font-size: 1rem; background: rgba(255,255,255,0.04);
          flex-shrink: 0;
        }
        .chat-bubble {
          max-width: 70%; padding: 10px 16px; border-radius: 12px;
          font-size: 0.9rem; line-height: 1.6; color: #e2e8f0;
          background: rgba(255,255,255,0.04);
        }
        .chat-row.user .chat-bubble { background: rgba(59,130,246,0.12); color: #f1f5f9; }
        .typing span {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: #64748b; margin: 0 2px; animation: bounce 1.4s infinite both;
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .chat-input-row { display: flex; gap: 8px; padding: 1rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .chat-input-row input {
          flex: 1; padding: 10px 16px; border-radius: 10px; font-size: 0.9rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #f1f5f9; outline: none;
        }
        .chat-input-row input:focus { border-color: #3b82f6; }
        .chat-input-row button {
          padding: 10px 20px; border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff;
          border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer;
        }
      `}</style>
    </div>
  );
}

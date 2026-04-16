'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ---- Mini Chart Component ---- */
function MiniChart({ data, color, height = 60 }) {
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

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '00');

    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prevX = (i - 1) * stepX;
        const prevY = height - ((data[i - 1] - min) / range) * (height * 0.8) - height * 0.1;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    ctx.lineTo(w, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prevX = (i - 1) * stepX;
        const prevY = height - ((data[i - 1] - min) / range) * (height * 0.8) - height * 0.1;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // End dot
    const lastX = (data.length - 1) * stepX;
    const lastY = height - ((data[data.length - 1] - min) / range) * (height * 0.8) - height * 0.1;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, color, height]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: `${height}px` }} />;
}

/* ---- Bar Chart ---- */
function BarChart({ data, labels, color, height = 180 }) {
  const maxVal = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: `${height}px`, padding: '0 4px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{v}</span>
          <div
            style={{
              width: '100%',
              maxWidth: '36px',
              height: `${(v / maxVal) * 80}%`,
              background: `linear-gradient(180deg, ${color}, ${color}60)`,
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.5s ease',
              minHeight: '4px',
            }}
          />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- Chat Interface ---- */
function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome back, Strategic Director! 👋 Your SaaS is performing well. MRR grew 12% this week. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const aiResponses = [
    'Based on your current metrics, I recommend focusing on converting the 8 warm leads in your pipeline. Want me to draft personalized follow-up emails?',
    'Your churn rate decreased by 2.1% this month — great work on the onboarding flow improvements! The automated welcome sequence is performing 34% above benchmark.',
    'I analyzed your competitor landscape. Three new entrants have appeared, but none offer your automated document collection feature. This remains your key differentiator.',
    'Your top-performing outreach template has a 18% reply rate. I suggest A/B testing the subject line with a more specific pain point. Want me to generate variations?',
    'Revenue forecast for next month: $4,200-$4,800 based on current pipeline velocity. You need 3 more conversions to hit your $5K target.',
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="chat-avatar">
              {msg.role === 'ai' ? '🤖' : '👤'}
            </div>
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-msg ai">
            <div className="chat-avatar">🤖</div>
            <div className="chat-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          className="input-field"
          placeholder="Ask your AI Co-Founder..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

/* ===== DASHBOARD PAGE ===== */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const metrics = [
    { label: 'Monthly Revenue', value: '$3,847', change: '+12.4%', positive: true, icon: '💰', data: [1200, 1800, 2100, 2400, 2900, 3200, 3847], color: '#10b981' },
    { label: 'Active Users', value: '148', change: '+8.2%', positive: true, icon: '👥', data: [45, 62, 78, 95, 110, 128, 148], color: '#3b82f6' },
    { label: 'Churn Rate', value: '2.3%', change: '-0.8%', positive: true, icon: '📉', data: [5.2, 4.8, 4.1, 3.7, 3.2, 3.1, 2.3], color: '#f59e0b' },
    { label: 'Lead Pipeline', value: '34', change: '+15', positive: true, icon: '🎯', data: [8, 12, 15, 19, 22, 28, 34], color: '#8b5cf6' },
  ];

  const recentActivity = [
    { time: '2 min ago', text: 'New user signed up: sarah@acme.co', type: 'user' },
    { time: '15 min ago', text: 'Lead reply received from John at TechCorp', type: 'lead' },
    { time: '1 hour ago', text: 'Outreach batch #12 completed (50 emails)', type: 'outreach' },
    { time: '3 hours ago', text: 'Customer upgraded to Growth plan', type: 'revenue' },
    { time: '5 hours ago', text: 'AI onboarding assisted 3 new clients', type: 'ai' },
    { time: '1 day ago', text: 'Weekly report generated and emailed', type: 'report' },
  ];

  const outreachCampaigns = [
    { name: 'Cold Email Batch #12', status: 'Active', sent: 200, replies: 18, meetings: 5, progress: 72 },
    { name: 'LinkedIn Campaign #3', status: 'Active', sent: 150, replies: 24, meetings: 8, progress: 85 },
    { name: 'Follow-up Sequence #7', status: 'Paused', sent: 80, replies: 12, meetings: 3, progress: 45 },
    { name: 'Referral Outreach #1', status: 'Completed', sent: 50, replies: 15, meetings: 6, progress: 100 },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ai', label: 'AI Command Center', icon: '🤖' },
    { id: 'blueprint', label: 'Blueprint', icon: '📐' },
    { id: 'outreach', label: 'Outreach Tracker', icon: '📧' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🎯 Command Center</h3>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-plan">
            <span className="badge badge-green">Growth Plan</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>23 days remaining</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dash-main">
        <div className="dash-topbar">
          <button className="dash-menu-btn" onClick={() => setSidebarOpen(true)}>
            <span /><span /><span />
          </button>
          <div>
            <h2>{sidebarItems.find(s => s.id === activeTab)?.icon} {sidebarItems.find(s => s.id === activeTab)?.label}</h2>
          </div>
          <div className="dash-topbar-right">
            <span className="badge badge-blue">🔔 3 notifications</span>
          </div>
        </div>

        <div className="dash-content">
          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <div className="metrics-grid">
                {metrics.map((m, i) => (
                  <div key={i} className="glass-card metric-card">
                    <div className="metric-top">
                      <span className="metric-icon">{m.icon}</span>
                      <span className={`metric-change ${m.positive ? 'positive' : 'negative'}`}>{m.change}</span>
                    </div>
                    <div className="metric-value">{m.value}</div>
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-chart">
                      <MiniChart data={m.data} color={m.color} height={50} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="overview-grid">
                <div className="glass-card">
                  <h3>📈 Revenue Trend (Last 7 Months)</h3>
                  <div style={{ marginTop: '1.25rem' }}>
                    <BarChart
                      data={[1200, 1800, 2100, 2400, 2900, 3200, 3847]}
                      labels={['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']}
                      color="#10b981"
                    />
                  </div>
                </div>

                <div className="glass-card">
                  <h3>🕐 Recent Activity</h3>
                  <div className="activity-list">
                    {recentActivity.map((a, i) => (
                      <div key={i} className="activity-item">
                        <span className="activity-dot" />
                        <div>
                          <p>{a.text}</p>
                          <span className="activity-time">{a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== AI TAB ===== */}
          {activeTab === 'ai' && (
            <div className="animate-fade-in">
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🤖</span>
                  <h4>AI Co-Founder Assistant</h4>
                  <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Online</span>
                </div>
                <ChatInterface />
              </div>
            </div>
          )}

          {/* ===== BLUEPRINT TAB ===== */}
          {activeTab === 'blueprint' && (
            <div className="animate-fade-in">
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>📐 Current Blueprint</h3>
                  <span className="badge badge-green">Active</span>
                </div>
                <div className="bp-info">
                  <h2 style={{ marginBottom: '0.5rem' }}>ClientFlow — Intelligent Client Onboarding</h2>
                  <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>Turn chaotic client intake into a 5-minute automated workflow</p>
                </div>
                <div className="bp-stats-grid">
                  {[
                    { label: 'Architecture', value: 'Next.js + Express' },
                    { label: 'Database', value: 'PostgreSQL + Prisma' },
                    { label: 'Auth', value: 'NextAuth.js + JWT' },
                    { label: 'Hosting', value: 'Vercel + Railway' },
                    { label: 'Status', value: 'MVP Ready' },
                    { label: 'Last Updated', value: 'Today' },
                  ].map((s, i) => (
                    <div key={i} className="bp-stat">
                      <span className="bp-stat-label">{s.label}</span>
                      <span className="bp-stat-value">{s.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <Link href="/launch" className="btn btn-secondary">Regenerate Blueprint</Link>
                </div>
              </div>
            </div>
          )}

          {/* ===== OUTREACH TAB ===== */}
          {activeTab === 'outreach' && (
            <div className="animate-fade-in">
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.25rem' }}>📧 Outreach Campaigns</h3>
                <div className="campaigns-table">
                  <div className="table-header">
                    <span>Campaign</span>
                    <span>Status</span>
                    <span>Sent</span>
                    <span>Replies</span>
                    <span>Meetings</span>
                    <span>Progress</span>
                  </div>
                  {outreachCampaigns.map((c, i) => (
                    <div key={i} className="table-row">
                      <span className="campaign-name">{c.name}</span>
                      <span>
                        <span className={`badge ${c.status === 'Active' ? 'badge-green' : c.status === 'Completed' ? 'badge-blue' : 'badge-orange'}`}>{c.status}</span>
                      </span>
                      <span>{c.sent}</span>
                      <span>{c.replies}</span>
                      <span>{c.meetings}</span>
                      <span>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${c.progress}%` }} />
                        </div>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                <h3>📊 Outreach Performance</h3>
                <div style={{ marginTop: '1.25rem' }}>
                  <BarChart
                    data={[50, 80, 120, 150, 200, 180, 200]}
                    labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']}
                    color="#3b82f6"
                    height={160}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== SETTINGS TAB ===== */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>⚙️ Platform Settings</h3>
                <div className="settings-grid">
                  <div className="setting-group">
                    <label>Business Name</label>
                    <input type="text" className="input-field" defaultValue="ClientFlow" />
                  </div>
                  <div className="setting-group">
                    <label>Contact Email</label>
                    <input type="email" className="input-field" defaultValue="founder@clientflow.io" />
                  </div>
                  <div className="setting-group">
                    <label>OpenAI API Key</label>
                    <input type="password" className="input-field" defaultValue="sk-••••••••••••" />
                  </div>
                  <div className="setting-group">
                    <label>Timezone</label>
                    <select className="input-field">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+5 (Pakistan)</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary">Save Changes</button>
                  <button className="btn btn-secondary">Reset</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: calc(100vh - var(--nav-height));
          background: var(--bg-primary);
        }

        /* Sidebar */
        .dash-sidebar {
          width: var(--sidebar-width);
          min-width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: var(--nav-height);
          height: calc(100vh - var(--nav-height));
        }
        .sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sidebar-header h3 {
          font-size: 1rem;
        }
        .sidebar-close {
          display: none;
          background: none;
          color: var(--text-tertiary);
          font-size: 1.2rem;
        }
        .sidebar-nav {
          flex: 1;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.7rem 0.9rem;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          text-align: left;
          width: 100%;
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        .sidebar-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
          font-weight: 600;
        }
        .sidebar-icon {
          font-size: 1.1rem;
        }
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-glass);
        }
        .sidebar-plan {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        /* Main */
        .dash-main {
          flex: 1;
          min-width: 0;
        }
        .dash-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-glass);
          background: var(--bg-secondary);
          position: sticky;
          top: var(--nav-height);
          z-index: 10;
        }
        .dash-topbar h2 {
          font-size: 1.1rem;
        }
        .dash-menu-btn {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          padding: 4px;
        }
        .dash-menu-btn span {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
        }
        .dash-content {
          padding: 1.5rem;
        }

        /* Metrics */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .metric-card {
          padding: 1.25rem;
        }
        .metric-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .metric-icon {
          font-size: 1.5rem;
        }
        .metric-change {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }
        .metric-change.positive {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-green);
        }
        .metric-change.negative {
          background: rgba(239, 68, 68, 0.15);
          color: var(--accent-red);
        }
        .metric-card .metric-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .metric-card .metric-label {
          font-size: 0.82rem;
          color: var(--text-tertiary);
          margin-top: 0.2rem;
          margin-bottom: 0.75rem;
        }

        /* Overview Grid */
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        /* Activity */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 1rem;
        }
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.7rem 0;
          border-bottom: 1px solid var(--border-glass);
        }
        .activity-item:last-child {
          border-bottom: none;
        }
        .activity-dot {
          width: 8px;
          height: 8px;
          min-width: 8px;
          border-radius: 50%;
          background: var(--accent-blue);
          margin-top: 6px;
        }
        .activity-item p {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }
        .activity-time {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* Chat */
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 500px;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .chat-msg {
          display: flex;
          gap: 0.6rem;
          max-width: 85%;
        }
        .chat-msg.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .chat-avatar {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        .chat-bubble {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .chat-msg.ai .chat-bubble {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border-bottom-left-radius: 4px;
        }
        .chat-msg.user .chat-bubble {
          background: var(--accent-blue);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.typing {
          display: flex;
          gap: 4px;
          padding: 0.75rem 1rem;
        }
        .chat-bubble.typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-tertiary);
          animation: typingBounce 1.4s infinite ease-in-out;
        }
        .chat-bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-bubble.typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .chat-input-row {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid var(--border-glass);
        }

        /* Campaigns Table */
        .campaigns-table {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .table-header, .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 0.7fr 0.7fr 0.7fr 1fr;
          gap: 1rem;
          padding: 0.75rem 0;
          align-items: center;
          font-size: 0.88rem;
        }
        .table-header {
          border-bottom: 1px solid var(--border-glass);
          color: var(--text-tertiary);
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .table-row {
          border-bottom: 1px solid var(--border-glass);
          color: var(--text-secondary);
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .campaign-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        .progress-track {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--gradient-primary);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        /* Blueprint */
        .bp-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .bp-stat {
          padding: 0.75rem;
          background: rgba(0,0,0,0.2);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }
        .bp-stat-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: 0.25rem;
        }
        .bp-stat-value {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        /* Settings */
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .setting-group label {
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .overview-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .dash-sidebar {
            position: fixed;
            left: 0;
            top: var(--nav-height);
            z-index: 100;
            transform: translateX(-100%);
            transition: transform var(--transition-base);
          }
          .dash-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-close {
            display: block;
          }
          .dash-menu-btn {
            display: flex;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .table-header, .table-row {
            grid-template-columns: 1.5fr 0.8fr 1fr;
          }
          .table-header span:nth-child(n+4),
          .table-row span:nth-child(n+4) {
            display: none;
          }
          .bp-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

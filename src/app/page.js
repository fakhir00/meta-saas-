'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ThreeDScene = dynamic(() => import('@/components/ThreeDScene'), { ssr: false });

const workflowNodes = [
  {
    id: 'research',
    title: 'Signal Scan',
    duration: 'Day 1',
    description: 'Map painful workflows, rank urgency, and lock one high-intent niche.'
  },
  {
    id: 'blueprint',
    title: 'MVP Blueprint',
    duration: 'Day 2',
    description: 'Define strict anti-bloat scope, data model, and one value-delivery flow.'
  },
  {
    id: 'automation',
    title: 'Automation Core',
    duration: 'Day 3-5',
    description: 'Ship AI logic, guardrails, and orchestration scripts for reliable output.'
  },
  {
    id: 'outreach',
    title: 'Revenue Sprint',
    duration: 'Week 2',
    description: 'Launch outreach sequences, track meetings, and close first paid pilots.'
  }
];

const weekRows = [
  { phase: 'Discovery', owner: 'Founder', task: 'Interview 10 operators', kpi: '3 urgent pain signals', status: 'In Progress' },
  { phase: 'Product', owner: 'AI Robot', task: 'Generate strict blueprint', kpi: 'MVP scope frozen', status: 'Ready' },
  { phase: 'Build', owner: 'Tech Lead', task: 'Ship command center UI', kpi: 'Core flow live', status: 'Planned' },
  { phase: 'Sales', owner: 'Growth', task: 'Run 5-day outbound burst', kpi: '8 qualified calls', status: 'Planned' }
];

const monthRows = [
  { phase: 'Discovery', owner: 'Founder', task: 'Niche locked + PMF proof', kpi: '1 validated niche', status: 'Done' },
  { phase: 'Product', owner: 'AI Robot', task: 'AI workflow v1 shipped', kpi: '90% task coverage', status: 'In Progress' },
  { phase: 'Build', owner: 'Tech Lead', task: 'Dashboard + launch flow', kpi: '< 60 min onboarding', status: 'In Progress' },
  { phase: 'Sales', owner: 'Growth', task: '30-day outreach engine', kpi: 'First 5 customers', status: 'Planned' }
];

export default function Home() {
  const [founderName, setFounderName] = useState('Founder');
  const [segment, setSegment] = useState('Operations-heavy B2B teams');
  const [hours, setHours] = useState(18);
  const [activeNode, setActiveNode] = useState(workflowNodes[0].id);
  const [tableView, setTableView] = useState('week');

  const activeStep = workflowNodes.find((node) => node.id === activeNode) ?? workflowNodes[0];

  const metrics = useMemo(() => {
    const executionVelocity = Math.min(98, Math.round(hours * 2.1 + 42));
    const autopilotCoverage = Math.min(93, Math.round(hours * 1.7 + 28));
    const mrrTarget = 1000 + hours * 180;

    return {
      executionVelocity,
      autopilotCoverage,
      mrrTarget
    };
  }, [hours]);

  const tableRows = tableView === 'week' ? weekRows : monthRows;

  const segmentChart = useMemo(() => {
    const base = segment.includes('B2B') ? [18, 32, 48, 66] : [14, 25, 36, 48];
    return base.map((n, i) => n + Math.round(hours * (0.4 + i * 0.1)));
  }, [hours, segment]);

  const scrollToRoadmap = () => {
    document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="meta-home" id="top">
      <section className="hero section-wrap" id="overview">
        <div className="hero-copy">
          <p className="eyebrow">Business-in-a-Box Co-Founder</p>
          <h1>
            Build your <span>most personalized</span> SaaS engine, not another template landing page.
          </h1>
          <p className="subtitle">
            We kept your current visual language as the base and upgraded it into an action-first command center with real interactions.
          </p>

          <div className="founder-console">
            <div className="field-grid">
              <label>
                Founder Name
                <input
                  value={founderName}
                  onChange={(event) => setFounderName(event.target.value)}
                  placeholder="Type your name"
                  className="text-input"
                />
              </label>
              <label>
                Target Segment
                <select value={segment} onChange={(event) => setSegment(event.target.value)} className="text-input">
                  <option>Operations-heavy B2B teams</option>
                  <option>Agencies and consultancies</option>
                  <option>Founder-led eCommerce brands</option>
                </select>
              </label>
            </div>
            <label className="range-label">
              Weekly build hours: <strong>{hours}h</strong>
              <input type="range" min="6" max="40" value={hours} onChange={(event) => setHours(Number(event.target.value))} />
            </label>
            <div className="hero-actions">
              <button type="button" className="cta-primary" onClick={scrollToRoadmap}>
                Generate Roadmap
              </button>
              <Link href="/launch" className="cta-secondary">
                Open Launch Console
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="scene-shell">
            <ThreeDScene />
          </div>
          <div className="profile-card">
            <p className="profile-top">Strategic Director Profile</p>
            <h3>{founderName || 'Founder'}</h3>
            <p>{segment}</p>
            <div className="metric-row">
              <div>
                <span>{metrics.executionVelocity}%</span>
                <small>Execution Velocity</small>
              </div>
              <div>
                <span>{metrics.autopilotCoverage}%</span>
                <small>AI Coverage</small>
              </div>
              <div>
                <span>${metrics.mrrTarget.toLocaleString()}</span>
                <small>Month-1 Target</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="workflow section-wrap" id="workflow">
        <div className="section-head">
          <h2>Interactive Build Diagram</h2>
          <p>Click each phase to inspect what must happen and why it matters.</p>
        </div>

        <div className="workflow-grid">
          <div className="node-column">
            {workflowNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`workflow-node ${activeNode === node.id ? 'active' : ''}`}
                onClick={() => setActiveNode(node.id)}
              >
                <span>{node.title}</span>
                <small>{node.duration}</small>
              </button>
            ))}
          </div>

          <div className="diagram-panel">
            <svg viewBox="0 0 560 200" role="img" aria-label="Execution diagram" className="diagram-svg">
              <defs>
                <linearGradient id="flow" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path d="M 30 100 C 130 20, 200 180, 300 100 S 490 20, 530 100" fill="none" stroke="url(#flow)" strokeWidth="5" />
              {[70, 200, 330, 470].map((x, index) => (
                <g key={x}>
                  <circle cx={x} cy="100" r={activeNode === workflowNodes[index].id ? '18' : '12'} fill={activeNode === workflowNodes[index].id ? '#22d3ee' : '#1e293b'} />
                  <text x={x} y="106" textAnchor="middle" fill="#e2e8f0" fontSize="10">
                    {index + 1}
                  </text>
                </g>
              ))}
            </svg>
            <div className="step-details">
              <h3>{activeStep.title}</h3>
              <p>{activeStep.description}</p>
              <span>{activeStep.duration}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics section-wrap" id="metrics">
        <div className="section-head">
          <h2>Execution Table + Live Priority View</h2>
          <p>No dead controls: every row maps to owner, KPI, and delivery status.</p>
        </div>

        <div className="table-controls" role="tablist" aria-label="Timeline view">
          <button
            type="button"
            role="tab"
            aria-selected={tableView === 'week'}
            className={tableView === 'week' ? 'active' : ''}
            onClick={() => setTableView('week')}
          >
            Week 1
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tableView === 'month'}
            className={tableView === 'month' ? 'active' : ''}
            onClick={() => setTableView('month')}
          >
            Month 1
          </button>
          <Link href="/dashboard" className="table-link">
            Open Live Dashboard
          </Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Owner</th>
                <th>Task</th>
                <th>KPI</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={`${tableView}-${row.phase}`}>
                  <td>{row.phase}</td>
                  <td>{row.owner}</td>
                  <td>{row.task}</td>
                  <td>{row.kpi}</td>
                  <td>
                    <span className={`status ${row.status.toLowerCase().replace(' ', '-')}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="intel section-wrap" id="studio">
        <div className="section-head">
          <h2>Personalized Intel Studio</h2>
          <p>Meaningful visuals, not random decoration: every card supports planning or execution.</p>
        </div>

        <div className="intel-grid">
          <article className="intel-card chart-card">
            <h3>Segment Opportunity Curve</h3>
            <p>{segment}</p>
            <div className="bar-chart" aria-label="Opportunity trend">
              {segmentChart.map((value, idx) => (
                <div key={`${value}-${idx}`} className="bar-col">
                  <span>{value}</span>
                  <div className="bar" style={{ height: `${Math.max(18, value)}px` }} />
                  <small>W{idx + 1}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="intel-card image-card">
            <h3>Market Radar</h3>
            <p>Visual feed for your niche coverage and expansion points.</p>
            <div className="image-row">
              <Image src="/globe.svg" alt="Market radar globe" width={80} height={80} />
              <Image src="/window.svg" alt="Command view window" width={80} height={80} />
              <Image src="/file.svg" alt="Execution document" width={80} height={80} />
            </div>
          </article>

          <article className="intel-card prompt-card">
            <h3>Founder Prompt Snapshot</h3>
            <code>
              {`Founder: ${founderName || 'Founder'}\nSegment: ${segment}\nHours: ${hours}/week\nFocus: Ship, validate, monetize.`}
            </code>
            <Link href="/launch" className="mini-cta">
              Run This In Launch
            </Link>
          </article>
        </div>
      </section>

      <section className="roadmap section-wrap" id="roadmap">
        <div className="section-head">
          <h2>Roadmap to First 5 Customers</h2>
          <p>One clear path from build to monetization.</p>
        </div>

        <div className="roadmap-grid">
          <div className="roadmap-step">
            <strong>Week 1</strong>
            <p>Finalize pain thesis, launch MVP skeleton, validate with 10 real operators.</p>
          </div>
          <div className="roadmap-step">
            <strong>Week 2</strong>
            <p>Deploy AI command center, automate core flow, publish onboarding walkthrough.</p>
          </div>
          <div className="roadmap-step">
            <strong>Week 3</strong>
            <p>Run outbound sprint, book demos, capture objections, tighten positioning.</p>
          </div>
          <div className="roadmap-step">
            <strong>Week 4</strong>
            <p>Close first pilots, push retention loop, instrument dashboard for growth.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .meta-home {
          background:
            radial-gradient(circle at 18% -10%, rgba(34, 211, 238, 0.24), transparent 42%),
            radial-gradient(circle at 85% 0%, rgba(59, 130, 246, 0.18), transparent 38%),
            #040711;
          color: #d8e0ef;
          min-height: 100vh;
          padding-bottom: 5rem;
        }

        .section-wrap {
          width: min(1120px, calc(100% - 2rem));
          margin: 0 auto;
          padding: 4rem 0;
        }

        .hero {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 1.5rem;
          padding-top: 3.25rem;
          align-items: stretch;
        }

        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.72rem;
          color: #7dd3fc;
          margin-bottom: 0.75rem;
          font-weight: 700;
        }

        h1 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.1;
          color: #f4f8ff;
          letter-spacing: -0.04em;
          max-width: 18ch;
        }

        h1 span {
          color: #7dd3fc;
          font-style: italic;
        }

        .subtitle {
          margin: 1rem 0 1.5rem;
          color: #9db0d3;
          max-width: 60ch;
        }

        .founder-console {
          border: 1px solid rgba(125, 211, 252, 0.2);
          background: linear-gradient(160deg, rgba(15, 23, 42, 0.78), rgba(2, 6, 23, 0.92));
          backdrop-filter: blur(10px);
          border-radius: 18px;
          padding: 1rem;
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          font-size: 0.78rem;
          color: #bfd0ef;
          font-weight: 600;
        }

        .text-input {
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(15, 23, 42, 0.85);
          color: #e2e8f0;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
        }

        .text-input:focus {
          border-color: rgba(34, 211, 238, 0.6);
        }

        .range-label {
          margin-top: 0.9rem;
        }

        .range-label input {
          width: 100%;
        }

        .hero-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .cta-primary,
        .cta-secondary,
        .mini-cta,
        .table-link {
          border-radius: 999px;
          padding: 0.7rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cta-primary {
          color: #031019;
          background: linear-gradient(120deg, #22d3ee, #60a5fa);
          border: none;
        }

        .cta-secondary,
        .table-link,
        .mini-cta {
          border: 1px solid rgba(125, 211, 252, 0.38);
          color: #dbeafe;
          background: rgba(7, 13, 29, 0.72);
        }

        .cta-primary:hover,
        .cta-secondary:hover,
        .table-link:hover,
        .mini-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(14, 165, 233, 0.23);
        }

        .hero-visual {
          display: grid;
          grid-template-rows: 1fr auto;
          gap: 0.9rem;
        }

        .scene-shell {
          position: relative;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: radial-gradient(circle at 50% 10%, rgba(15, 23, 42, 0.55), rgba(2, 6, 23, 0.95));
          border-radius: 20px;
          overflow: hidden;
          min-height: 340px;
        }

        .profile-card {
          border: 1px solid rgba(56, 189, 248, 0.22);
          background: rgba(2, 6, 23, 0.82);
          border-radius: 16px;
          padding: 1rem;
        }

        .profile-top {
          margin: 0;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          color: #7dd3fc;
        }

        .profile-card h3 {
          margin: 0.35rem 0 0.1rem;
          color: #f8fafc;
          font-size: 1.2rem;
        }

        .profile-card > p {
          margin: 0;
          color: #9fb2d8;
          font-size: 0.88rem;
        }

        .metric-row {
          margin-top: 0.9rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.65rem;
        }

        .metric-row span {
          display: block;
          color: #e0f2fe;
          font-size: 1rem;
          font-weight: 700;
        }

        .metric-row small {
          color: #8da3c8;
          font-size: 0.72rem;
        }

        .section-head {
          display: flex;
          flex-wrap: wrap;
          align-items: end;
          justify-content: space-between;
          gap: 0.5rem 2rem;
          margin-bottom: 1rem;
        }

        .section-head h2 {
          margin: 0;
          color: #eff6ff;
          font-size: clamp(1.45rem, 2.8vw, 2.15rem);
        }

        .section-head p {
          margin: 0;
          color: #9fb0cd;
        }

        .workflow-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1rem;
        }

        .node-column {
          display: grid;
          gap: 0.6rem;
        }

        .workflow-node {
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.8);
          color: #d2def4;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem;
          text-align: left;
        }

        .workflow-node small {
          color: #8ea2c8;
          font-size: 0.7rem;
        }

        .workflow-node.active {
          border-color: rgba(34, 211, 238, 0.6);
          box-shadow: 0 14px 26px rgba(34, 211, 238, 0.15);
        }

        .diagram-panel {
          border: 1px solid rgba(125, 211, 252, 0.22);
          background: linear-gradient(170deg, rgba(12, 20, 38, 0.8), rgba(2, 6, 23, 0.94));
          border-radius: 16px;
          padding: 1rem;
        }

        .diagram-svg {
          width: 100%;
          height: 200px;
          display: block;
        }

        .step-details h3 {
          margin: 0.2rem 0;
          color: #f8fbff;
        }

        .step-details p {
          margin: 0 0 0.4rem;
          color: #adc0de;
          max-width: 62ch;
        }

        .step-details span {
          display: inline-block;
          color: #7dd3fc;
          border: 1px solid rgba(125, 211, 252, 0.35);
          border-radius: 999px;
          padding: 0.2rem 0.7rem;
          font-size: 0.74rem;
        }

        .table-controls {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
        }

        .table-controls button {
          border: 1px solid rgba(148, 163, 184, 0.28);
          background: rgba(15, 23, 42, 0.82);
          color: #c7d6f2;
          padding: 0.55rem 0.9rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .table-controls button.active {
          border-color: rgba(34, 211, 238, 0.68);
          color: #d7f8ff;
        }

        .table-wrap {
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 16px;
          overflow-x: auto;
          background: rgba(2, 6, 23, 0.84);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 740px;
        }

        th,
        td {
          text-align: left;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.14);
          color: #d4def2;
          font-size: 0.84rem;
        }

        th {
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #90a7ca;
          font-weight: 700;
        }

        .status {
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          font-size: 0.72rem;
          border: 1px solid;
        }

        .status.done,
        .status.ready {
          color: #86efac;
          border-color: rgba(134, 239, 172, 0.5);
          background: rgba(20, 83, 45, 0.32);
        }

        .status.in-progress {
          color: #7dd3fc;
          border-color: rgba(125, 211, 252, 0.5);
          background: rgba(12, 74, 110, 0.35);
        }

        .status.planned {
          color: #fdba74;
          border-color: rgba(251, 191, 36, 0.4);
          background: rgba(120, 53, 15, 0.35);
        }

        .intel-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 0.9rem;
        }

        .intel-card {
          border: 1px solid rgba(148, 163, 184, 0.22);
          border-radius: 16px;
          padding: 1rem;
          background: linear-gradient(160deg, rgba(15, 23, 42, 0.83), rgba(2, 6, 23, 0.92));
        }

        .intel-card h3 {
          margin: 0;
          color: #f0f9ff;
          font-size: 1rem;
        }

        .intel-card p {
          margin: 0.4rem 0 0.9rem;
          color: #a7bbdf;
          font-size: 0.82rem;
        }

        .bar-chart {
          display: flex;
          align-items: end;
          gap: 0.5rem;
          min-height: 150px;
        }

        .bar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.28rem;
          flex: 1;
        }

        .bar-col span {
          font-size: 0.7rem;
          color: #93c5fd;
        }

        .bar-col small {
          font-size: 0.66rem;
          color: #8ea2c8;
        }

        .bar {
          width: 100%;
          max-width: 40px;
          border-radius: 8px 8px 0 0;
          background: linear-gradient(180deg, #22d3ee, #1d4ed8);
          box-shadow: 0 8px 18px rgba(29, 78, 216, 0.35);
        }

        .image-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem;
          border: 1px dashed rgba(148, 163, 184, 0.36);
          border-radius: 12px;
          background: rgba(8, 15, 31, 0.72);
        }

        .prompt-card code {
          display: block;
          white-space: pre-line;
          font-size: 0.78rem;
          color: #bfdbfe;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 0.8rem;
          margin-bottom: 1rem;
        }

        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .roadmap-step {
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 14px;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.8);
        }

        .roadmap-step strong {
          color: #67e8f9;
          display: block;
          margin-bottom: 0.45rem;
          font-size: 0.84rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .roadmap-step p {
          margin: 0;
          color: #b6c5e4;
          font-size: 0.83rem;
          line-height: 1.5;
        }

        @media (max-width: 980px) {
          .hero,
          .workflow-grid,
          .intel-grid,
          .roadmap-grid {
            grid-template-columns: 1fr;
          }

          .scene-shell {
            min-height: 280px;
          }

          .field-grid {
            grid-template-columns: 1fr;
          }

          .metric-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

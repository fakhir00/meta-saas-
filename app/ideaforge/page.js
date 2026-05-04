'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

/* ────────────────────────────────────────────
   QUESTIONS
   ──────────────────────────────────────────── */
const QUESTIONS = [
  { q: 'What is your education background?', chips: ['High school', "Bachelor's degree", 'Master\'s / PhD', 'Self-taught / Bootcamp'] },
  { q: 'Which field excites you the most?', chips: ['Tech & Software', 'Health & Wellness', 'Education & Learning', 'Finance & Money', 'E-commerce & Retail', 'Creative & Media'] },
  { q: 'What is your programming experience level?', chips: ['None at all', 'Beginner (some basics)', 'Intermediate', 'Advanced / Professional'] },
  { q: 'What tools or software do you regularly use?', chips: ['Microsoft Office', 'Figma / Design tools', 'Python or coding', 'No-code tools (Webflow, Bubble)', 'None yet'] },
  { q: 'Have you ever worked on a project or business before?', chips: ['Yes — it succeeded', "Yes — it didn't work out", 'Currently working on one', 'No, this is my first time'] },
  { q: 'Which industries do you understand well from experience?', chips: ['Healthcare', 'Retail / E-commerce', 'Education', 'Finance / Banking', 'Real estate', 'Other'] },
  { q: 'What type of work do you enjoy most?', chips: ['Technical / Building things', 'Creative / Design', 'Business & Sales', 'Research & Analysis', 'A mix of everything'] },
  { q: 'How much time can you dedicate to this per day?', chips: ['Under 1 hour', '1–2 hours', '3–4 hours', 'Full-time (8h+)'] },
  { q: 'What is your main goal with this SaaS idea?', chips: ['Earn passive income', 'Build a real startup', 'Learn and grow', 'Help others / make impact'] },
  { q: 'What problems do you notice around you that frustrate people or go unsolved?', chips: null },
];

/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

/* ────────────────────────────────────────────
   API CALLS (server-side proxy)
   ──────────────────────────────────────────── */
async function callChat(system, prompt) {
  const res = await fetch('/api/ideaforge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'text', system, prompt }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'API error');
  return data.reply;
}

async function callJSON(prompt) {
  const res = await fetch('/api/ideaforge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'json', prompt }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'API error');
  return data;
}

/* ────────────────────────────────────────────
   COMPONENTS
   ──────────────────────────────────────────── */

function Splash() {
  return (
    <div className="if-splash">
      <div className="if-splash-orb">
        <svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
      </div>
      <div className="if-splash-h">Your <em>SaaS Blueprint</em><br />starts here</div>
      <div className="if-splash-p">MetaBox is your AI business mentor. Answer a few questions and get a complete, personalized SaaS idea — ready to build.</div>
      <div className="if-splash-trio">
        <div className="if-trio-card"><div className="if-trio-icon">💬</div><strong>Just chat</strong>No forms or sign-ups</div>
        <div className="if-trio-card"><div className="if-trio-icon">🧠</div><strong>AI-powered</strong>Tailored to your skills</div>
        <div className="if-trio-card"><div className="if-trio-icon">🚀</div><strong>Full blueprint</strong>Ready to execute</div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="if-msg if-ai">
      <div className="if-av if-av-ai">AI</div>
      <div className="if-bubble if-typing-inner">
        <div className="if-dots"><span /><span /><span /></div>
      </div>
    </div>
  );
}

function AiMessage({ html }) {
  return (
    <div className="if-msg if-ai">
      <div className="if-av if-av-ai">AI</div>
      <div className="if-bubble" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="if-msg if-user">
      <div className="if-av if-av-user">👤</div>
      <div className="if-bubble">{text}</div>
    </div>
  );
}

function ChipRow({ chips, onSelect }) {
  return (
    <div className="if-chips">
      {chips.map((label) => (
        <button key={label} className="if-chip" onClick={() => onSelect(label)}>{label}</button>
      ))}
    </div>
  );
}

function QTracker({ current }) {
  return (
    <div className="if-q-tracker">
      <div className="if-q-dots">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`if-q-dot${i < current ? ' done' : i === current ? ' cur' : ''}`} />
        ))}
      </div>
      <span>Question {current + 1} of 10</span>
    </div>
  );
}

function ThinkingCard({ msg }) {
  return (
    <div className="if-thinking">
      <div className="if-spinner" />
      <div className="if-thinking-txt">
        <strong>{msg}</strong>
        <div className="if-thinking-sub">Usually takes 5–10 seconds…</div>
      </div>
    </div>
  );
}

function Divider({ text }) {
  return <div className="if-divider">{text}</div>;
}

function BlueprintGrid({ bp }) {
  const items = [
    { lbl: 'Your SaaS Idea', hero: true, title: bp.niche_idea, body: null },
    { lbl: 'Problem It Solves', hero: false, title: null, body: bp.problem_statement },
    { lbl: "Who It's For", hero: false, title: null, body: bp.target_users },
    { lbl: 'Core Features', hero: false, title: null, body: null, tags: bp.core_features },
    { lbl: 'How You Make Money', hero: false, title: null, body: bp.monetization_model },
  ];
  const icons = ['💡', '🎯', '👥', '⚙️', '💰'];

  return (
    <div className="if-bp-grid">
      {/* Brand Identity Preview */}
      <div className="if-bp-card hero" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))' }}>
         <div style={{ width: 64, height: 64, borderRadius: '14px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
            <img 
              src={`https://logo.clearbit.com/${bp.niche_idea.toLowerCase().replace(/\s+/g, '') + '.com'}`} 
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bp.niche_idea)}&background=06b6d4&color=fff&bold=true`; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt="Brand Logo"
            />
         </div>
         <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Suggested Identity</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>{bp.niche_idea}</div>
         </div>
      </div>

      {items.map((c, i) => (
        <div key={i} className={`if-bp-card${c.hero ? ' hero' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="if-bp-lbl"><span className="if-bp-dot" />{icons[i]} {c.lbl}</div>
          {c.title && <div className="if-bp-title">{c.title}</div>}
          {c.body && <div className="if-bp-body">{c.body}</div>}
          {c.tags && (
            <div className="if-bp-tags">
              {c.tags.map((t, j) => <span key={j} className="if-bp-tag">{t}</span>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────── */
export default function MetaBoxPage() {
  const [items, setItems] = useState([]); // chat feed items
  const [phase, setPhase] = useState('boot'); // boot | start | skills | thinking | blueprint
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [idea, setIdea] = useState(null);
  const [locked, setLocked] = useState(true);
  const [placeholder, setPlaceholder] = useState('Starting…');
  const [typing, setTyping] = useState(false);
  const [chips, setChips] = useState(null);
  const [tracker, setTracker] = useState(null); // null or current index
  const [thinkingMsg, setThinkingMsg] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [progress, setProgress] = useState(3);
  const [step, setStep] = useState(1);
  const [hint, setHint] = useState('Press Enter to send · Shift+Enter for new line');

  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const phaseRef = useRef(phase);
  const qiRef = useRef(qi);
  const answersRef = useRef(answers);
  const ideaRef = useRef(idea);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { qiRef.current = qi; }, [qi]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { ideaRef.current = idea; }, [idea]);

  const scroll = useCallback(() => {
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 60);
  }, []);

  // Auto-scroll on any items/typing/chips/tracker/thinkingMsg/blueprint change
  useEffect(scroll, [items, typing, chips, tracker, thinkingMsg, blueprint, scroll]);

  const lock = useCallback((v, ph) => {
    setLocked(v);
    if (ph) setPlaceholder(ph);
  }, []);

  const addItem = useCallback((item) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const showTypingThenAI = useCallback(async (html, ms) => {
    setTyping(true);
    scroll();
    await wait(ms || Math.min(650 + html.length * 0.95, 1550));
    setTyping(false);
    addItem({ type: 'ai', html });
  }, [addItem, scroll]);

  const stepLabels = ['', 'Step 1 of 4: Chat', 'Step 2 of 4: Assessment', 'Step 3 of 4: Processing', 'Step 4 of 4: Blueprint'];

  /* ── Ask a question ── */
  const askQuestion = useCallback(async (idx) => {
    const { q, chips: qChips } = QUESTIONS[idx];
    await showTypingThenAI(q, 650);
    if (qChips) setChips(qChips);
    lock(false, qChips ? 'Type or pick an option above…' : 'Share your thoughts freely…');
  }, [showTypingThenAI, lock]);

  /* ── Handle user input ── */
  const handleInput = useCallback(async (text) => {
    setChips(null);
    addItem({ type: 'user', text });
    lock(true, 'Thinking…');

    const currentPhase = phaseRef.current;
    const currentQi = qiRef.current;

    if (currentPhase === 'start') {
      const low = text.toLowerCase().trim();
      const noIdea = /^(no|nope|nah|not yet|help|no idea|none|idk|not sure|unsure|i need|don't|do not)/.test(low) || low.length < 9;

      if (noIdea) {
        setPhase('skills');
        setQi(0);
        setStep(2);
        setProgress(12);
        addItem({ type: 'divider', text: 'Skills Assessment — 10 Questions' });
        await showTypingThenAI('No worries! 😊 I\'ll ask you <strong>10 short questions</strong> to understand your background and find the perfect idea. Just pick an option or type your own answer!', 1100);
        setTracker(0);
        await askQuestion(0);
      } else {
        setIdea(text);
        ideaRef.current = text;
        setPhase('thinking');
        setStep(3);
        setProgress(65);
        addItem({ type: 'divider', text: 'Building Your Blueprint' });
        await showTypingThenAI('Love that idea! 🔥 Let me analyse it and build a <strong>complete SaaS blueprint</strong> for you. Give me a moment…', 900);
        setThinkingMsg('Crafting your personalized blueprint');
        lock(true, 'Generating blueprint…');
        try {
          const bp = await callJSON(`User's SaaS idea: "${text}". Return JSON with keys: niche_idea (1 sentence refined product name), problem_statement (2-3 sentences), target_users (2 sentences), core_features (array of 5 short feature names), monetization_model (2-3 sentences), intro_message (2 warm congratulatory sentences).`);
          setThinkingMsg(null);
          setStep(4);
          setProgress(100);
          await showTypingThenAI(bp.intro_message || 'Here is your blueprint!', 700);
          setBlueprint(bp);
          setPhase('blueprint');
          await wait(800);
          await showTypingThenAI('🎉 Your blueprint is ready! Feel free to ask me anything — how to validate it, find your first customers, or what to build first.', 900);
          setHint('Ask any follow-up question about your blueprint');
          lock(false, 'Ask a follow-up question…');
        } catch {
          setThinkingMsg(null);
          await showTypingThenAI('Something went wrong. Please check your connection and try again.', 400);
          lock(false);
          setPhase('start');
        }
      }
    } else if (currentPhase === 'skills') {
      const newAnswers = { ...answersRef.current, [QUESTIONS[currentQi].q]: text };
      setAnswers(newAnswers);
      answersRef.current = newAnswers;
      const nextQi = currentQi + 1;
      setQi(nextQi);
      qiRef.current = nextQi;

      const pct = 12 + Math.round((nextQi / 10) * 58);
      setProgress(pct);

      if (nextQi < 10) {
        setTracker(nextQi);
        const briefs = ['Got it! 👍', 'Nice! ✏️', 'Interesting! 🤔', 'Perfect! 💡', 'Noted! 📝', 'Great! ✅', 'Awesome! 🙌', 'Thanks! 💬', 'Nearly there! 🏁', 'One more! 🎯'];
        await showTypingThenAI(briefs[(nextQi - 1) % briefs.length], 500);
        await wait(150);
        await askQuestion(nextQi);
      } else {
        setTracker(null);
        setPhase('thinking');
        setStep(3);
        setProgress(78);
        addItem({ type: 'divider', text: 'Processing Your Profile' });
        await showTypingThenAI('That\'s everything I needed! 🎉 Let me now create a <strong>personalised SaaS idea</strong> perfectly matched to your background and goals…', 1000);
        setThinkingMsg('Crafting your personalized SaaS blueprint');
        lock(true, 'Generating blueprint…');
        try {
          const profile = Object.entries(newAnswers).map(([q, a]) => `${q}: ${a}`).join(' | ');
          const bp = await callJSON(`User profile: ${profile}. Suggest one ideal personalized SaaS idea. Return JSON: niche_idea (1 sentence refined name), problem_statement (2-3 sentences), target_users (2 sentences), core_features (array of 5 short feature names), monetization_model (2-3 sentences), intro_message (2-3 sentences explaining why this fits them perfectly).`);
          setThinkingMsg(null);
          setStep(4);
          setProgress(100);
          await showTypingThenAI(bp.intro_message || 'Here is your blueprint!', 700);
          setBlueprint(bp);
          setPhase('blueprint');
          await wait(800);
          await showTypingThenAI('🎉 Your personalized blueprint is ready! Ask me anything — next steps, how to validate, or how to find customers.', 900);
          setHint('Ask any follow-up question about your blueprint');
          lock(false, 'Ask a follow-up question…');
        } catch {
          setThinkingMsg(null);
          await showTypingThenAI('Something went wrong. Please refresh and try again.', 400);
          lock(false);
        }
      }
    } else if (currentPhase === 'blueprint') {
      try {
        setTyping(true);
        const ctx = ideaRef.current
          ? `SaaS idea: "${ideaRef.current}"`
          : Object.entries(answersRef.current).map(([q, a]) => `${q}: ${a}`).join('; ');
        const reply = await callChat(
          'You are a helpful SaaS mentor. Answer concisely and helpfully in 3–4 sentences max. Be warm and actionable.',
          `Context: ${ctx}\nUser question: ${text}`
        );
        setTyping(false);
        addItem({ type: 'ai', html: esc(reply) });
        lock(false, 'Ask another question…');
      } catch {
        setTyping(false);
        addItem({ type: 'ai', html: "I couldn't process that. Please try again." });
        lock(false);
      }
      return;
    }

    if (phaseRef.current === 'skills') lock(false, 'Type or pick an option above…');
  }, [addItem, lock, showTypingThenAI, askQuestion]);

  /* ── Boot sequence ── */
  useEffect(() => {
    (async () => {
      lock(true, 'Starting…');
      await wait(650);
      await showTypingThenAI(
        '👋 Welcome to <strong>MetaBox!</strong> I\'m your AI co-founder.<br><br>Do you already have a SaaS idea in mind — or would you like me to help you discover the perfect one based on your skills?',
        1100
      );
      setChips(['Yes, I have an idea!', 'No, help me find one', "I'm not sure yet"]);
      setPhase('start');
      lock(false, 'Type or pick an option above…');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Chip selection handler ── */
  const handleChipSelect = useCallback((val) => {
    if (phaseRef.current === 'start' && val === 'Yes, I have an idea!') {
      setChips(null);
      lock(true);
      addItem({ type: 'ai', html: 'Great! Describe your idea in a sentence or two — what problem does it solve?' });
      lock(false, 'Describe your idea here…');
    } else {
      handleInput(val === "I'm not sure yet" ? 'no' : val === 'No, help me find one' ? 'no' : val);
    }
  }, [addItem, lock, handleInput]);

  /* ── Send button / Enter ── */
  const handleSend = () => {
    const t = inputRef.current?.value?.trim();
    if (!t || locked) return;
    inputRef.current.value = '';
    inputRef.current.style.height = 'auto';
    handleInput(t);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 108) + 'px';
  };

  /* ── RENDER ── */
  return (
    <div className="if-page">
      <div className="if-app">
        {/* HEADER */}
        <header className="if-header">
          <Link href="/" className="if-logo-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" /></svg>
          </Link>
          <span className="if-logo-name">MetaBox</span>
          <span className="if-logo-badge">AI Co-Founder</span>
          <div className="if-header-right">
            <span className="if-step-label">{stepLabels[step] || ''}</span>
            <div className="if-step-pills">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={`if-pill w${n}${n < step ? ' done' : n === step ? ' active' : ''}`} />
              ))}
            </div>
          </div>
        </header>

        {/* PROGRESS BAR */}
        <div className="if-prog-wrap"><div className="if-prog-bar" style={{ width: `${progress}%` }} /></div>

        {/* CHAT AREA */}
        <div className="if-chat-area" ref={chatRef}>
          <Splash />

          {items.map((item, i) => {
            if (item.type === 'ai') return <AiMessage key={i} html={item.html} />;
            if (item.type === 'user') return <UserMessage key={i} text={item.text} />;
            if (item.type === 'divider') return <Divider key={i} text={item.text} />;
            return null;
          })}

          {typing && <TypingDots />}
          {tracker !== null && <QTracker current={tracker} />}
          {thinkingMsg && <ThinkingCard msg={thinkingMsg} />}
          {blueprint && (
            <>
              <Divider text="Your SaaS Blueprint" />
              <BlueprintGrid bp={blueprint} />
            </>
          )}
          {chips && <ChipRow chips={chips} onSelect={handleChipSelect} />}
        </div>

        {/* INPUT AREA */}
        <div className="if-input-area">
          <div className="if-input-wrap">
            <textarea
              ref={inputRef}
              className="if-inp"
              rows="1"
              placeholder={placeholder}
              disabled={locked}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
            />
            <button className="if-sbtn" onClick={handleSend} disabled={locked}>
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
          <div className="if-inp-hint">{hint}</div>
        </div>
      </div>
    </div>
  );
}

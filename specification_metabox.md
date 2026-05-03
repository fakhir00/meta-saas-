# MetaBox — AI Co-Founder Platform
## Product Specification v2

> **IMPLEMENTATION INSTRUCTIONS:** Read this document top to bottom before writing a single line of code. This specification is complete and implementation-ready. Every section contains exact routes, component names, agent logic, and validation rules. Follow them precisely. Do not add features not listed here. Do not implement anything marked "Out of Scope" or "Phase 2/3".

---

## 1. Executive Summary

**MetaBox** is a web-based AI co-founder platform for non-technical founders. A user describes their business idea in plain English and MetaBox generates a complete, deployment-ready SaaS product: architecture, code, go-to-market strategy, and live deployment — all without a single line of code written by the user.

This product is positioned like **CoWork** (Anthropic's desktop automation tool for non-developers), not like Claude Code. The interface is a guided, visual wizard. There is no terminal, no file system, no command flags. Everything happens in the browser.

### What MetaBox Produces (from one sentence)

| Deliverable | What the User Sees |
|---|---|
| **Requirements Doc** | A plain-English summary of personas, features, and monetization model — editable in-browser |
| **Build Spec** | Full feature breakdown, entity model, API surface, tech stack — shown as visual cards |
| **Feature Tasks** | Per-feature subtasks with time estimates, shown as a Kanban-style board |
| **API Spec** | Endpoint definitions shown in a readable table (no raw JSON exposed to user) |
| **Database Schema** | Entity-relationship diagram rendered visually; raw SQL downloadable on paid plans |
| **UI Spec** | Page-by-page wireframe descriptions rendered as component cards |
| **Deployed App** | A live URL with auth, payments, and analytics wired up — one-click deploy |

### What MetaBox Is NOT

- ❌ Not a CLI tool — there is no terminal, no local installation, no Python environment.
- ❌ Not a no-code template builder — it generates custom, production-grade code per idea.
- ❌ Not a developer tool — the primary user has never opened a terminal.
- ❌ Not an autonomous background agent — the pipeline runs with visible progress and human checkpoints.

### Key Metrics

| Dimension | Value |
|---|---|
| Time from idea to live spec | ~3–5 minutes |
| Time from spec to deployed app | ~8–12 minutes (Phase 2) |
| API cost per run | $0 (Gemini free tier) |
| Infrastructure cost (MetaBox platform) | $0–12/month at launch |
| Concurrent pipeline sessions | Isolated per user session ID |
| Resume support | Yes — failed stages auto-retry; user can re-trigger from last checkpoint |

---

## 2. MVP Scope

The MVP is a **working web application** where a non-technical founder can go from idea to a complete SaaS specification in under 5 minutes. The MVP does not include live code deployment (Phase 2) or team workspaces (Phase 3).

### 2.1 In Scope for MVP

- Landing page (`/`) with hero, features, pricing, and social proof
- Auth pages: Sign Up (`/signup`), Log In (`/login`) via Supabase Auth (email + Google OAuth)
- Launch Wizard (`/launch`) — 3-step intake form (idea, audience, budget)
- Build Dashboard (`/dashboard/[box-id]`) — live pipeline progress view with stage cards
- Results View (`/dashboard/[box-id]/results`) — tabbed display of all 6 deliverables
- Box List (`/dashboard`) — all user Boxes with status badges
- AI pipeline backend: 6 agents running server-side (no subprocess; edge functions or Node workers)
- Session-isolated state: each Box has its own record in Supabase
- Structural validation with error-feedback retry (max 2 retries per agent stage)
- Rate limiter shared across all server workers (Supabase-backed, not file-based)
- Export to PDF/Markdown on paid plans
- Stripe integration: free tier enforced at 1 Box; paid plans unlock more

### 2.2 Explicitly Out of Scope for MVP

> **RULE:** If it is not in the In Scope list above, it does not get built for MVP.

- Live code generation and deployment (Phase 2)
- Team workspaces and shared Boxes (Phase 3)
- Custom tech stack templates (Phase 2)
- White-label (deferred indefinitely)
- In-browser code editor
- Notion / Linear / Jira export (Phase 3)
- Mobile-native app (web is responsive; native app is Phase 3)

---

## 3. Application Architecture

### 3.1 Design Principles

1. **The pipeline is server-side only.** Users never see agent names, JSON files, or technical internals. They see stage names like "Mapping your idea" and "Designing your database."
2. **State lives in Supabase.** Each Box is a database row. Each pipeline stage writes its output to a `stages` table. No file system.
3. **The UI is a progress experience, not a terminal.** Every stage has a friendly name, an icon, a status badge, and a plain-English description of what the AI is doing.
4. **Non-technical language everywhere.** No mention of "agents," "JSON," "API spec," "DDL," or "DAG" in the UI. Use "Architecture," "Pages," "Data Structure," "Launch Plan" instead.
5. **Validation is structural.** A field either exists or it doesn't. No model self-scoring.

### 3.2 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR + file-based routing, Vercel native |
| UI Components | shadcn/ui + Tailwind CSS | Matches MetaBox visual identity |
| Auth | Supabase Auth | Email + Google OAuth, free tier |
| Database | Supabase (PostgreSQL) | Row-level security, real-time subscriptions |
| AI Pipeline | Vercel Edge Functions or Node.js API routes | Server-side only; no client-side LLM calls |
| AI Model | Gemini 2.5 Flash + Flash-Lite | Free tier; see Section 6.1 |
| Payments | Stripe (Checkout + Webhooks) | Credit bundles and subscription |
| Deployment | Vercel (frontend) + Supabase (backend) | $0 to launch |
| File Export | jsPDF + react-markdown | PDF/Markdown export for paid users |

### 3.3 Pipeline Stages (What Users See vs. What Runs)

| User-Facing Stage Name | Internal Agent | Input | Output |
|---|---|---|---|
| "Mapping your idea" | `requirement_agent` | User's intake form answers | `req_doc` record |
| "Building your blueprint" | `prompt_agent` | `req_doc` | `build_spec` record |
| "Planning your features" | `feature_agent` | `build_spec.feature_tree` | `features` record |
| "Designing your API" | `api_agent` | `build_spec.api_surface` | `api_spec` record |
| "Structuring your data" | `db_agent` | `build_spec.entity_model` | `schema_sql` record |
| "Laying out your pages" | `ui_agent` | `build_spec` + features + api | `ui_spec` record |

Stages 3, 4, and 5 run in parallel (Promise.all). The user sees all three cards animating simultaneously, which communicates speed and sophistication.

### 3.4 Database Schema (Supabase)

**`profiles` table** — extends Supabase auth.users

```sql
id           uuid references auth.users primary key,
display_name text,
plan         text default 'free',  -- 'free' | 'founder' | 'studio'
credits      integer default 1,
created_at   timestamptz default now()
```

**`boxes` table** — one row per user Box (pipeline run)

```sql
id           uuid primary key default gen_random_uuid(),
user_id      uuid references profiles(id) on delete cascade,
title        text,  -- inferred by requirement_agent
idea_text    text not null,
audience     text,
budget_range text,
status       text default 'pending',  -- pending | running | complete | failed
created_at   timestamptz default now(),
updated_at   timestamptz default now()
```

**`stages` table** — one row per pipeline stage per Box

```sql
id           uuid primary key default gen_random_uuid(),
box_id       uuid references boxes(id) on delete cascade,
stage_name   text not null,  -- 'req_doc' | 'build_spec' | 'features' | 'api_spec' | 'schema_sql' | 'ui_spec'
status       text default 'pending',  -- pending | running | complete | failed
output       jsonb,  -- structured output from agent
error_hint   text,   -- last error message for retry prompt injection
attempt      integer default 0,
started_at   timestamptz,
completed_at timestamptz
```

**`rate_limit_state` table** — shared across all server workers (replaces file-based limiter)

```sql
model        text primary key,
day          date,
rpm_timestamps timestamptz[],
daily_count  integer default 0,
updated_at   timestamptz default now()
```

> **NOTE:** Row-level locking (`SELECT FOR UPDATE`) replaces `fcntl.LOCK_EX` from the original CLI spec. This is safe across Vercel serverless workers.

---

## 4. Page & Component Specifications

### 4.1 Landing Page (`/`)

The landing page is already designed at [https://meta-saas-pearl.vercel.app](https://meta-saas-pearl.vercel.app). Implement it exactly as shown. Key sections:

- **Hero:** Headline, subheadline, two CTAs ("Start Building Free" → `/launch`, "Watch it Build" → scroll to demo), stat pills (2,400+ Boxes, 98% Less Errors, <5 min to MVP)
- **How It Works:** Three steps — Describe, Build, Deploy — with numbered cards and icons
- **Live Demo:** Animated terminal-style window showing a fake pipeline run (purely cosmetic; CSS animation)
- **Features Grid:** Six feature cards (AI Architecture, Instant Code Gen, GTM Strategy, One-Click Deploy, Auth & Payments, Live Analytics)
- **Pricing:** Three tiers — Starter ($0), Founder ($49/mo), Studio ($199/mo) — see Section 8
- **Testimonials:** Wall of Love with three founder quotes
- **FAQ:** Accordion with 5 questions
- **Footer CTA:** Full-width CTA with email capture

### 4.2 Launch Wizard (`/launch`)

A three-step guided form. No technical language anywhere.

**Step 1 — Your Idea**

- Large textarea: "Describe your business idea" (placeholder: "e.g. A platform that helps freelance designers track client projects and send invoices automatically")
- Character counter (min 20, max 500)
- Example prompts shown as clickable chips below the textarea

**Step 2 — Your Audience**

- Radio group: "Who is this for?" (Individual users / Small teams / Enterprises / Consumers)
- Optional text field: "Anything else about your target customer?"

**Step 3 — Your Budget** *(optional but shown)*

- Radio group: "What's your expected monthly budget to run this?" ($0 – free tools only / Under $50 / $50–200 / $200+)
- Checkbox: "I want affiliate tool recommendations in my plan"

**Submit behavior:**

1. Validate form (idea text required, min 20 chars)
2. Check user credits; if 0 on free plan, show upgrade modal
3. `POST /api/boxes` — creates Box record, deducts 1 credit
4. Redirect to `/dashboard/[box-id]` — pipeline begins automatically

### 4.3 Build Dashboard (`/dashboard/[box-id]`)

This is the core experience. The user watches their Box being built in real-time.

**Layout:**

- Top: Box title (inferred after stage 1 completes) + status badge
- Left column (60%): Pipeline progress cards — one card per stage
- Right column (40%): Live preview panel — as each stage completes, a preview of that output appears

**Stage Card States:**

| State | Visual |
|---|---|
| `pending` | Grey card, stage name, "Waiting..." |
| `running` | Animated shimmer, spinner icon, friendly progress message (see below) |
| `complete` | Green check, stage name, summary line, "View →" link |
| `failed` | Red card, "Something went wrong — retrying..." or "View error" on 2nd failure |

**Progress Messages (shown while `running`):**

| Stage | Message shown |
|---|---|
| "Mapping your idea" | "Reading your idea and identifying your target users..." |
| "Building your blueprint" | "Designing your feature set and tech stack..." |
| "Planning your features" | "Breaking each feature into buildable tasks..." |
| "Designing your API" | "Defining how your app's components talk to each other..." |
| "Structuring your data" | "Designing the database that powers your product..." |
| "Laying out your pages" | "Mapping every screen your users will see..." |

**Real-time updates:** Use Supabase Realtime subscriptions on the `stages` table filtered by `box_id`. The page does not poll; it subscribes.

**On pipeline completion:** Show a full-width "🎉 Your Box is ready!" banner with a CTA to "View Results."

### 4.4 Results View (`/dashboard/[box-id]/results`)

Tabbed interface. Six tabs, one per deliverable. All content is written in plain English by the agents (see agent prompt guidelines in Section 5).

| Tab Label | Content |
|---|---|
| **Overview** | Product summary, personas list, monetization model — rendered as styled cards |
| **Features** | Kanban-style board: columns by priority (Must Have, Should Have, Nice to Have) |
| **Architecture** | Tech stack table + deployment diagram (SVG generated from template, not AI) |
| **Pages** | Card grid — one card per page with: page name, purpose, key components listed |
| **Data Model** | Entity cards with field names and types; relationship lines rendered in SVG |
| **Launch Plan** | GTM strategy rendered as a timeline: Week 1, Month 1–3, Month 3–6 |

**Export button** (paid plans only): "Export as PDF" — generates a branded PDF of all six tabs.

**Share button** (all plans): Generates a read-only public link: `/share/[box-id]`.

### 4.5 Box List (`/dashboard`)

- Grid of Box cards: title, creation date, status badge, stage count
- "New Box" button (top right) → `/launch`
- Free plan: shows 1 active Box, locks additional with upgrade prompt
- Empty state: illustration + "Build your first Box" CTA

### 4.6 Auth Pages (`/login`, `/signup`)

Standard Supabase Auth UI. Email/password + "Continue with Google." On successful signup, create a `profiles` row via Supabase trigger (not client-side).

---

## 5. Agent Specifications

All agents run server-side in API route handlers (`/api/pipeline/[stage]`). They are never called from the client. Each agent follows this interface:

```typescript
interface AgentResult {
  success: boolean;
  output: Record<string, unknown>;  // stored in stages.output (jsonb)
  error?: string;
}
```

### 5.1 Orchestrator (Server-Side)

The orchestrator is a server-side function triggered when a Box is created. It runs the pipeline in order, managing stage records in Supabase. It never calls any LLM directly.

**Orchestrator Logic:**

```
1. Set box.status = 'running'
2. Create 6 stage rows with status = 'pending'
3. Run Stage 1: requirement_agent (serial)
4. Run Stage 2: prompt_agent (serial, depends on Stage 1)
5. Run Stage 3: Promise.all([feature_agent, api_agent, db_agent]) (parallel)
6. Run Stage 4: ui_agent (serial, depends on Stage 3)
7. Set box.status = 'complete' or 'failed'
For each stage:
  - Set stage.status = 'running', stage.started_at = now()
  - Call agent function
  - Validate output (see Section 5.2)
  - On success: set stage.status = 'complete', write output to stage.output
  - On failure: increment stage.attempt, write error to stage.error_hint
    - If attempt < 2: retry with error hint injected into prompt
    - If attempt >= 2: set stage.status = 'failed', set box.status = 'failed', stop
```

**Error Hint Injection (Required in every agent):**

```typescript
const errorHint = stage.error_hint
  ? `\n\nPREVIOUS ATTEMPT FAILED:\n${stage.error_hint.slice(0, 400)}`
  : '';
const prompt = basePrompt + errorHint;
```

### 5.2 Validation Gates

| Stage | Validation | Failure action |
|---|---|---|
| `req_doc` | `business_intent.value` exists; `core_features` has ≥ 3 items; `user_personas` non-empty | Retry with injected errors |
| `build_spec` | JSON schema check: `feature_tree`, `entity_model`, `api_surface`, `tech_stack` all present | Retry with schema error |
| `features` | `expanded_features` array exists and non-empty | Retry |
| `api_spec` | `endpoints` array exists and non-empty | Retry |
| `schema_sql` | SQL stored as string in `output.sql`; basic syntax check (no unclosed quotes, balanced parens) | Retry |
| `ui_spec` | `pages` array exists with ≥ 2 items | Retry |

### 5.3 Requirement Agent

| Property | Value |
|---|---|
| Model | `gemini-2.5-flash` |
| Input | User's intake form: `idea_text`, `audience`, `budget_range` |
| Output | `req_doc` — business intent, personas, core features, SaaS type, monetization |
| Max tokens | 3,000 |
| Retries | 2 |

**Prompt guideline:** Output must be in plain English, not developer jargon. Persona names should be human (e.g., "Sarah, a freelance designer" not "User Type A"). Feature names should be action-oriented ("Send invoices" not "Invoice CRUD module").

### 5.4 Prompt Agent

| Property | Value |
|---|---|
| Model | `gemini-2.5-flash` |
| Input | Full `req_doc` output |
| Output | `build_spec` — feature tree, entity model, API surface, tech stack, deployment config |
| Max tokens | 6,000 |
| Retries | 2 |

**System prompt must include:** "Default to Supabase + Vercel + Render for all deployment configs. Never output ECS Fargate or RDS as defaults. All feature names and descriptions must be in plain English suitable for a non-technical founder."

### 5.5 Feature Agent

| Property | Value |
|---|---|
| Model | `gemini-2.5-flash-lite` |
| Input | `feature_tree` + `tech_stack` from `build_spec` |
| Output | `features` — per-feature subtasks with layer, hours estimate, dependencies |
| Max tokens | 4,000 |
| Retries | 1 |

**UI presentation rule:** Hours estimates are shown to the user as "~X days" (divide by 8, round up). The word "subtask" is not used; the UI says "steps."

### 5.6 API Agent

| Property | Value |
|---|---|
| Model | `gemini-2.5-flash-lite` |
| Input | `api_surface` + `entity_model` from `build_spec` |
| Output | `api_spec` — endpoint definitions with request/response schemas |
| Max tokens | 4,000 |
| Retries | 1 |

**UI presentation rule:** Raw endpoint paths (e.g., `POST /api/v1/invoices`) are shown in the Architecture tab only for users who expand an "Advanced" accordion. The default view shows plain-English descriptions: "Create a new invoice," "List all invoices," etc.

### 5.7 DB Agent

| Property | Value |
|---|---|
| Model | `gemini-2.5-flash-lite` |
| Input | `entity_model` + `database_config` from `build_spec` |
| Output | `schema_sql` — PostgreSQL DDL as a string |
| Max tokens | 3,000 |
| Retries | 1 |

**Seed data rule:** The agent must not generate hardcoded admin passwords. The only seed data permitted is plan/tier configuration rows. The raw SQL is not shown to users on the free plan; they see an entity-relationship card UI instead.

### 5.8 UI Agent

| Property | Value |
|---|---|
| Model | `gemini-2.5-flash-lite` |
| Input | `ui_expectations` from `build_spec` + feature summary + API routes |
| Output | `ui_spec` — per-page component trees with layout, data sources, states |
| Max tokens | 4,000 |
| Retries | 1 |

**UI presentation rule:** Each page is shown as a card with: page name, one-line purpose, and a bulleted list of key components. No wireframe images are generated in MVP; that is Phase 2.

---

## 6. Rate Limiting

### 6.1 Gemini Free Tier Limits

| Model | Free RPM | Free RPD | Calls/Box (normal) | Calls/Box (max retries) |
|---|---|---|---|---|
| `gemini-2.5-flash` | 10 | 250 | 2 | 6 |
| `gemini-2.5-flash-lite` | 15 | 1,000 | 12–16 | 18 |
| **Total** | — | — | **~14–18** | **~24 max** |

At 24 calls max per Box: Flash (6 of 250 RPD) = room for 40+ full Boxes/day. Flash-Lite (18 of 1,000 RPD) = room for 55+ Boxes/day.

### 6.2 Supabase-Backed Rate Limiter

Because MetaBox runs on serverless workers (not a single process), rate limiting must be shared across all worker instances via the database.

**Logic (runs before every Gemini API call):**

```typescript
async function recordAndCheck(model: string): Promise<void> {
  // SELECT FOR UPDATE to lock the row
  const { data } = await supabase
    .from('rate_limit_state')
    .select('*')
    .eq('model', model)
    .single()
    .forUpdate();

  const limits = { 'gemini-2.5-flash': { rpm: 10, rpd: 250 }, 'gemini-2.5-flash-lite': { rpm: 15, rpd: 1000 } };
  const limit = limits[model];
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  let state = data ?? { model, day: today, rpm_timestamps: [], daily_count: 0 };
  if (state.day !== today) {
    state = { model, day: today, rpm_timestamps: [], daily_count: 0 };
  }

  if (state.daily_count >= limit.rpd) throw new Error(`Daily limit reached for ${model}`);

  const oneMinuteAgo = new Date(now.getTime() - 60_000);
  state.rpm_timestamps = state.rpm_timestamps.filter((t: string) => new Date(t) > oneMinuteAgo);

  if (state.rpm_timestamps.length >= limit.rpm) {
    const waitMs = 61_000 - (now.getTime() - new Date(state.rpm_timestamps[0]).getTime());
    await new Promise(res => setTimeout(res, Math.max(waitMs, 1000)));
  }

  state.rpm_timestamps.push(now.toISOString());
  state.daily_count += 1;

  await supabase.from('rate_limit_state').upsert(state);
}
```

### 6.3 Fallback Model Strategy

Add a `FALLBACK_MODEL` environment variable. If set to `'mock'`, agents return pre-generated fixture data for development/testing without making API calls. This lets developers test the full UI pipeline without spending quota.

**`.env.example`:**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
FALLBACK_MODEL=gemini  # options: gemini | mock
```

---

## 7. Deployment Stack

### 7.1 MetaBox Platform (The Web App)

```
Frontend:   Vercel (Next.js)        — $0/month free tier
Database:   Supabase                — $0/month free tier
Auth:       Supabase Auth           — included
AI:         Gemini API (free tier)  — $0/month
Payments:   Stripe                  — 2.9% + 30¢ per transaction
```

**Deploy steps:**

1. Push to GitHub
2. Connect repo to Vercel — auto-deploys on push
3. Create Supabase project — run migration SQL
4. Set environment variables in Vercel dashboard
5. Configure Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`

### 7.2 Generated App Stack (What MetaBox Recommends to Users)

When the `prompt_agent` generates deployment config for a user's Box, it **must** use the lean stack:

```json
{
  "deployment_config": {
    "frontend_hosting": "Vercel",
    "backend_hosting": "Render",
    "database": "Supabase (PostgreSQL)",
    "auth": "Supabase Auth",
    "file_storage": "Supabase Storage",
    "ci_cd": "GitHub Actions",
    "environments": ["development", "production"],
    "phase_1_cost": "$0/month",
    "upgrade_path": "Supabase Pro + Vercel Pro at 100+ users"
  }
}
```

### 7.3 Phase 2: Live Code Deployment

When code generation is added in Phase 2:

- `code_agent` generates a Next.js + Supabase scaffold from the `build_spec`
- Code is pushed to a new GitHub repo owned by the user (GitHub OAuth required)
- MetaBox triggers a Vercel deploy via Vercel API
- User gets a live URL in the Results View under a new "Your App" tab

---

## 8. Monetization

> **Do NOT launch with a subscription as the only option.** The core value is delivered in one Box run. Credit bundles prevent churn after the first month.

### Tier Structure

#### Starter — $0 Forever Free
- 1 Active Box
- All 6 deliverables (view only)
- Community support
- Basic analytics (page views)

#### Founder — $49/month
- 10 Active Boxes
- Custom domains (Phase 2)
- Priority AI queue (shorter wait times)
- GTM Copy Engine (Phase 2 — email templates, pitch scripts)
- Code Export (PDF + Markdown of all deliverables)

#### Studio — $199/month
- Unlimited Boxes
- Full code export (Phase 2 — actual codebase download)
- Direct API access
- White-label options (Phase 3)
- 24/7 concierge support

### Credit Bundle Option (Pay-Per-Use, No Subscription)

| Bundle | Price | Boxes |
|---|---|---|
| Starter Pack | $9 | 5 Boxes |
| Builder Pack | $29 | 20 Boxes |
| Agency Pack | $79 | 75 Boxes + priority support |

Credits never expire. Users on the free plan can buy credits without subscribing.

### Affiliate Layer (Zero Engineering Required — Launch Immediately)

Register for Supabase, Vercel, Render, and Railway affiliate programs. Embed affiliate links in the deployment recommendations shown in every Box's Architecture tab and in exported PDFs.

### Revenue Projections (Conservative)

| Stage | Timeframe | Monthly Revenue | Primary Driver |
|---|---|---|---|
| Consulting | Month 1–3 | $1,500–5,000 | 5–10 manual Box packages |
| Credits (early) | Month 3–6 | $500–2,000 | 50–200 Boxes/month |
| Credits (growth) | Month 6–12 | $2,000–8,000 | 200–800 Boxes + affiliate |
| B2B Studio | Month 9+ | $5,000–15,000 | 25–75 Studio seats |

---

## 9. Risks and Mitigations

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Google changes free tier limits | High | Medium | Add `FALLBACK_MODEL=mock` for dev; monitor Google AI changelog. Add model selector in admin panel. |
| `prompt_agent` output truncates mid-JSON | Medium | Medium | Error-feedback retry instructs: output fewer features (minimum 3). Truncation caught by JSON parse error. |
| `db_agent` produces broken SQL | Medium | Medium | Basic syntax check before marking stage complete. Retry on failure. Prompt instructs: always end statements with semicolons, define tables before FK references. |
| Parallel agents hit rate limit | Medium | Low | Supabase-backed rate limiter with row-level locking (Section 6.2). 429 handler sleeps 65s and retries once. |
| Output quality not good enough for real use | High | Unknown | Run 20+ test Boxes across diverse ideas before any paid launch. Build a manual scorecard. |
| Hardcoded credentials in generated SQL | High | Medium | DB agent system prompt explicitly forbids hardcoded passwords. Validation rejects output containing common password patterns. |
| Concurrent Box collisions | Low | Low | Each Box is row-isolated in Supabase with `box_id` as foreign key on all stage records. No shared mutable state. |
| User confusion about "what comes next" | Medium | High | After results view: clear CTA "Share your Box" and "Build another Box." Phase 2 shows "Deploy your app →" CTA. |

---

## 10. Future Enhancements

> **RULE:** Do not start on any of these until the MVP pipeline has been validated with at least 20 test Boxes across diverse idea types.

### Phase 2 (After MVP Validation)

- Live code generation — `code_agent` scaffolds a full Next.js + Supabase app from the spec
- One-click deploy to Vercel via API — user gets a live URL from MetaBox
- Page wireframe generation — `ui_agent` outputs SVG wireframes in addition to component cards
- GTM Copy Engine — generates cold email templates, LinkedIn outreach scripts, and landing page copy
- Multi-user Box sharing — invite collaborators to view or comment on a Box
- Stripe self-serve credit billing — replace manual Stripe links with automated checkout

### Phase 3 (After Revenue Validation)

- Team workspaces — shared Box library for agencies with role-based access
- Spec versioning — track changes between Box runs for the same product
- Export to Notion, Linear, or Jira — push generated tasks directly to project management tools
- LLM-based quality scoring — post-pipeline evaluation agent that critiques the generated spec
- Custom tech stack templates — allow users to specify preferred stack
- Mobile app (iOS / Android) — view and share Boxes on mobile

### Deferred Indefinitely

- LLM orchestrator routing — the static DAG is sufficient
- Blueprint module system — needs full design before implementation
- CLI version — the web app is the product; CLI is a developer-only internal tool if ever needed

---

## 11. Pre-Launch Checklist

Complete **every item** before accepting the first paying user.

- [ ] Supabase-backed rate limiter implemented and tested with concurrent requests (Section 6.2)
- [ ] Error hint injection implemented in every agent function (Section 5.1)
- [ ] SQL validation implemented in `db_agent` stage handler (Section 5.7)
- [ ] DB agent system prompt confirmed: no hardcoded credentials in generated SQL
- [ ] Prompt agent system prompt confirmed: defaults to Supabase + Vercel + Render stack
- [ ] Free plan credit enforcement: creating a second Box on free plan shows upgrade modal
- [ ] Stripe webhook handler tested: plan upgrades reflect in `profiles.plan` within 10 seconds
- [ ] Supabase Realtime subscription confirmed working on Build Dashboard page
- [ ] All agent output rendered in plain English — no JSON, no technical field names shown to user
- [ ] `FALLBACK_MODEL=mock` confirmed working for local development without API calls
- [ ] Run 20 test Boxes across diverse idea types and manually score output quality
- [ ] Register for Supabase, Vercel, Render affiliate programs and embed links in Architecture tab
- [ ] Landing page deployed at production domain with working "Start Building Free" CTA
- [ ] README written for contributors (not users — users never see a terminal)

---

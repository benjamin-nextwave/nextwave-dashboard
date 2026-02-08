# NextWave Client Management Dashboard

## What This Is

A personal client management dashboard for a cold email agency. Tracks client warmup/go-live timelines on a Gantt chart, manages tasks with an overdue-rolling mechanic, and stores all client information in one central place. Built with Next.js 16 (App Router) + Supabase + Tailwind CSS + shadcn/ui, deployed on Vercel. Single-user, no authentication.

## Core Value

Every task deadline stays current — no task ever shows a past date. The overdue-rolling mechanic ensures the daily dashboard always reflects what needs attention *today*, with clear visibility into how far behind each task has slipped.

## Requirements

### Validated

- ✓ Homepage with today's task overview, Dutch date header, progress donut chart, and sorted task list — v1.0
- ✓ Gantt chart with company warmup bars, task markers, timeline navigation, and task/company overlays — v1.0
- ✓ Company management with overview grid, detail pages, and full client info editing — v1.0
- ✓ Overdue task rolling: client-side computed effective_deadline = max(deadline, today), with delay badges — v1.0
- ✓ Supabase database with companies and tasks tables, proper relationships and cascading deletes — v1.0
- ✓ Dark/light mode toggle persisted in localStorage — v1.0
- ✓ Dutch language UI throughout (labels, headers, placeholders, date formatting) — v1.0
- ✓ Europe/Amsterdam timezone for all dates, weeks start on Monday — v1.0
- ✓ Auto-save on blur + manual save button for company detail fields — v1.0
- ✓ Task CRUD from Gantt view (create, edit, complete, delete with confirmation) — v1.0
- ✓ shadcn/ui components with Tailwind styling, responsive but desktop-first — v1.0

### Active

(None — define requirements for next milestone with `/gsd:new-milestone`)

### Out of Scope

- Authentication — personal use only, no login needed
- Multi-user support — single operator
- Email sending/integration — this tracks campaigns, doesn't send them
- Mobile app — web only, responsive but desktop-first
- Notifications/alerts — check the dashboard manually
- Internationalization — Dutch only, no language switching
- Drag-and-drop Gantt — high complexity, candidate for v2

## Context

- **Current state**: v1.0 MVP shipped. 3,558 lines of TypeScript across 57 files. 36 passing tests.
- **Tech stack**: Next.js 16 (App Router, Turbopack), Supabase, Tailwind CSS v4 (OKLCH), shadcn/ui, date-fns, Vitest, TypeScript strict mode
- **Domain**: Cold email agency client management. Each client goes through a warmup period (typically 14 days) before their campaign goes live. Tasks track what needs to happen for each client.
- **Gantt bar**: Spans from warmup_start_date to go_live_date. Tasks appear as markers on their deadline dates within each company's row.
- **Overdue mechanic**: Core business logic. Tasks that miss their deadline get their displayed deadline rolled forward to today. The original_deadline never changes, so a delay badge shows how many days overdue (-1, -2, etc.). Implemented client-side at render time.
- **Saving**: Company detail pages use auto-save on blur with a visible save indicator, plus a manual save button as fallback.
- **Deployment**: Vercel with Supabase backend. Environment variables for Supabase URL and anon key.
- **Known setup**: User must configure Supabase project and add credentials to .env.local before database connectivity works.

## Constraints

- **Tech stack**: Next.js (App Router) + Supabase + Tailwind CSS + shadcn/ui — non-negotiable
- **Deployment**: Vercel
- **Timezone**: All dates/times in Europe/Amsterdam
- **Language**: Dutch UI labels and date formatting (e.g., "Maandag 10 februari 2025")
- **Week start**: Monday
- **Date library**: date-fns for date manipulation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-side overdue rolling | Simpler than database function/cron, no mutation needed, compute at render time | ✓ Good — clean, testable, no DB mutations |
| No authentication | Personal use only, simplifies architecture | ✓ Good — no auth overhead |
| Task creation Gantt-only | Keeps UI focused, single place for task management | ✓ Good — clear UX |
| Auto-save + manual save | Best of both worlds — convenience with explicit fallback | ✓ Good — field-level blur saves work well |
| Gantt bar = warmup period | Bar spans warmup_start_date → go_live_date, go-live marks end | ✓ Good — intuitive visual |
| Supabase singleton (no SSR) | No auth = no cookie management, simpler client | ✓ Good — simple, works |
| Vitest for testing | Zero-config TypeScript support, fast execution | ✓ Good — 36 tests, fast |
| Semantic Tailwind colors | text-foreground, bg-background etc. throughout | ✓ Good — theme-agnostic |
| Overlay state machine | Null-prop pattern for dialog open/close | ✓ Good — reusable across Gantt and Homepage |
| force-dynamic on pages | Prevent SSR prerender failure when env vars missing at build | ✓ Good — necessary for Supabase client-side |
| Relative imports in lib/ | Vitest path resolution without config | ⚠️ Revisit — should add vitest alias config |
| Manual database types | Quick start, matches SQL schema | ⚠️ Revisit — switch to supabase gen types |

---
*Last updated: 2026-02-08 after v1.0 milestone*

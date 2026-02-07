# NextWave Client Management Dashboard

## What This Is

A personal project management dashboard for managing cold email agency clients. It tracks client warmup/go-live timelines on a Gantt chart, manages tasks with an overdue-rolling mechanic, and stores all client information in one central place. Built with Next.js (App Router) + Supabase + Tailwind CSS, deployed on Vercel. Single-user, no authentication.

## Core Value

Every task deadline stays current — no task ever shows a past date. The overdue-rolling mechanic ensures the daily dashboard always reflects what needs attention *today*, with clear visibility into how far behind each task has slipped.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Homepage with today's task overview, Dutch date header, progress donut chart, and sorted task list
- [ ] Gantt chart with company warmup bars, task markers, timeline navigation, and task/company overlays
- [ ] Company management with overview grid, detail pages, and full client info editing
- [ ] Overdue task rolling: client-side computed effective_deadline = max(deadline, today), with delay badges
- [ ] Supabase database with companies and tasks tables, proper relationships and cascading deletes
- [ ] Dark/light mode toggle persisted in localStorage
- [ ] Dutch language UI throughout (labels, headers, placeholders, date formatting)
- [ ] Europe/Amsterdam timezone for all dates, weeks start on Monday
- [ ] Auto-save on blur + manual save button for company detail fields
- [ ] Task CRUD from Gantt view only (create, edit, complete, delete with confirmation)
- [ ] shadcn/ui components with Tailwind styling, responsive but desktop-first

### Out of Scope

- Authentication — personal use only, no login needed
- Multi-user support — single operator
- Email sending/integration — this tracks campaigns, doesn't send them
- Mobile app — web only, responsive but desktop-first
- Notifications/alerts — check the dashboard manually
- Internationalization — Dutch only, no language switching

## Context

- **Domain**: Cold email agency client management. Each client goes through a warmup period (typically 14 days) before their campaign goes live. Tasks track what needs to happen for each client.
- **Gantt bar**: Spans from warmup_start_date to go_live_date. The go_live_date marks the END of the warmup bar. Tasks appear as markers on their deadline dates within each company's row.
- **Overdue mechanic**: This is the core business logic. Tasks that miss their deadline get their displayed deadline rolled forward to today. The original_deadline never changes, so a delay badge shows how many days overdue (-1, -2, etc.). Implemented client-side at render time — no database mutations needed.
- **Task creation**: Only from the Gantt view via "+ Nieuwe taak" button per company. Tasks are edited/completed from both the Gantt view and homepage.
- **Saving**: Company detail pages use auto-save on blur with a visible save indicator, plus a manual save button as fallback.
- **Deployment**: Vercel with Supabase backend. Environment variables for Supabase URL and anon key.

## Constraints

- **Tech stack**: Next.js (App Router) + Supabase + Tailwind CSS + shadcn/ui — non-negotiable
- **Deployment**: Vercel
- **Timezone**: All dates/times in Europe/Amsterdam
- **Language**: Dutch UI labels and date formatting (e.g., "Maandag 10 februari 2025")
- **Week start**: Monday
- **Date library**: date-fns or dayjs for date manipulation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-side overdue rolling | Simpler than database function/cron, no mutation needed, compute at render time | — Pending |
| No authentication | Personal use only, simplifies architecture | — Pending |
| Task creation Gantt-only | Keeps UI focused, single place for task management | — Pending |
| Auto-save + manual save | Best of both worlds — convenience with explicit fallback | — Pending |
| Gantt bar = warmup period | Bar spans warmup_start_date → go_live_date, go-live marks end | — Pending |

---
*Last updated: 2026-02-07 after initialization*

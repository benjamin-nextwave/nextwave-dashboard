# Project Research Summary

**Project:** NextWave Client Management Dashboard
**Domain:** Personal agency client management with Gantt views, task tracking, and CRM-lite functionality
**Researched:** 2026-02-07
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a personal client management dashboard for a cold email agency, optimized for tracking email warmup periods via Gantt charts and managing per-client tasks with a unique "overdue-rolling" mechanic that prevents task pile-up. The research reveals a mature, well-documented tech stack (Next.js App Router + Supabase + Tailwind + shadcn/ui) with established patterns that make this a straightforward build—IF foundational decisions are made correctly from the start.

The recommended approach is to build a thin server layer with a fat client layer given the high interactivity requirements. Use Server Components for initial data fetching but expect most components to be client-side due to auto-save, Gantt interactions, and the overdue-rolling computation. The architecture should center on three core features built sequentially: Company CRUD (simplest, validates data flow), Gantt Chart (most complex, integrates task CRUD), and Homepage (depends on tasks existing). Build custom Gantt chart with positioned divs rather than using a library—existing Gantt libraries are over-engineered for this use case and fight Tailwind theming.

The critical risks are all preventable through correct Phase 1 setup: Supabase client singleton pattern (avoid multiple WebSocket connections), timezone-aware date handling with Dutch locale (avoid midnight bugs and DST issues), and proper dark mode setup (avoid hydration flashes). The date handling is the highest-risk area—JavaScript date math is deceptively complex, especially around timezones and DST transitions. Use DATE columns in Postgres (not TIMESTAMP), compute "today" once per render cycle in a context, and wrap all date-fns functions to enforce `weekStartsOn: 1` and `locale: nl`.

## Key Findings

### Recommended Stack

The stack is mature and non-controversial: Next.js 15 (App Router), React 19, TypeScript, Supabase (hosted Postgres), Tailwind CSS v3.4, and shadcn/ui. All are stable, well-documented technologies with a large ecosystem. No bleeding-edge dependencies.

**Core technologies:**
- **Next.js 15 (App Router)** — Full-stack React framework with Server Components for data fetching and Server Actions for mutations. App Router is the standard for new projects.
- **Supabase** — Hosted Postgres with auto-generated REST API. Non-negotiable per constraints. Provides typed queries when combined with generated types.
- **Tailwind CSS v3.4 + shadcn/ui** — Utility-first CSS with copy-paste component library. shadcn/ui uses Radix UI primitives for accessibility and provides full dark mode support via CSS variables.
- **date-fns v4** — Date manipulation with tree-shaking, Dutch locale support, and timezone handling via `date-fns-tz`. Recommended over dayjs for better TypeScript types and more robust API.
- **react-hook-form + Zod** — Form state management with schema validation. Handles auto-save-on-blur pattern well via `watch()` and field-level `onBlur`.
- **Custom Gantt implementation** — Build with positioned divs + Tailwind instead of using a library. Existing Gantt libraries (gantt-task-react, frappe-gantt) are 50-200KB, hard to theme, and designed for features not needed (drag-to-resize, critical paths, resource allocation).

**What NOT to use:**
- Tailwind v4 (too new, shadcn/ui compatibility uncertain)
- TanStack Query / SWR (overkill for single-user dashboard with Server Components)
- Redux / Zustand (unnecessary state management for this simple app)
- Gantt libraries (over-engineered, hard to style, heavy bundle)
- Prisma / Drizzle ORM (adds unnecessary layer on top of Supabase client)

### Expected Features

Research identified clear table stakes vs. differentiators based on PM tool domain knowledge.

**Must have (table stakes):**
- Today's task list sorted by priority/urgency
- Progress indicator (donut chart showing completed vs. total)
- Horizontal Gantt timeline with company warmup bars and task markers
- Company CRUD with detail pages and auto-save
- Task CRUD with company association
- Dark/light mode with localStorage persistence
- Loading states and error handling with user feedback

**Should have (competitive differentiators):**
- **Overdue-rolling mechanic** — No task shows a past date; overdue tasks roll forward to "today" with a delay badge (-1, -2 days) instead of red "OVERDUE" banner. This is the core differentiator—most PM tools show overdue as a negative state, not a rolling-forward mechanic.
- **Domain-specific Gantt** — Purpose-built for cold email warmup periods. No other PM tool visualizes warmup-to-go-live pipeline natively with task markers within company rows.
- **Click-through overlays from Gantt** — Edit companies and tasks directly from Gantt chart without navigation, keeping workflow in timeline context.
- **Color-coded company status** — Visual pattern recognition (warmup = amber, live = green) on Gantt bars.

**Defer to v2+ (anti-features for MVP):**
- Authentication / user management (single-user personal tool)
- Email sending / integration (tracks campaigns, doesn't send them)
- Multi-user collaboration (real-time sync, permissions)
- Notifications / reminders (homepage IS the notification)
- Mobile app / PWA (desktop-first, responsive CSS only)
- Time tracking (track WHAT, not HOW LONG)
- Reporting / analytics beyond donut chart
- Drag-and-drop Gantt bar resizing (edit dates in forms instead)
- Template tasks / recurring tasks (each client is unique)

### Architecture Approach

Thin server layer, fat client layer. Server Components fetch initial data on navigation; Client Components handle all interactivity. The Gantt chart, task lists, donut chart, auto-save fields, and overdue-rolling computation all require client-side state.

**Major components:**
1. **App Shell (layout)** — Root HTML, ThemeProvider wrapper, navigation chrome. Server Component with client-side theme toggle.
2. **Page Routes** — Server Components that fetch data and pass to client components: `/` (homepage), `/gantt` (Gantt chart), `/bedrijven` (company overview), `/bedrijven/[id]` (company detail).
3. **Feature Components** — Client Components for TaskList, DonutChart, GanttChart (with GanttRow, GanttBar, TaskMarker), TaskOverlay, CompanyOverlay, CompanyForm.
4. **Shared Infrastructure** — Supabase client singleton (browser), date utilities (timezone-aware), overdue computation logic, custom hooks (useAutoSave, useGanttNavigation).

**Data flow pattern:**
```
Server Component (page.tsx) fetches data
  ↓
Passes as props to Client Component (*-content.tsx)
  ↓
Client Component manages local state for interactivity
  ↓
Mutations via Supabase browser client
  ↓
Optimistic local state update (don't wait for response)
```

**Database schema:**
- `companies` table: id (uuid), name, warmup_start_date (DATE), go_live_date (DATE), status (text with check constraint), contact fields, notes, created_at
- `tasks` table: id (uuid), company_id (uuid FK with CASCADE DELETE), title, deadline (DATE), is_completed (boolean), created_at
- Use DATE columns (not TIMESTAMPTZ) for calendar dates—avoids timezone bugs

**Gantt implementation:**
- Custom build with positioned `<div>` elements, not canvas/SVG
- CSS transforms for positioning (compositor optimization)
- Fixed column width (40px per day)
- Horizontal scroll with sticky left column for company names
- Click handlers open shadcn/ui Sheet or Dialog overlays
- Today indicator as vertical line (TodayContext provides consistent date)

### Critical Pitfalls

Top 5 pitfalls that could derail the project if not addressed in Phase 1:

1. **Supabase Client Instantiation** — Creating multiple client instances on every render leads to dozens of WebSocket connections, stale data, and memory leaks. **Prevention:** Singleton browser client in `lib/supabase/client.ts`, request-scoped server client. Never call `createClient()` inside component bodies.

2. **Hydration Mismatch (Dates + Dark Mode)** — Server renders dates in UTC while client uses Europe/Amsterdam timezone. Server renders light mode while client reads localStorage for dark preference. Both cause React hydration errors and FOUC. **Prevention:** Make date-displaying components Client Components; use `next-themes` with blocking script for dark mode or manual script in `<head>`.

3. **date-fns Timezone Handling** — date-fns is timezone-unaware by design. Using `date-fns-tz` incorrectly causes bars to shift by one day near midnight and at DST transitions. **Prevention:** Store dates as DATE (not TIMESTAMP) in Supabase, use string comparison for calendar dates, create `getTodayAmsterdam()` utility that returns ISO date string, compute overdue with `differenceInCalendarDays()`.

4. **Auto-Save Race Conditions** — User tabs quickly between fields; saves overlap and overwrite each other, causing silent data loss. **Prevention:** Debounce saves with a queue (collect dirty fields, flush after 500ms timer), use optimistic local state (never update from save response), show visible save status indicator, add manual save button as fallback.

5. **Gantt Scroll Performance Collapse** — Rendering a column for every day in a 90-day range with 50+ companies creates 4,500+ DOM cells. Naive implementations drop below 30fps. **Prevention:** Use CSS transforms (`translateX`) for positioning, virtualize columns (only render visible date range), memoize aggressively (`React.memo()` on rows), avoid state-on-scroll (use refs), fixed column width for O(1) calculations.

**Additional moderate pitfalls:**
- Overdue computation inconsistencies near midnight (use single `TodayContext`)
- `startOfWeek` defaulting to Sunday instead of Monday (wrap with `weekStartsOn: 1`)
- Dark mode missing `dark:` variants on custom components (use CSS variables)
- Gantt date-to-pixel mapping broken by DST (use calendar-day-based positioning)
- Dutch formatting showing English months (wrap `format()` with `locale: nl`)

## Implications for Roadmap

Based on research, suggested phase structure prioritizes foundational setup, then builds features sequentially based on dependencies:

### Phase 1: Foundation & Infrastructure
**Rationale:** All features depend on correct data layer, date handling, and theming setup. Date/timezone bugs and Supabase client issues are architectural—cannot be easily fixed later. The overdue-rolling mechanic is core business logic that must be correct before building any views.

**Delivers:**
- Next.js project setup with Tailwind + shadcn/ui
- Supabase schema (companies + tasks tables with RLS and CASCADE deletes)
- Supabase client singleton pattern (browser + server helpers)
- TypeScript types matching database schema
- Date utility module (timezone-aware, Dutch locale, week starts Monday)
- Overdue computation logic (rolling mechanic)
- Dark mode with ThemeProvider and blocking script
- TodayContext for consistent date computation across app

**Addresses from FEATURES.md:**
- Dark/light mode (table stakes)

**Avoids from PITFALLS.md:**
- Pitfall 1 (Supabase client instantiation)
- Pitfall 2 (Hydration mismatch)
- Pitfall 3 (date-fns timezone handling)
- Pitfall 6 (RLS misconfiguration)
- Pitfall 7 (overdue computation inconsistencies)
- Pitfall 8 (startOfWeek locale)
- Pitfall 12 (Dutch date formatting)

**Stack elements:**
- Next.js 15, React 19, TypeScript, Tailwind CSS v3.4, shadcn/ui
- Supabase (@supabase/supabase-js or @supabase/ssr)
- date-fns v4 with nl locale
- next-themes

### Phase 2: Company Management
**Rationale:** Company CRUD is the simplest complete feature with no complex computed values. It validates the Supabase connection, data flow pattern (server fetch → client interactivity), and auto-save mechanic. Provides seed data for Gantt development. Build confidence with simpler feature before tackling Gantt complexity.

**Delivers:**
- Company overview page with grid/card layout
- Company detail page with auto-save form
- Company CRUD operations (create, edit, delete with confirmation)
- Search/filter on company grid
- Save status indicator ("Opslaan...", "Opgeslagen", error state)
- Auto-save on blur with debounced queue

**Addresses from FEATURES.md:**
- Company list/grid overview (table stakes)
- Company detail page with auto-save (table stakes)
- Core company fields (name, contact, email, phone, warmup dates, notes, status)
- Search/filter companies (table stakes)
- Company status indicator with color coding (table stakes)

**Avoids from PITFALLS.md:**
- Pitfall 4 (auto-save race conditions via debounced queue)
- Pitfall 9 (dark mode inconsistencies—test both modes)
- Pitfall 13 (use `.maybeSingle()` for detail page)
- Pitfall 14 (cascade deletes already in schema from Phase 1)
- Pitfall 15 (save error handling with status indicator)

**Stack elements:**
- react-hook-form + Zod for form validation
- shadcn/ui components (Card, Input, Button, Sheet/Dialog, Badge, Select)
- sonner for toast notifications

**Uses from ARCHITECTURE.md:**
- Server Component (page.tsx) fetches company data
- Client Component (company-detail.tsx) handles auto-save
- Optimistic local state updates

### Phase 3: Gantt Chart & Task Management
**Rationale:** Gantt is the most complex feature and the core differentiator. Building it after Company Management means real company data exists for rendering. Task CRUD is integrated into Gantt via overlays, so the full task lifecycle is implemented here. This phase delivers the primary user value—visualizing warmup timelines and managing tasks in context.

**Delivers:**
- Gantt chart timeline with date headers, grid, today indicator
- Company rows with warmup bars (color-coded by status)
- Task markers at deadline positions within company rows
- Timeline navigation (horizontal scroll, pan, today button)
- Zoom levels (week view / month view)
- Task overlay/sheet for create, edit, complete, delete
- Company overlay for quick view from Gantt
- Task CRUD operations from Gantt context
- "Nieuwe taak" button on company rows

**Addresses from FEATURES.md:**
- Horizontal timeline bars per company (table stakes)
- Task markers on timeline (table stakes)
- Timeline navigation (table stakes)
- Today indicator line (table stakes)
- Zoom level control (table stakes)
- Company/task click-through with overlays (table stakes)
- Task CRUD (create, edit, complete, delete) (table stakes)
- Domain-specific Gantt (differentiator)
- Company overlay from Gantt (differentiator)
- Task overlay from Gantt (differentiator)

**Avoids from PITFALLS.md:**
- Pitfall 5 (scroll performance—transform-based positioning, memoization)
- Pitfall 11 (date-to-pixel edge cases—calendar-day-based math, DST-safe)
- Pitfall 16 (z-index wars—portal overlays, defined z-index scale)
- Pitfall 18 (today line drift—uses TodayContext)

**Stack elements:**
- Custom Gantt implementation (no library)
- shadcn/ui Sheet or Dialog for overlays
- react-hook-form + Zod for task forms
- date-fns for timeline date calculations

**Uses from ARCHITECTURE.md:**
- GanttContent (client orchestrator)
- GanttTimeline, GanttRow, GanttBar, TaskMarker components
- CSS transforms for positioning (`translateX`, `width`)
- Fixed column width (40px per day)
- Virtualized columns (render only visible date range)
- Memoized rows and markers

### Phase 4: Homepage & Daily Overview
**Rationale:** Homepage shows today's tasks and progress donut. Depends on tasks existing (created via Gantt in Phase 3). The overdue-rolling logic is already built in Phase 1, so this phase is primarily UI composition. This completes the core feature triad (Company Management, Gantt, Homepage).

**Delivers:**
- Homepage with Dutch-formatted date header
- Today's task list sorted by effective deadline (overdue-rolled)
- Delay badges showing days overdue (-1, -2, etc.)
- Task completion checkboxes (mark done from homepage)
- Progress donut chart (completed vs. total for today)
- Overdue task sorting (most overdue first)

**Addresses from FEATURES.md:**
- Today's task list sorted by priority (table stakes)
- Progress indicator (donut chart) (table stakes)
- Date header with context (table stakes)
- Overdue task visibility (table stakes)
- Task completion from homepage (table stakes)
- Overdue-rolling mechanic (core differentiator)
- Delay badge calculation (core differentiator)
- Overdue tasks auto-sorted to top (core differentiator)

**Stack elements:**
- Custom SVG donut chart (20 lines, no library)
- date-fns for Dutch date formatting
- Overdue computation from Phase 1 (`lib/overdue.ts`)

**Uses from ARCHITECTURE.md:**
- TaskList component with overdue-aware sorting
- DelayBadge component
- DonutChart component (custom SVG)
- DateHeader component with `formatDutchDate()`

### Phase 5: Navigation, Polish & Deployment
**Rationale:** Navigation can be added anytime (just links between pages). Polish comes last after functionality is proven. This phase handles the final UX improvements, empty states, error states, and deployment verification.

**Delivers:**
- Navigation (sidebar or top nav with active page indication)
- Theme toggle button (sun/moon icon)
- Loading states (loading.tsx per route or Suspense boundaries)
- Error states (error.tsx per route or error boundaries)
- Confirm dialogs for destructive actions (delete company, delete task)
- Empty states ("Geen taken vandaag", "Geen bedrijven", "Geen taken voor dit bedrijf")
- Visual polish (transitions, hover states, responsive tweaks)
- Vercel deployment with environment variables
- Deployment validation (RLS test, env var check)

**Addresses from FEATURES.md:**
- Responsive layout (table stakes)
- Loading states (table stakes)
- Error handling with user feedback (table stakes)

**Avoids from PITFALLS.md:**
- Pitfall 17 (missing env vars—validate on Vercel)

**Stack elements:**
- lucide-react for icons
- Vercel for deployment

### Phase Ordering Rationale

**Sequential dependencies:**
- Phase 1 → all other phases (foundational setup)
- Phase 2 → Phase 3 (Gantt needs company data to render)
- Phase 3 → Phase 4 (Homepage needs tasks to display)
- Phases 1-4 → Phase 5 (polish after features work)

**Why Company Management before Gantt:**
- Simpler feature validates data flow pattern
- Provides seed data for Gantt development
- Auto-save pattern established before Gantt task overlays
- Confidence-building for single developer

**Why Gantt before Homepage:**
- Task CRUD integrated into Gantt overlays
- Tasks must exist before Homepage can display them
- Gantt is higher complexity, benefits from full focus
- Homepage is UI composition using existing logic

**Grouping rationale based on ARCHITECTURE.md:**
- Phase 1 groups all infrastructure (dates, Supabase, theme)—must be correct before building features
- Phase 2 groups full Company CRUD—validates data flow end-to-end
- Phase 3 groups Gantt + Task CRUD—tightly coupled, both need timeline context
- Phase 4 groups Homepage views—consumes existing data, no new mutations
- Phase 5 groups polish—non-functional improvements after functionality proven

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Gantt):** Column virtualization implementation, exact Radix UI overlay API for shadcn/ui Sheet, performance profiling approach. Gantt is custom build, so less external documentation available. Will need experimentation.
- **Phase 5 (Deployment):** Vercel-specific RLS testing, environment variable validation patterns, Supabase connection pooling on Vercel serverless.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Well-documented setup (Next.js App Router, Supabase client patterns, date-fns, next-themes all have official guides).
- **Phase 2 (Company Management):** Standard CRUD with react-hook-form + Zod, documented extensively in shadcn/ui examples.
- **Phase 4 (Homepage):** UI composition using existing utilities, no novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | All technologies are mature and stable. Next.js App Router GA since Oct 2023, Supabase stable, shadcn/ui widely adopted. Version numbers are MEDIUM confidence (verify with `npm view` before installing), but architectural choices are HIGH confidence. |
| Features | **HIGH** | Table stakes based on extensive PM tool domain knowledge (Asana, Monday, ClickUp, Todoist, Notion, etc.). Differentiators are well-defined by project constraints. Anti-features list prevents scope creep. |
| Architecture | **HIGH** | Mature, well-documented patterns. Next.js App Router file structure, Supabase client setup, dark mode via next-themes are all canonical patterns from official docs. Custom Gantt approach is standard CSS positioning. |
| Pitfalls | **MEDIUM-HIGH** | Pitfalls are based on well-known JavaScript/React patterns (date handling, hydration, client instantiation) with high confidence. The date-fns-tz v4 API specifics are MEDIUM confidence—verify exact imports at build time. Gantt performance pitfalls are HIGH confidence (standard timeline UI patterns). |

**Overall confidence:** **MEDIUM-HIGH**

The stack, architecture, and feature landscape are all HIGH confidence—these are mature, documented technologies and patterns. The MEDIUM qualifier comes from:
1. Version numbers based on training data through May 2025 (need verification with `npm view`)
2. Exact `date-fns-tz` v4 API (changed from v3; verify `toZonedTime` vs `utcToZonedTime`)
3. Web search unavailable during research (patterns verified from training data, not live docs)

However, architectural decisions are sound regardless of exact version numbers. Even if specific APIs change slightly, the recommended patterns (singleton Supabase client, timezone-aware date handling, custom Gantt build) remain correct.

### Gaps to Address

**During Phase 1 (Foundation):**
- Verify exact `@supabase/ssr` API vs. simple `@supabase/supabase-js` singleton for no-auth use case. Research suggests simple singleton may be sufficient given no authentication. Test both approaches and choose based on simplicity vs. future auth-readiness trade-off.
- Verify date-fns v4 API for `toZonedTime` (may be `@date-fns/tz` package). Confirm exact import paths and function names at implementation time.
- Confirm Tailwind v4 compatibility with shadcn/ui. If v4 is supported, evaluate benefits vs. sticking with stable v3.4.

**During Phase 3 (Gantt):**
- Column virtualization: Research `react-window` or `@tanstack/react-virtual` for virtualizing timeline columns if performance is impacted with 50+ companies and 90-day ranges. Defer until performance profiling identifies need.
- DST transition testing: Manually test Gantt rendering on exact DST transition dates (last Sunday of March, last Sunday of October in Europe/Amsterdam) to verify calendar-day-based positioning handles these correctly.

**During Phase 5 (Deployment):**
- RLS policy testing: After deployment, externally test Supabase anon key exposure. Curl the Supabase URL with anon key from a different machine to verify RLS policies prevent data leaks. Document decision if permissive policies are acceptable for personal tool.

## Sources

### Primary (HIGH confidence)
- **STACK.md** — Next.js App Router patterns, Supabase client setup, date-fns recommendations based on established ecosystem patterns
- **ARCHITECTURE.md** — Component boundaries, file organization, data flow patterns from official Next.js App Router documentation patterns
- **FEATURES.md** — Table stakes and differentiators based on domain knowledge of PM tools (Asana, Monday.com, ClickUp, Todoist, Notion, Linear, Jira, Teamwork) and CRM tools (HubSpot, Pipedrive)
- **PITFALLS.md** — Supabase SSR docs (client patterns), date-fns docs (locale, weekStartsOn), Next.js App Router docs (Server vs Client Components), Tailwind dark mode docs

### Secondary (MEDIUM confidence)
- Training data through May 2025 for version numbers and API-specific details
- Community patterns for Gantt implementations (transform-based positioning, virtualization)
- Auto-save race condition patterns from standard React form implementations

### Tertiary (LOW confidence)
- date-fns v4 `TZDate` API specifics (verify exact imports from `@date-fns/tz`)
- Tailwind v4 compatibility with shadcn/ui (verify before upgrading from v3.4)
- Vercel serverless Supabase connection pooling behavior (test during deployment)

---
**Research completed:** 2026-02-07
**Ready for roadmap:** Yes

**Next steps:**
1. Orchestrator creates requirements.md based on this research
2. Roadmapper structures phases following suggested roadmap structure
3. Execute Phase 1 (Foundation) to validate foundational decisions before building features

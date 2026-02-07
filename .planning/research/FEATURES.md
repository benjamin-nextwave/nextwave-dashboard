# Feature Landscape

**Domain:** Personal agency client management dashboard with Gantt views, task tracking, CRM-lite
**Researched:** 2026-02-07
**Overall confidence:** MEDIUM (based on training data knowledge of project management tools, CRM patterns, and Gantt-chart applications; web verification unavailable)

---

## Table Stakes

Features users expect from a personal client management dashboard. Missing any of these makes the tool feel broken or unusable for daily work.

### Homepage / Daily Overview

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Today's task list, sorted by priority/urgency | Every PM tool shows "what's due today" as the primary view. Without it, you open the tool and don't know what to do. | Low | Already in scope. Sort by effective_deadline, then by company. |
| Progress indicator (donut/bar) | Visual progress at a glance is expected from any dashboard. Shows "am I on track today?" in <1 second. | Low | Already in scope as donut chart. Keep it simple: completed vs. total for today. |
| Date header with context | Users need to know "what day is it" in their workflow context. Standard in tools like Todoist, Things 3, etc. | Low | Already in scope. Dutch formatted date. |
| Overdue task visibility | Every task tool highlights overdue items. Without explicit overdue visibility, users lose trust. | Low | Core mechanic (overdue-rolling + delay badge). This IS the differentiator but also table stakes for task tools generally. |
| Task completion from homepage | Being able to check off a task without navigating away is fundamental. Click-to-complete is expected everywhere. | Low | Already in scope. Single click/checkbox to mark done. |

### Gantt Chart

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Horizontal timeline bars per entity | Defining feature of Gantt. Without bars, it's just a list. Each company's warmup period as a horizontal bar. | Medium | Already in scope. Bar = warmup_start_date to go_live_date. |
| Task markers on timeline | Tasks need to appear at their deadline positions within company rows. Standard in any Gantt tool. | Medium | Already in scope. Markers on the timeline within each company row. |
| Timeline navigation (scroll/pan) | Users must be able to move through time. Fixed viewport makes Gantt useless beyond 2-3 weeks. | Medium | Already in scope. Horizontal scroll or pan with today-marker. |
| Today indicator line | Every Gantt tool shows a vertical "today" line. Without it, users can't orient themselves in time. | Low | Standard pattern. Vertical line at today's date. |
| Zoom level control (day/week/month) | Users need to see both detail (this week) and overview (this quarter). At minimum, two zoom levels. | Medium | Not explicitly in scope but strongly recommended. At least week and month views. |
| Company/task click-through | Clicking a bar or marker should show details. Dead-click elements frustrate users. | Low | Already in scope as overlays. |

### Company Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Company list/grid overview | Must see all clients at a glance. Card grid or table view. Standard in every CRM. | Low | Already in scope as overview grid. |
| Company detail page | Full view of a single client with all fields editable. Standard CRUD pattern. | Low | Already in scope with auto-save. |
| Core company fields | Company name, contact person, email, phone, status, warmup dates, notes. Minimum viable CRM fields. | Low | Define field set during requirements. |
| Company status indicator | Visual indicator of where each company is in the pipeline (warmup, live, paused, churned). Users need to see status without opening details. | Low | Status field with color coding on the grid. |
| Search/filter companies | Once you have >10 clients, finding one by name is critical. Basic search is table stakes. | Low | Simple text search over company name. |
| Delete with confirmation | Accidental deletion of a client is catastrophic for a single-user tool with no undo. Confirmation dialog is mandatory. | Low | Already in scope for tasks; apply same pattern to companies. |

### Task Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Create task with title, deadline, company assignment | Minimum viable task. Without these three fields, a task has no context. | Low | Already in scope. Created from Gantt view. |
| Edit task | Deadlines change, descriptions change. Must be editable. | Low | Already in scope. |
| Complete/uncomplete task | Core task management action. Must be reversible (uncheck accidental completions). | Low | Already in scope. |
| Delete task with confirmation | Same as company deletion -- protect against accidents. | Low | Already in scope. |
| Task-company association | Every task belongs to a company. Orphan tasks make no sense in this domain. | Low | Already in scope via foreign key. |

### UI/UX Fundamentals

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dark/light mode | Standard expectation for any modern dashboard tool in 2026. Especially for tools used daily. | Low | Already in scope with localStorage persistence. |
| Responsive layout (desktop-first) | Must not break on different screen sizes even if optimized for desktop. | Low | Already in scope. |
| Auto-save | Modern tools save automatically. Losing data on navigation is unacceptable for a personal tool. | Medium | Already in scope with save-on-blur + manual fallback. |
| Loading states | Users need feedback that data is being fetched/saved. Blank screens erode trust. | Low | Skeleton loaders or spinners. Not explicitly in scope but essential. |
| Error handling with user feedback | Failed saves, network issues, etc. must show a message, not fail silently. | Low | Toast notifications or inline error messages. Not explicitly in scope but essential. |

---

## Differentiators

Features that set this dashboard apart from generic PM tools. Not expected by default, but when present they make the tool feel purpose-built and valuable.

### Overdue-Rolling Mechanic (Core Differentiator)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Client-side deadline rolling | No task ever shows a past date. Your daily view is always "what do I need to do TODAY." Eliminates the depressing pile-up of red overdue items that plagues every other PM tool. | Medium | Core business logic. effective_deadline = max(original_deadline, today). Computed at render time, no DB mutation. |
| Delay badge (-1, -2, -N days) | Transparency about how far behind you are WITHOUT the psychological weight of a big red "OVERDUE 5 DAYS" banner. Clean, informational, not punishing. | Low | Simple calculation: today - original_deadline. Display as badge on task. |
| Overdue tasks auto-sorted to top | Rolling to today means overdue tasks compete with today's tasks for attention. Sort by delay (most overdue first) to ensure nothing slips further. | Low | Sort order: delay descending, then deadline ascending. |

### Domain-Specific Gantt

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Warmup timeline visualization | Purpose-built for cold email agencies. No other PM tool understands the warmup-to-go-live pipeline natively. | Medium | Already in scope. The bar IS the warmup period. |
| Task markers within company row | See the full picture for a client: their warmup timeline AND what tasks are due when. No switching between views. | Medium | Already in scope. Tasks as dots/markers on the timeline. |
| Company overlay from Gantt | Click a bar, see company details without leaving the Gantt context. Keeps workflow in the timeline view. | Medium | Already in scope. Slide-out panel or modal with company info. |
| Task overlay from Gantt | Click a task marker, edit/complete it inline. No navigation required for the most common action. | Medium | Already in scope. Quick-edit panel or modal. |

### Visual Polish

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Color-coded company status on Gantt | Instantly see which clients are in warmup vs. live vs. paused by bar color. Pattern recognition without reading labels. | Low | Map status to colors. 4-5 status values max. |
| Progress donut with daily context | Not just "X of Y done" but meaningful: "3 of 7 today, 2 overdue from previous days." Tells a story. | Low | Already in scope. Segment by on-time vs. rolled-over. |
| Smooth transitions and micro-animations | Makes the tool feel polished and responsive. CSS transitions on theme toggle, task completion, panel open/close. | Low | Tailwind transition utilities. Don't over-animate. |

### Workflow Efficiency

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Keyboard shortcuts for common actions | Power users (you, daily) want to complete tasks, navigate, and create without mouse. Saves significant time. | Medium | Start with: 'N' for new task, 'Space' to complete, arrow keys to navigate. Add after MVP. |
| Quick-add task with natural language date | "Setup DNS maandag" auto-parses to next Monday. Reduces friction for the most common action. | High | Defer to post-MVP. Requires date parsing in Dutch. |
| Bulk task operations | Select multiple tasks, mark all complete, or reschedule. Useful for end-of-week cleanup. | Medium | Defer to post-MVP. Checkbox selection + bulk action bar. |

---

## Anti-Features

Features to explicitly NOT build. Common in this domain but wrong for this specific project.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Authentication / user management | Single-user personal tool. Auth adds complexity, login friction, and password management for zero benefit. Already out of scope. | Deploy behind Vercel's default URL. If security needed later, use Vercel password protection at the infrastructure level. |
| Email sending / integration | This tracks campaigns, it does NOT send them. Integrating with email providers (SendGrid, Instantly, etc.) is a rabbit hole of API management, deliverability monitoring, and scope explosion. | Keep a notes field or link field where you paste the campaign URL from your sending tool. |
| Multi-user collaboration | Real-time sync, permissions, conflict resolution, activity feeds -- all massive complexity for a tool only you use. | Single-user design. No WebSocket, no presence, no permissions. |
| Notifications / reminders | Push notifications, email reminders, browser alerts. You check this dashboard manually as part of your workflow. Notifications add notification fatigue and require service workers / email integration. | The homepage IS the notification. Open it, see what's due. |
| Mobile app / PWA | Building a native or PWA experience for a desktop-first dashboard used at your workstation. Mobile adds touch targets, responsive complexity, and offline sync. | Responsive CSS so it doesn't break on mobile, but don't optimize for mobile-first workflows. |
| Time tracking | Common in PM tools but irrelevant for task completion tracking. Adds UI clutter and data entry burden. | Track time externally if needed (Toggl, Clockify). This tool tracks WHAT, not HOW LONG. |
| Reporting / analytics | Charts showing "tasks completed this month," velocity, burndown. For a personal tool, this is vanity metrics. You know how you're doing by looking at the dashboard. | The donut chart IS the only report you need. If you want historical data, query Supabase directly. |
| Drag-and-drop task reordering | Complex to implement (especially on Gantt), fragile on different browsers, and unnecessary when tasks have deadlines that determine order. | Sort by effective_deadline automatically. Manual ordering creates maintenance burden. |
| Drag-and-drop Gantt bar resizing | Resizing bars by dragging edges is technically complex (snapping, validation, undo) and error-prone on touch devices. For a personal tool, editing dates in a form is faster and more precise. | Edit warmup_start_date and go_live_date in the company detail page or overlay. The Gantt renders them; it doesn't edit them. |
| Template tasks / recurring tasks | Common in PM tools but wrong here. Each client has unique tasks based on their setup. Templates add abstraction without saving time for <50 clients. | Create tasks manually per company from Gantt view. If patterns emerge, consider templates as a future enhancement only. |
| Internationalization (i18n) | Dutch only. Building an i18n framework for a single-language app adds abstraction layers, translation key management, and testing burden for zero value. | Hardcode Dutch strings. If you ever need English, find-and-replace is faster than retrofitting i18n. |
| Undo/redo system | Global undo/redo requires command pattern, state history, and careful handling of async operations. Overkill for a personal tool. | Confirmation dialogs for destructive actions (delete). For edits, the previous value is in Supabase and auto-save means you rarely lose work. |
| Comments / activity log | Per-task or per-company comment threads. You're the only user -- you don't need to communicate with yourself in a structured way. | Use the notes field on company detail page. Free-form text is more flexible than structured comments. |
| Subtasks / task hierarchy | Nested tasks add tree management complexity (collapse/expand, completion rollup, depth limits). Your tasks are flat actions per company. | Keep tasks flat. If a task is too big, break it into multiple flat tasks. |
| Custom fields / dynamic schemas | Letting users add arbitrary fields to companies or tasks. Requires dynamic form rendering, schema migration, and validation. Massive complexity for questionable value. | Define a fixed schema that covers your needs. Add fields to the schema when needed via code changes. |
| File attachments | Uploading files to companies or tasks. Requires storage (Supabase Storage), upload UI, preview, deletion, and storage costs. | Link to files in Google Drive, Dropbox, or wherever they live. Paste URLs in the notes field. |

---

## Feature Dependencies

```
Core Data Layer (Supabase tables)
  |
  +-- Companies CRUD
  |     |
  |     +-- Company detail pages (depends on: company data model)
  |     |     |
  |     |     +-- Auto-save on blur (depends on: detail page fields)
  |     |
  |     +-- Company overview grid (depends on: company data model)
  |           |
  |           +-- Search/filter (depends on: company list)
  |
  +-- Tasks CRUD
  |     |
  |     +-- Task-Company foreign key (depends on: both tables)
  |     |
  |     +-- Overdue-rolling mechanic (depends on: task deadline field)
  |           |
  |           +-- Delay badge calculation (depends on: rolling mechanic)
  |
  +-- Homepage
  |     |
  |     +-- Today's task list (depends on: Tasks + rolling mechanic)
  |     |
  |     +-- Progress donut (depends on: today's task list)
  |     |
  |     +-- Task completion action (depends on: Tasks CRUD)
  |
  +-- Gantt Chart
        |
        +-- Company warmup bars (depends on: Companies + date fields)
        |
        +-- Task markers on timeline (depends on: Tasks + rolling mechanic)
        |
        +-- Today indicator line (depends on: timeline rendering)
        |
        +-- Timeline navigation (depends on: timeline rendering)
        |
        +-- Company overlay (depends on: company data)
        |
        +-- Task overlay + CRUD (depends on: task data + Gantt context)
        |
        +-- Zoom levels (depends on: timeline rendering)

Theme System (independent)
  +-- Dark/light mode toggle
  +-- localStorage persistence
```

**Critical path:** Supabase tables -> Companies CRUD -> Tasks CRUD -> Overdue-rolling -> Homepage + Gantt

The Gantt chart and Homepage are independent of each other but both depend on the data layer and the overdue-rolling mechanic. Build data layer first, then either view can be built in parallel.

---

## MVP Recommendation

For MVP, prioritize **all table stakes features** -- they are individually low-to-medium complexity and collectively form the minimum viable product.

### Phase 1: Foundation (build first)
1. Supabase schema (companies + tasks tables)
2. Companies CRUD (create, read, update, delete)
3. Tasks CRUD with company association
4. Overdue-rolling mechanic (client-side)

### Phase 2: Views (build second, can parallelize)
5. Homepage: today's tasks, progress donut, completion actions
6. Gantt chart: company bars, task markers, today line, navigation
7. Company detail page with auto-save

### Phase 3: Polish (build third)
8. Dark/light mode with persistence
9. Loading states and error handling
10. Company overlays and task overlays from Gantt
11. Search/filter on company grid
12. Zoom levels on Gantt

### Defer to post-MVP:
- Keyboard shortcuts (Medium complexity, high value but not essential day one)
- Quick-add with natural language dates (High complexity, nice-to-have)
- Bulk task operations (Medium complexity, useful after you have many tasks)
- Color-coded status on Gantt bars (Low complexity, can be added anytime)

---

## Confidence Notes

| Area | Confidence | Rationale |
|------|------------|-----------|
| Table stakes features | HIGH | Based on extensive domain knowledge of PM tools (Asana, Monday, ClickUp, Todoist, Basecamp, Notion). These features are universal across all tools in this category. |
| Anti-features list | HIGH | Based on the explicit project constraints (single user, no auth, Dutch only, desktop-first) and experience with scope creep in PM tool projects. |
| Differentiators | MEDIUM | The overdue-rolling mechanic is genuinely novel -- most PM tools show overdue as a negative state, not a rolling-forward mechanic. Confidence is medium because "novel" is hard to verify without competitive analysis. |
| Complexity estimates | MEDIUM | Based on typical implementation patterns. Actual complexity depends on Gantt library choice and Supabase schema design, which are Stack decisions. |
| Feature dependencies | HIGH | Standard data-dependency analysis. The critical path (data -> CRUD -> views) is well-established in any CRUD dashboard project. |

---

## Sources

- Domain knowledge from training data covering project management tools (Asana, Monday.com, ClickUp, Todoist, Notion, Basecamp, Linear, Jira, Teamwork)
- Domain knowledge from CRM tools (HubSpot, Pipedrive, Salesforce, Streak)
- Domain knowledge from Gantt chart implementations (GanttProject, TeamGantt, Instagantt, dhtmlxGantt)
- Project context from `.planning/PROJECT.md`

**Note:** Web search and Context7 were unavailable during this research session. All findings are based on training data (cutoff ~May 2025). Feature landscape for PM tools and CRM tools is mature and stable, so staleness risk is low for this domain. The main risk area is specific library capabilities for Gantt rendering, which belongs in STACK.md research.

# Requirements: NextWave Client Management Dashboard

**Defined:** 2026-02-07
**Core Value:** Every task deadline stays current — no task ever shows a past date. The daily dashboard always reflects what needs attention today.

## v1 Requirements

### Foundation

- [ ] **FOUN-01**: Supabase database with `companies` and `tasks` tables, proper types, FK relationship, cascade deletes
- [ ] **FOUN-02**: Supabase singleton client configured via environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] **FOUN-03**: Centralized date utility module with Europe/Amsterdam timezone, Dutch locale, Monday week start
- [ ] **FOUN-04**: Overdue-rolling computation: effective_deadline = max(deadline, today), days_overdue = dateDiff(today, original_deadline) when overdue and not completed
- [ ] **FOUN-05**: Dark/light mode toggle persisted in localStorage with proper hydration (no flash)
- [ ] **FOUN-06**: Navigation with 3 items (Dashboard, Gantt, Bedrijven), dark mode toggle, active page indicator

### Default Tasks

- [ ] **DTSK-01**: When a company is created, 6 default tasks are auto-generated starting from warmup_start_date, each 1 day apart
- [ ] **DTSK-02**: Default task 1 (day 1): "Create email templates" — date not editable
- [ ] **DTSK-03**: Default task 2 (day 2): "Have an onboarding call" — date IS editable
- [ ] **DTSK-04**: Default task 3 (day 3): "Buy custom domains and mailboxes, place in warmup tool" — date not editable
- [ ] **DTSK-05**: Default task 4 (day 4): "Create an RLM" — date not editable
- [ ] **DTSK-06**: Default task 5 (day 5): "Create follow-up mails" — date not editable
- [ ] **DTSK-07**: Default task 6 (day 6): "Create a dashboard" — date not editable
- [ ] **DTSK-08**: All default tasks can be marked as completed but only "onboarding call" has an editable date

### Homepage

- [ ] **HOME-01**: Header showing "Vandaag" with current date formatted in Dutch (e.g., "Maandag 10 februari 2025")
- [ ] **HOME-02**: Progress donut chart showing completed/total task ratio with color gradient (green when done, red/orange for incomplete) and "3/7" counter in center
- [ ] **HOME-03**: Task list showing all tasks with deadline = today (including rolled-over overdue tasks)
- [ ] **HOME-04**: Each task shows company name, task title, and overdue badge (-1, -2 etc in red) if applicable
- [ ] **HOME-05**: Completed tasks shown with strikethrough and green checkmark
- [ ] **HOME-06**: Tasks sorted: urgent first, then by overdue days (most overdue first), then alphabetical
- [ ] **HOME-07**: Clicking a task opens the same edit overlay as in Gantt view

### Gantt Chart

- [ ] **GANT-01**: Left sidebar with company names, right area with horizontally scrollable timeline grid (days as columns)
- [ ] **GANT-02**: Each company has a light blue semi-transparent bar spanning from warmup_start_date to go_live_date
- [ ] **GANT-03**: Tasks appear as colored markers on their deadline date within the company's row (red = pending, green = completed)
- [ ] **GANT-04**: Overdue tasks show -N delay badge, urgent tasks have distinct visual indicator
- [ ] **GANT-05**: Click task marker opens edit overlay with: editable title, urgency toggle, notes textarea, completion checkbox, save/cancel, delete with confirmation
- [ ] **GANT-06**: Click company name opens overlay showing all tasks for that company sorted by deadline ascending, each clickable to open task edit overlay
- [ ] **GANT-07**: "+ Nieuwe taak" button per company to create tasks (title + deadline fields, company pre-selected)
- [ ] **GANT-08**: Default view shows current week + next week (14 days), today's column highlighted
- [ ] **GANT-09**: Arrow buttons and horizontal scroll for week navigation, "Vandaag" button to jump to current view

### Company Management

- [ ] **COMP-01**: Overview page with grid of company cards showing name, go-live date, number of open tasks
- [ ] **COMP-02**: "+ Nieuw bedrijf" button opening form with name, warmup start date, go-live date (triggers default task creation)
- [ ] **COMP-03**: Detail page Section 1 "Basisgegevens": company name, warmup start date, go-live date, client email, client phone
- [ ] **COMP-04**: Detail page Section 2 "Klantprofiel": client notes textarea, personality scale 1-5 visual selector
- [ ] **COMP-05**: Detail page Section 3 "Mailvarianten": 3 large text blocks side by side (Variant 1, 2, 3)
- [ ] **COMP-06**: Detail page Section 4 "Feedback & Planning": feedback mailvarianten, toekomstige wensen, "Extra shit" textareas
- [ ] **COMP-07**: Auto-save on blur with visible save indicator, plus manual save button as fallback
- [ ] **COMP-08**: Back button to return to companies overview

### UI & Styling

- [ ] **UIST-01**: Tailwind CSS styling with shadcn/ui components (buttons, modals, inputs, toggles)
- [ ] **UIST-02**: Light mode: white backgrounds, subtle gray borders, clean typography
- [ ] **UIST-03**: Dark mode: dark gray backgrounds with appropriate contrast
- [ ] **UIST-04**: Task status colors: red for pending, green for completed, orange/yellow for urgent
- [ ] **UIST-05**: Overdue badges: red background, white text, small pill shape
- [ ] **UIST-06**: Dutch labels throughout (button text, headers, placeholders)
- [ ] **UIST-07**: Responsive but desktop-first layout

## v2 Requirements

### Enhanced Task Management

- **ETSK-01**: Keyboard shortcuts for task completion and navigation
- **ETSK-02**: Bulk task operations (complete multiple, reschedule multiple)
- **ETSK-03**: Task categories/types for filtering

### Gantt Enhancements

- **GENT-01**: Zoom levels for Gantt (day, week, month views)
- **GENT-02**: Drag-and-drop task rescheduling on Gantt
- **GENT-03**: Company search/filter in Gantt sidebar

### Data & Export

- **DATA-01**: Export company data to CSV
- **DATA-02**: Company archive functionality (hide completed clients)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication / login | Personal use only, single operator |
| Multi-user / team features | Single operator dashboard |
| Email sending / integration | Tracks campaigns, doesn't send them |
| Mobile app | Web-only, responsive but desktop-first |
| Notifications / alerts | Manual dashboard checking |
| Internationalization | Dutch only, no language switching |
| Real-time collaboration | Single user, no need for WebSockets |
| Subtask hierarchies | Flat task list is sufficient |
| Drag-and-drop Gantt | High complexity, defer to v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | — | Pending |
| FOUN-02 | — | Pending |
| FOUN-03 | — | Pending |
| FOUN-04 | — | Pending |
| FOUN-05 | — | Pending |
| FOUN-06 | — | Pending |
| DTSK-01 | — | Pending |
| DTSK-02 | — | Pending |
| DTSK-03 | — | Pending |
| DTSK-04 | — | Pending |
| DTSK-05 | — | Pending |
| DTSK-06 | — | Pending |
| DTSK-07 | — | Pending |
| DTSK-08 | — | Pending |
| HOME-01 | — | Pending |
| HOME-02 | — | Pending |
| HOME-03 | — | Pending |
| HOME-04 | — | Pending |
| HOME-05 | — | Pending |
| HOME-06 | — | Pending |
| HOME-07 | — | Pending |
| GANT-01 | — | Pending |
| GANT-02 | — | Pending |
| GANT-03 | — | Pending |
| GANT-04 | — | Pending |
| GANT-05 | — | Pending |
| GANT-06 | — | Pending |
| GANT-07 | — | Pending |
| GANT-08 | — | Pending |
| GANT-09 | — | Pending |
| COMP-01 | — | Pending |
| COMP-02 | — | Pending |
| COMP-03 | — | Pending |
| COMP-04 | — | Pending |
| COMP-05 | — | Pending |
| COMP-06 | — | Pending |
| COMP-07 | — | Pending |
| COMP-08 | — | Pending |
| UIST-01 | — | Pending |
| UIST-02 | — | Pending |
| UIST-03 | — | Pending |
| UIST-04 | — | Pending |
| UIST-05 | — | Pending |
| UIST-06 | — | Pending |
| UIST-07 | — | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 0
- Unmapped: 43 ⚠️

---
*Requirements defined: 2026-02-07*
*Last updated: 2026-02-07 after initial definition*

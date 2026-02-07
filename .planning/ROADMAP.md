# Roadmap: NextWave Client Management Dashboard

## Overview

This roadmap delivers a personal client management dashboard for a cold email agency in four phases. We start with foundational infrastructure (database, date handling, theming, navigation), then build company management with auto-generated default tasks, then the Gantt chart with full task CRUD, and finally the homepage daily overview. Each phase delivers a complete, verifiable capability that builds on the previous one.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & App Shell** - Database, Supabase client, date utilities, overdue logic, dark mode, navigation, and global styling
- [ ] **Phase 2: Company Management & Default Tasks** - Company CRUD with detail pages, auto-save, and automatic default task generation on company creation
- [ ] **Phase 3: Gantt Chart & Task Management** - Custom Gantt timeline with company warmup bars, task markers, task CRUD via overlays, and timeline navigation
- [ ] **Phase 4: Homepage & Daily Overview** - Today's task list with overdue-rolling display, progress donut chart, and task interaction

## Phase Details

### Phase 1: Foundation & App Shell
**Goal**: The application runs with a working database, consistent date handling in Dutch/Amsterdam timezone, dark/light mode, and navigation between all pages
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, UIST-01, UIST-02, UIST-03, UIST-06, UIST-07
**Success Criteria** (what must be TRUE):
  1. The app renders in the browser with navigation links to Dashboard, Gantt, and Bedrijven pages, with the active page visually indicated
  2. Dark mode toggle switches between light and dark themes, the preference survives a full page reload without any flash of wrong theme
  3. Dates displayed anywhere in the app use Dutch formatting (e.g., "Maandag 10 februari 2025"), weeks start on Monday, and all date computation uses Europe/Amsterdam timezone
  4. The Supabase database contains `companies` and `tasks` tables with proper foreign key relationships and cascade deletes, queryable from the running application
  5. The overdue-rolling utility correctly computes effective_deadline as max(deadline, today) and calculates days_overdue for incomplete tasks with past deadlines
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Next.js 16 project with shadcn/ui, database types, and Supabase client
- [ ] 01-02-PLAN.md — Date utilities with Dutch locale/Amsterdam timezone and dark/light theme system
- [ ] 01-03-PLAN.md — Overdue-rolling computation (TDD)
- [ ] 01-04-PLAN.md — Navigation, page shells, and root layout assembly with providers

### Phase 2: Company Management & Default Tasks
**Goal**: Users can create, view, edit, and manage companies with all client profile fields, and every new company automatically receives 6 correctly-configured default tasks
**Depends on**: Phase 1
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, DTSK-01, DTSK-02, DTSK-03, DTSK-04, DTSK-05, DTSK-06, DTSK-07, DTSK-08
**Success Criteria** (what must be TRUE):
  1. The Bedrijven overview page shows a grid of company cards displaying name, go-live date, and open task count, with a working "+ Nieuw bedrijf" button that creates a company
  2. Creating a company automatically generates 6 default tasks starting from warmup_start_date (1 day apart), with correct titles, and only the "onboarding call" task has an editable deadline
  3. A company detail page shows all four sections (Basisgegevens, Klantprofiel, Mailvarianten, Feedback & Planning) with editable fields that auto-save on blur with a visible save indicator, plus a manual save button
  4. The back button on the detail page returns to the companies overview
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Default task generation logic (TDD)
- [ ] 02-02-PLAN.md — shadcn/ui component install and Supabase data access layer
- [ ] 02-03-PLAN.md — Company overview page with card grid and creation dialog
- [ ] 02-04-PLAN.md — Company detail page with 4 sections, auto-save, and back navigation

### Phase 3: Gantt Chart & Task Management
**Goal**: Users can visualize all company warmup timelines on a horizontal Gantt chart, see task markers at their deadline positions, and create/edit/complete/delete tasks directly from the Gantt view
**Depends on**: Phase 2
**Requirements**: GANT-01, GANT-02, GANT-03, GANT-04, GANT-05, GANT-06, GANT-07, GANT-08, GANT-09, UIST-04, UIST-05
**Success Criteria** (what must be TRUE):
  1. The Gantt page shows a left sidebar with company names and a horizontally scrollable timeline grid with day columns, company warmup bars spanning warmup_start_date to go_live_date, and today's column highlighted
  2. Tasks appear as colored markers (red for pending, green for completed) at their deadline position within each company's row, with overdue tasks showing a -N delay badge
  3. Clicking a task marker opens an edit overlay with editable title, urgency toggle, notes, completion checkbox, save/cancel, and delete with confirmation; clicking a company name opens an overlay listing all its tasks
  4. The "+ Nieuwe taak" button on each company row creates a new task with title and deadline fields, and the task immediately appears on the Gantt timeline
  5. Arrow buttons and horizontal scroll navigate the timeline, and a "Vandaag" button jumps back to the current date view (default view shows 14 days starting from current week)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Homepage & Daily Overview
**Goal**: Users open the dashboard and immediately see what needs attention today -- a Dutch date header, a progress donut, and a sorted list of today's tasks with overdue badges
**Depends on**: Phase 3
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07
**Success Criteria** (what must be TRUE):
  1. The homepage shows "Vandaag" with the current date formatted in Dutch (e.g., "Maandag 10 februari 2025") and a progress donut chart showing completed/total ratio with a numeric counter in the center
  2. The task list displays all tasks with effective deadline of today (including overdue tasks rolled forward), each showing company name, task title, and a red overdue badge (-1, -2 etc.) when applicable
  3. Completed tasks appear with strikethrough and green checkmark; tasks are sorted with urgent first, then most overdue first, then alphabetical
  4. Clicking a task on the homepage opens the same edit overlay used in the Gantt view, allowing edits without leaving the homepage

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & App Shell | 0/4 | Planning complete | - |
| 2. Company Management & Default Tasks | 1/4 | In progress | - |
| 3. Gantt Chart & Task Management | 0/TBD | Not started | - |
| 4. Homepage & Daily Overview | 0/TBD | Not started | - |

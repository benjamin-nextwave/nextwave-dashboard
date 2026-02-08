---
phase: 03-gantt-chart-task-management
plan: 03
subsystem: gantt-dialogs
tags: [gantt, dialog, crud, overlay, state-machine, supabase]

dependency-graph:
  requires:
    - 03-01 (task CRUD data access layer)
    - 03-02 (Gantt page shell, overlay state machine, refreshData callback)
  provides:
    - Task edit dialog with full CRUD controls (title, urgency, completion, notes, delete)
    - Task create dialog with title and deadline
    - Company tasks dialog with sorted list and click-to-edit
    - Complete overlay state machine wiring in GanttPage
  affects:
    - 04-xx (Homepage may reuse TaskEditDialog for task editing from daily overview)

tech-stack:
  added: []
  patterns:
    - Null-prop dialog open pattern (prop null = closed, non-null = open)
    - Two-click delete confirmation pattern
    - Overlay state machine for exclusive dialog rendering
    - useEffect sync for local form state from props

file-tracking:
  key-files:
    created:
      - src/components/gantt/task-edit-dialog.tsx
      - src/components/gantt/task-create-dialog.tsx
      - src/components/gantt/company-tasks-dialog.tsx
    modified:
      - src/components/gantt/gantt-page.tsx

decisions:
  - id: 03-03-01
    decision: "Null-prop pattern for dialog open/close control"
    rationale: "Each dialog receives a typed prop (Task|null, string|null, CompanyWithTasks|null); null means closed. This avoids separate open boolean state and keeps the overlay state machine as single source of truth."

metrics:
  duration: ~2.5 min
  completed: 2026-02-08
---

# Phase 3 Plan 03: Task Dialog Overlays Summary

**Task edit, create, and company tasks dialogs wired into Gantt page overlay state machine with Supabase mutations and automatic refresh**

## What Was Done

### Task 1: Task edit dialog and task create dialog (1518f7b)

Created two dialog components for task CRUD operations:

**TaskEditDialog** (`src/components/gantt/task-edit-dialog.tsx`, 139 lines):
- Full task editor in a Dialog with all required fields
- Form fields: Titel (Input), Afgerond (Checkbox), Urgent (Switch), Notities (Textarea)
- Read-only deadline display using formatShortDate
- Two-click delete confirmation: first click shows "Bevestig verwijderen", second click deletes
- Save calls updateTask, delete calls deleteTask, both trigger onSaved callback for data refresh
- Local state synced from task prop via useEffect

**TaskCreateDialog** (`src/components/gantt/task-create-dialog.tsx`, 99 lines):
- Minimal creation form with Titel (Input) and Deadline (date Input)
- Company pre-selected via companyId prop
- Calls createTask with default values (is_completed: false, is_urgent: false, is_date_editable: true)
- Form fields reset when dialog opens (useEffect on companyId change)
- Aanmaken button disabled when title empty, deadline empty, or saving

### Task 2: Company tasks dialog and Gantt page wiring (c1bd688)

**CompanyTasksDialog** (`src/components/gantt/company-tasks-dialog.tsx`, 93 lines):
- Scrollable list of all company tasks sorted by deadline ascending
- Each task is a clickable button that fires onEditTask callback
- Colored status dots: green (completed), orange (urgent), red (pending)
- Completed tasks shown with line-through and muted text
- Overdue badge with "Xd te laat" using computeOverdue
- Empty state: "Geen taken" message

**GanttPage wiring** (`src/components/gantt/gantt-page.tsx`):
- Imported and rendered all three dialog components
- Each dialog receives typed props from overlay state machine discriminated union
- TaskEditDialog: task from editTask overlay state
- TaskCreateDialog: companyId from createTask overlay state
- CompanyTasksDialog: company from companyTasks overlay state, with onEditTask transitioning to editTask
- Removed void placeholder statements from Plan 02
- refreshData callback wired to onSaved/onCreated for automatic Gantt re-render after mutations

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **Null-prop dialog open pattern**: Each dialog uses its main prop being null/non-null to control open state, rather than a separate boolean. This keeps the overlay state machine as the single source of truth for which dialog is open.

## Requirements Fulfilled

- **GANT-05**: Task edit overlay with editable title, urgency toggle, notes textarea, completion checkbox, save/cancel buttons, and delete with confirmation
- **GANT-06**: Company tasks overlay with sorted task list, each clickable to open task edit
- **GANT-07**: Task creation with title and deadline, company pre-selected via "+" button
- **GANT-08**: All mutations persist to Supabase and Gantt grid refreshes after every change
- **GANT-09**: Overlay state machine ensures only one dialog open at a time

## Phase 3 Completion

This plan completes Phase 3: Gantt Chart & Task Management. All three plans delivered:
1. **03-01**: Data foundation (task CRUD functions, gantt-utils, shadcn components)
2. **03-02**: Visual Gantt chart (CSS Grid layout, company rows, warmup bars, task markers, navigation)
3. **03-03**: Interactive dialogs (task edit, task create, company tasks list, full CRUD wiring)

The Gantt chart is now fully functional with timeline navigation, visual task representation, and complete task CRUD operations.

## Next Phase Readiness

Phase 4 (Homepage & Daily Overview) can begin. It may reuse TaskEditDialog for editing tasks from the homepage daily view.

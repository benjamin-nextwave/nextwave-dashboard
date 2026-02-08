# Phase 3 Plan 1: Data Foundation & Utilities Summary

**One-liner:** Task CRUD functions, company-with-tasks query, and gantt-utils timeline date utilities using date-fns with Monday week start

## Execution Details

| Field | Value |
|-------|-------|
| Phase | 03-gantt-chart-task-management |
| Plan | 01 |
| Duration | ~3 min |
| Completed | 2026-02-08 |
| Tasks | 3/3 |

## Task Commits

| # | Task | Type | Commit | Key Files |
|---|------|------|--------|-----------|
| 1 | Install shadcn/ui checkbox and switch | chore | 4313431 | src/components/ui/checkbox.tsx, src/components/ui/switch.tsx |
| 2 | Extend data access layer with task CRUD and getCompaniesWithTasks | feat | b7f29e3 | src/lib/tasks.ts, src/lib/companies.ts |
| 3 | Create gantt-utils.ts timeline utility module | feat | 417306d | src/lib/gantt-utils.ts |

## What Was Built

### shadcn/ui Components (Task 1)
- **checkbox.tsx**: Radix-based accessible checkbox for task completion toggle
- **switch.tsx**: Radix-based accessible switch for urgency toggle

### Task CRUD Functions (Task 2)
- **createTask**: Inserts single task via Supabase, returns created Task with type assertion
- **updateTask**: Partial updates by ID, returns updated Task
- **deleteTask**: Deletes by ID, throws on error
- **getCompaniesWithTasks**: Fetches all companies with embedded tasks via `select('*, tasks(*)')`, sorts companies by name and tasks by deadline ascending

### Timeline Utilities (Task 3)
- **getTimelineRange(anchorDate, dayCount=14)**: Returns array of yyyy-MM-dd strings starting from Monday of the anchor week
- **getColumnIndex(dateStr, rangeStart)**: Returns 0-based column index via differenceInCalendarDays
- **isDateInRange(date, start, end)**: Inclusive interval check with null handling for ongoing warmups
- **formatDayHeader(dateStr)**: Returns Dutch two-letter day abbreviation and day number

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| CompanyWithTasks type assertion via intermediate `unknown` cast | Supabase embedded relation response doesn't narrow to the CompanyWithTasks type automatically; consistent with existing pattern in getCompaniesWithOpenTaskCounts |
| gantt-utils as pure module (no 'use client') | Pure functions work in both server and client contexts; consistent with dates.ts pattern [01-02] |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- [x] `npx tsc --noEmit` passes with zero errors
- [x] src/components/ui/checkbox.tsx and src/components/ui/switch.tsx exist
- [x] src/lib/tasks.ts has 5 exported functions
- [x] src/lib/companies.ts has 5 exported functions
- [x] src/lib/gantt-utils.ts has 4 exported functions
- [x] All functions follow existing Supabase patterns (type assertions, throw on error)
- [x] gantt-utils functions are pure, typed, and use date-fns with Monday week start

## Files Created/Modified

### Created
- src/components/ui/checkbox.tsx
- src/components/ui/switch.tsx
- src/lib/gantt-utils.ts

### Modified
- src/lib/tasks.ts (added createTask, updateTask, deleteTask)
- src/lib/companies.ts (added getCompaniesWithTasks, imported CompanyWithTasks type)

## Next Phase Readiness

All data access functions and utilities are in place for Plan 02 (Gantt chart UI components) and Plan 03 (task dialogs). No blockers.

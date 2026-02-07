---
phase: 02-company-management-default-tasks
plan: 01
subsystem: business-logic
tags: [date-fns, tdd, vitest, default-tasks, supabase-insert]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell
    provides: "date-fns dependency, Task type in database.types.ts, vitest test runner"
provides:
  - "DEFAULT_TASKS constant with 6 task definitions (title, dayOffset, is_date_editable)"
  - "generateDefaultTasks(companyId, warmupStartDate) function producing Supabase-ready insert objects"
affects:
  - 02-03 (company creation dialog will call generateDefaultTasks)
  - 02-04 (company detail page displays generated tasks)

# Tech tracking
tech-stack:
  added: []
  patterns: ["TDD red-green-refactor for pure business logic", "Omit<Task, 'id' | 'created_at'> for Supabase Insert types"]

key-files:
  created:
    - src/lib/default-tasks.ts
    - src/lib/__tests__/default-tasks.test.ts
  modified: []

key-decisions:
  - "Parse warmupStartDate with 'T00:00:00' suffix to avoid timezone offset issues"
  - "Zero-based day offsets (0-5) matching array index for simplicity"
  - "DefaultTaskDefinition type exported for reuse in UI components"

patterns-established:
  - "TDD for pure business logic: test file mirrors source file path"
  - "Supabase insert type pattern: Omit<Row, 'id' | 'created_at'> for generated fields"

# Metrics
duration: 2min
completed: 2026-02-07
---

# Phase 2 Plan 1: Default Task Generation Summary

**TDD-driven generateDefaultTasks function producing 6 Supabase-ready task objects with date-fns day offsets and editability flags**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-07T21:25:25Z
- **Completed:** 2026-02-07T21:27:36Z
- **Tasks:** 1 feature (TDD: RED + GREEN, no refactor needed)
- **Files created:** 2

## Accomplishments
- 15 unit tests covering all task properties, edge cases, and boundary conditions
- generateDefaultTasks function with correct date arithmetic using date-fns addDays
- DEFAULT_TASKS constant exporting 6 task definitions for reuse
- Month boundary (Jan 30 -> Feb) and year boundary (Dec 29 -> Jan) verified

## Task Commits

Each TDD phase was committed atomically:

1. **RED: Failing tests** - `9bcff34` (test) - 15 test cases for default task generation
2. **GREEN: Implementation** - `f5d71bc` (feat) - DEFAULT_TASKS constant and generateDefaultTasks function

No refactor commit needed -- implementation was clean on first pass.

## Files Created/Modified
- `src/lib/default-tasks.ts` - DEFAULT_TASKS constant and generateDefaultTasks function (47 lines)
- `src/lib/__tests__/default-tasks.test.ts` - 15 unit tests covering all behaviors and edge cases (192 lines)

## Decisions Made
- Parse warmupStartDate with `new Date(warmupStartDate + 'T00:00:00')` to avoid timezone offset issues when constructing dates from ISO strings
- Zero-based day offsets (0-5) so dayOffset matches the intuitive "days after start" counting
- Exported `DefaultTaskDefinition` type for potential reuse in UI components that display task templates

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- generateDefaultTasks is ready to be called from company creation flow (02-03)
- DEFAULT_TASKS constant available for any UI that needs to display task template names
- All 22 project tests pass (7 overdue + 15 default-tasks)

## Self-Check

- [x] src/lib/default-tasks.ts exists on disk (47 lines)
- [x] src/lib/__tests__/default-tasks.test.ts exists on disk (192 lines, above 40-line minimum)
- [x] git log --oneline --all --grep="02-01" returns 2 task commits
- [x] All 15 tests pass
- [x] Full test suite (22 tests) passes

## Self-Check: PASSED

---
*Phase: 02-company-management-default-tasks*
*Completed: 2026-02-07*

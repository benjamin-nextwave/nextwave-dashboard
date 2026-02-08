---
phase: 04-homepage-daily-overview
plan: 01
subsystem: data-layer
tags: [vitest, tdd, supabase, sorting, filtering, overdue, homepage]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell
    provides: "Supabase client, database types (Task, Company), overdue.ts computeOverdue"
provides:
  - "TaskWithCompany type (Task + company_name)"
  - "TodayTask type (task + companyName + overdue result)"
  - "getTodayTasksWithCompany: Supabase fetch with company join"
  - "filterTodayTasks: effective deadline = today filter"
  - "sortTodayTasks: 4-tier priority sort"
affects:
  - 04-02 (homepage UI components consume TodayTask and sort/filter functions)
  - 04-03 (homepage page assembles data pipeline)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Supabase mock in vitest via vi.mock for modules with side-effect imports"
    - "Relative imports in src/lib/ for vitest compatibility (no @/ alias config)"

key-files:
  created:
    - src/lib/homepage.ts
    - src/lib/__tests__/homepage.test.ts
  modified: []

key-decisions:
  - "Relative imports in homepage.ts for vitest path resolution (avoids vitest config for @/ alias)"
  - "vi.mock for supabase module to prevent env var validation during test import"
  - "Single effectiveDeadline === today condition handles all filter cases (no redundant OR)"

patterns-established:
  - "Supabase mock pattern: vi.mock('../supabase', () => ({ supabase: {} })) for testing modules that import supabase"
  - "TodayTask as the standard data shape for homepage consumption (task + companyName + overdue)"

# Metrics
duration: 5min
completed: 2026-02-08
---

# Phase 4 Plan 1: Homepage Data Layer Summary

**TDD sort/filter/fetch functions for homepage tasks with 4-tier priority sort and effectiveDeadline-based filtering using computeOverdue**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-08T01:36:26Z
- **Completed:** 2026-02-08T01:41:53Z
- **Tasks:** 2 (RED + GREEN TDD cycle)
- **Files created:** 2

## Accomplishments
- 14 passing tests covering sort (7) and filter (7) edge cases
- sortTodayTasks: deterministic 4-tier sort (incomplete > completed, urgent > non-urgent, most overdue > least overdue, alphabetical Dutch locale)
- filterTodayTasks: single `effectiveDeadline === today` condition correctly handles overdue, due-today, completed-today, and excludes future + completed-past
- getTodayTasksWithCompany: Supabase join query with null-safe company name defaulting to 'Onbekend'

## Task Commits

Each task was committed atomically:

1. **Task 1: RED -- failing tests** - `9be4ce6` (test)
2. **Task 2: GREEN -- implementation** - `c882d80` (feat)

_TDD cycle: 2 commits (test + feat). No refactor needed._

## Files Created/Modified
- `src/lib/homepage.ts` - Data layer: types, fetch, filter, sort for homepage tasks
- `src/lib/__tests__/homepage.test.ts` - 14 unit tests for sort and filter logic with supabase mock

## Decisions Made
- Used relative imports in homepage.ts (`./supabase`, `../types/database`, `./overdue`) instead of `@/` aliases for vitest compatibility without adding vitest config
- Added `vi.mock('../supabase')` in test file to prevent env var validation error during module import
- Single `effectiveDeadline === today` filter condition -- no redundant `task.is_completed && task.deadline === today` branch needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Switched to relative imports for vitest resolution**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** `@/` path aliases in homepage.ts not resolved by vitest (no vitest.config.ts with alias mapping)
- **Fix:** Changed imports to relative paths (`./supabase`, `../types/database`, `./overdue`) consistent with how test files already use relative imports
- **Files modified:** src/lib/homepage.ts, src/lib/__tests__/homepage.test.ts
- **Verification:** All 14 tests pass, `npx tsc --noEmit` clean
- **Committed in:** c882d80 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for test execution. No scope creep. Relative imports are consistent with existing patterns in test files.

## Issues Encountered
None beyond the path alias resolution handled above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Homepage data pipeline ready for UI consumption in 04-02 and 04-03
- TodayTask type provides all data needed for task cards (title, company name, overdue status, urgency)
- Sort function guarantees stable, deterministic ordering for consistent UI rendering

---
*Phase: 04-homepage-daily-overview*
*Completed: 2026-02-08*

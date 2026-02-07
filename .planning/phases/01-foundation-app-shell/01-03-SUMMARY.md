---
phase: 01-foundation-app-shell
plan: 03
subsystem: business-logic
tags: [overdue, tdd, date-fns, vitest]

# Dependency graph
requires: ["01-01"]
provides:
  - "computeOverdue function for overdue-rolling business logic"
  - "OverdueResult type for overdue computation results"
  - "Full test suite with 7 test cases covering all edge cases"
affects: [03-01, 04-01]

# Tech tracking
tech-stack:
  added: [vitest]
  patterns: [tdd-red-green-refactor, iso-string-comparison]

key-files:
  created: [src/lib/overdue.ts, src/lib/__tests__/overdue.test.ts]
  modified: [package.json, package-lock.json]

key-decisions:
  - "ISO string comparison for overdue detection (deadline < today) -- lexicographic compare works for ISO date strings"
  - "Vitest chosen as test runner -- zero-config with TypeScript and compatible with Vite ecosystem"
  - "date-fns differenceInCalendarDays for precise day counting -- already a project dependency"

patterns-established:
  - "TDD red-green-refactor cycle for business logic"
  - "Test files in __tests__ directory adjacent to source"
  - "Pure functions accepting ISO date strings and returning typed result objects"

# Metrics
duration: 5min
completed: 2026-02-07
---

# Phase 1 Plan 3: Overdue-Rolling Computation Summary

**Core overdue-rolling business logic implemented via TDD: pure function computing effective deadlines, overdue days, and overdue status using ISO date string comparison and date-fns for day counting.**

## Performance

- Plan start: 2026-02-07T20:35:04Z
- Plan end: 2026-02-07T20:39:55Z
- Duration: ~5 minutes
- All tasks completed in single pass, no blockers

## Accomplishments

1. Installed vitest test runner and configured test scripts in package.json
2. Wrote 7 comprehensive test cases covering all overdue computation scenarios
3. Implemented `computeOverdue` function with `OverdueResult` type interface
4. Verified TypeScript compilation passes cleanly
5. Full TDD cycle: RED (all fail) -> GREEN (7/7 pass)

## Task Commits

| Task | Description | Commit | Key Files |
|------|-------------|--------|-----------|
| 1 | Overdue computation with TDD test suite | 1c99b0e | src/lib/overdue.ts, src/lib/__tests__/overdue.test.ts, package.json |

## Files Created/Modified

### Created
- `src/lib/overdue.ts` -- computeOverdue function and OverdueResult interface
- `src/lib/__tests__/overdue.test.ts` -- 7 test cases for all edge cases

### Modified
- `package.json` -- added vitest dev dependency, test and test:watch scripts
- `package-lock.json` -- lock file updated for vitest

## TDD Results

- **RED:** 7 tests failing (Cannot find module '../overdue')
- **GREEN:** 7/7 tests passing (all assertions verified)
- **Test suite:** `src/lib/__tests__/overdue.test.ts`

### Test Cases Covered
1. Overdue: incomplete task past deadline (5 days overdue)
2. On-time: deadline is today (0 days, not overdue)
3. Future: deadline in the future (not overdue)
4. Completed past: completed task with past deadline (not overdue)
5. Completed future: completed task with future deadline (not overdue)
6. Boundary: 1-day overdue edge case
7. Large range: 31-day overdue (crossing month boundary)

## Decisions Made

1. **ISO string comparison for overdue detection** -- `deadline < today` works because ISO date strings sort lexicographically in chronological order. No need to parse dates for the boolean check.
2. **Vitest as test runner** -- Zero-config TypeScript support, works with path aliases from tsconfig, fast execution.
3. **date-fns differenceInCalendarDays for day counting** -- Already installed as a project dependency (v4.1.0). Used only for the numeric day difference, not for the overdue boolean.
4. **Pure function design** -- `computeOverdue` takes explicit `today` parameter instead of using `new Date()`, making it fully testable and deterministic.

## Deviations from Plan

None -- plan executed exactly as written.

## Next Phase Readiness

- `computeOverdue` is ready for use in Phase 2 (company/task CRUD) and Phase 3 (dashboard display)
- The function accepts ISO date strings (`YYYY-MM-DD`) which aligns with the database schema's `date` column type
- `OverdueResult.effectiveDeadline` provides the "rolling" deadline that the UI should display
- `OverdueResult.daysOverdue` provides the count for the overdue badge/indicator
- No blockers for subsequent phases

---
phase: 01-foundation-app-shell
plan: 02
subsystem: infra
tags: [date-fns, timezone, dutch-locale, next-themes, dark-mode]

# Dependency graph
requires: ["01-01"]
provides:
  - "Date utilities with Amsterdam timezone and Dutch locale"
  - "TodayProvider React context for consistent today date"
  - "ThemeProvider and ThemeToggle for dark/light mode"
affects: [01-04, 02-01, 03-01, 04-01]

# Tech tracking
tech-stack:
  added: []
  patterns: [tz-date-pattern, today-context-pattern, next-themes-wrapper]

key-files:
  created: [src/lib/dates.ts, src/lib/today-provider.tsx, src/components/theme-provider.tsx, src/components/theme-toggle.tsx]
  modified: []

key-decisions:
  - "dates.ts is a pure utility (no 'use client') so it works from both server and client components"
  - "TodayProvider uses both setInterval (60s) and visibilitychange for robust date detection across sleep/wake cycles"
  - "ThemeProvider is a thin wrapper around next-themes, keeping coupling minimal"
  - "ThemeToggle uses CSS-based icon swap pattern (dark: classes) instead of JS conditional rendering for smoother transitions"

patterns-established:
  - "TZDate pattern: always construct dates via TZDate.tz(TIMEZONE) for Amsterdam-correct dates"
  - "Today context pattern: single source of truth for 'today' that updates across midnight and sleep/wake"
  - "next-themes wrapper pattern: thin React wrapper enabling easy swap of theme library if needed"

# Metrics
duration: 3min
completed: 2026-02-07
---

# Phase 1 Plan 2: Date Utilities & Theme System Summary

**Date utility library with Amsterdam timezone and Dutch locale formatting, TodayProvider context for consistent date tracking, and dark/light theme system using next-themes.**

## Performance

- Duration: ~3 minutes
- Tasks: 2/2 completed
- TypeScript compilation: clean on both tasks
- No blockers encountered

## Accomplishments

1. **Date utility library** (`src/lib/dates.ts`) -- Pure utility module providing Amsterdam-timezone date operations with Dutch locale formatting. Includes `getToday()`, `getTodayISO()`, `formatDutchDate()`, `formatDutchDateCapitalized()`, `formatShortDate()`, and `getWeekStart()` (Monday-based weeks).

2. **TodayProvider context** (`src/lib/today-provider.tsx`) -- React context that provides the current date as an ISO string, automatically updating via a 60-second interval and a visibilitychange listener for sleep/wake detection. Ensures all components share a consistent "today" value.

3. **ThemeProvider** (`src/components/theme-provider.tsx`) -- Thin wrapper around next-themes' ThemeProvider, passing through all props for maximum flexibility.

4. **ThemeToggle** (`src/components/theme-toggle.tsx`) -- Ghost button with Sun/Moon icon swap using CSS transitions and dark: classes. Dutch accessibility label "Thema wisselen".

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Date utilities + TodayProvider | `cdcaf5e` | src/lib/dates.ts, src/lib/today-provider.tsx |
| 2 | Theme system | `2731975` | src/components/theme-provider.tsx, src/components/theme-toggle.tsx |

## Files Created/Modified

**Created:**
- `src/lib/dates.ts` -- Date utility library (40 lines)
- `src/lib/today-provider.tsx` -- TodayProvider context (41 lines)
- `src/components/theme-provider.tsx` -- Theme provider wrapper (11 lines)
- `src/components/theme-toggle.tsx` -- Theme toggle button (21 lines)

**Modified:** None

## Decisions Made

1. **dates.ts has no 'use client' directive** -- Kept as a pure utility so it can be imported in both server components (for SSR date formatting) and client components. Only today-provider.tsx needs 'use client' because it uses React hooks.

2. **TodayProvider uses dual detection** -- Both a 60-second interval and visibilitychange listener ensure the date updates correctly even when a laptop sleeps overnight and the user opens it the next day.

3. **CSS-based icon swap in ThemeToggle** -- Uses Tailwind dark: variant classes with rotate/scale transitions rather than conditional JSX rendering. This provides smoother visual transitions and avoids hydration mismatches.

4. **TodayContext default is empty string** -- Using empty string as the default context value allows useToday() to detect when it is called outside a TodayProvider and throw a helpful error message.

## Deviations from Plan

None -- plan executed exactly as written.

## Next Phase Readiness

- **01-03 (Layout shell):** ThemeProvider and TodayProvider are ready to be composed into the root layout.
- **01-04 (Navigation):** ThemeToggle is ready to be placed in the navigation bar.
- **02-01 (Company CRUD):** Date formatting utilities are available for displaying dates in Dutch throughout the application.

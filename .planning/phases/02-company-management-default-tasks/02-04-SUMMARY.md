---
phase: 02-company-management-default-tasks
plan: 04
subsystem: ui, hooks
tags: [company-detail, auto-save, form-sections, dynamic-route, blur-save]

requires:
  - phase: 01-foundation-app-shell
    provides: "shadcn/ui base setup, Supabase client, Database types"
  - phase: 02-company-management-default-tasks
    plan: 02
    provides: "shadcn/ui components (input, textarea, label, separator, button), companies CRUD, Company type"
provides:
  - "useAutoSave hook with field-level and bulk save status tracking"
  - "Company detail page at /bedrijven/[id] with 4 editable sections"
  - "SaveIndicator and PersonalitySelector reusable components"
  - "Auto-save on blur with visual feedback"
affects: [03-gantt, 04-polish]

tech-stack:
  added: []
  patterns: [auto-save-on-blur, field-level-partial-update, async-params-next16]

key-files:
  created:
    - src/hooks/use-auto-save.ts
    - src/components/companies/company-detail/save-indicator.tsx
    - src/components/companies/company-detail/personality-selector.tsx
    - src/components/companies/company-detail/company-detail-page.tsx
    - src/components/companies/company-detail/section-basisgegevens.tsx
    - src/components/companies/company-detail/section-klantprofiel.tsx
    - src/components/companies/company-detail/section-mailvarianten.tsx
    - src/components/companies/company-detail/section-feedback.tsx
    - src/app/bedrijven/[id]/page.tsx
  modified: []

key-decisions:
  - "useAutoSave hook without 'use client' directive (hooks used inside client components don't need it)"
  - "Field-level partial update: each blur sends only one field to updateCompany to prevent race conditions"
  - "PersonalitySelector onChange triggers both onFieldChange and onFieldBlur simultaneously (click-based, no separate blur event)"
  - "Date fields kept as YYYY-MM-DD strings, never converted to Date objects"
  - "Next.js 16 async params pattern: const { id } = await params"

patterns-established:
  - "Auto-save on blur: onFieldChange updates local state, onFieldBlur triggers save"
  - "Section component pattern: company + onFieldChange + onFieldBlur props"
  - "Stub-then-replace for cross-task dependencies (company-detail-page.tsx)"

duration: 5min
completed: 2026-02-08
---

# Phase 2 Plan 04: Company Detail Page with Auto-Save Summary

**Full /bedrijven/[id] detail page with 4 sections (basisgegevens, klantprofiel, mailvarianten, feedback), field-level auto-save on blur, manual save button, and Link-based back navigation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-07T23:57:56Z
- **Completed:** 2026-02-08T00:03:13Z
- **Tasks:** 2/2
- **Files created:** 9

## Accomplishments
- Created useAutoSave hook managing save lifecycle (idle/saving/saved/error) with 2s auto-reset
- Built SaveIndicator with Dutch text (Opslaan.../Opgeslagen/Fout bij opslaan)
- Built PersonalitySelector with 5 circular buttons (1-5) using primary/border theming
- Created /bedrijven/[id] dynamic route with Next.js 16 async params
- Built 4 section components covering all Company editable fields
- Built CompanyDetailPage orchestrator with auto-save on blur, manual save, and deterministic Link back nav
- All TypeScript compiles cleanly; full Next.js build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: useAutoSave hook, save indicator, personality selector, dynamic route** - `ceae492` (feat)
2. **Task 2: 4 section components and company detail page orchestrator** - `d05d794` (feat)

## Files Created

- `src/hooks/use-auto-save.ts` - useAutoSave hook with SaveStatus type, save/saveAll functions
- `src/components/companies/company-detail/save-indicator.tsx` - Visual save status indicator (Dutch)
- `src/components/companies/company-detail/personality-selector.tsx` - 5-button score selector
- `src/app/bedrijven/[id]/page.tsx` - Async Server Component thin wrapper
- `src/components/companies/company-detail/company-detail-page.tsx` - Full orchestrator with data loading, auto-save, sections
- `src/components/companies/company-detail/section-basisgegevens.tsx` - Name, dates, email, phone (2-col grid)
- `src/components/companies/company-detail/section-klantprofiel.tsx` - Client notes, personality score
- `src/components/companies/company-detail/section-mailvarianten.tsx` - 3 mail variant textareas (3-col grid)
- `src/components/companies/company-detail/section-feedback.tsx` - Feedback, wensen, extra notes

## Decisions Made
- useAutoSave hook has no 'use client' directive (consumed by client components, not a component itself)
- Each blur sends a single-field partial update to avoid race conditions
- PersonalitySelector triggers save immediately on click (no separate blur)
- Date inputs use native HTML date type and YYYY-MM-DD string format throughout
- Back navigation uses Link component (deterministic) not router.back() (history-dependent)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Company detail page fully functional with all COMP-03 through COMP-08 requirements
- Auto-save pattern established and reusable for future editable forms
- Build passes, dynamic route resolves

---
*Phase: 02-company-management-default-tasks*
*Completed: 2026-02-08*

## Self-Check: PASSED

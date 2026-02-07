---
phase: 01-foundation-app-shell
plan: 01
subsystem: infra
tags: [next.js, tailwind-v4, shadcn-ui, supabase, typescript, date-fns]

# Dependency graph
requires: []
provides:
  - "Next.js 16 project scaffold with TypeScript and Tailwind v4"
  - "shadcn/ui component library initialized with OKLCH colors"
  - "Database TypeScript types (Company, Task, CompanyWithTasks, Database)"
  - "Supabase singleton client with typed createClient<Database>"
  - "cn() class merge utility"
  - "Environment variable template (.env.example)"
affects: [01-02, 01-03, 01-04, 02-01, 02-02, 02-03, 03-01, 03-02, 04-01]

# Tech tracking
tech-stack:
  added: [next@16.1.6, react@19.2.3, tailwindcss@4, shadcn@3.8.4, @supabase/supabase-js@2.95.3, date-fns@4.1.0, @date-fns/tz@1.4.1, next-themes@0.4.6, lucide-react@0.563.0, class-variance-authority, clsx, tailwind-merge, tw-animate-css, radix-ui]
  patterns: [supabase-singleton, src-directory-structure, shadcn-component-model]

key-files:
  created: [package.json, tsconfig.json, src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, src/lib/utils.ts, src/types/database.ts, src/lib/supabase.ts, src/components/ui/button.tsx, .env.example, components.json, eslint.config.mjs, next.config.ts, postcss.config.mjs]
  modified: []

key-decisions:
  - "Used src/ directory structure for clean separation from config files"
  - "shadcn/ui initialized with Neutral base color and OKLCH color format (Tailwind v4 default)"
  - "Supabase client uses simple singleton pattern -- no @supabase/ssr since there is no auth"
  - "Database types manually authored to match SQL schema -- can be replaced with auto-generated types later"
  - ".env* gitignored with explicit !.env.example exception"

patterns-established:
  - "Import alias: @/* maps to ./src/* for clean imports"
  - "Component model: shadcn/ui copy-paste components in src/components/ui/"
  - "Utility pattern: cn() from src/lib/utils.ts for conditional class merging"
  - "Supabase pattern: singleton client from src/lib/supabase.ts with Database generic"

# Metrics
duration: 10min
completed: 2026-02-07
---

# Phase 1 Plan 1: Project Scaffold Summary

**Next.js 16.1.6 with Tailwind v4, shadcn/ui (OKLCH), typed Supabase client, and Company/Task database types**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-07T20:18:48Z
- **Completed:** 2026-02-07T20:28:54Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments

- Next.js 16.1.6 project scaffolded with TypeScript, Tailwind v4, App Router, and Turbopack
- shadcn/ui initialized with Tailwind v4 support, OKLCH colors, and Button component
- All Phase 1 dependencies installed (supabase-js, date-fns, @date-fns/tz, next-themes)
- Database types (Company, Task, CompanyWithTasks, Database) matching Supabase schema
- Typed Supabase singleton client with environment variable validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project with shadcn/ui and dependencies** - `d42875b` (feat)
2. **Task 2: Create database types and Supabase singleton client** - `4b5aefe` (feat)

## Files Created/Modified

- `package.json` - Project dependencies and scripts (Next.js 16, React 19, Tailwind v4, shadcn/ui, Supabase, date-fns)
- `tsconfig.json` - TypeScript config with @/* path alias pointing to src/
- `src/app/layout.tsx` - Root layout with lang="nl", Geist fonts, metadata
- `src/app/page.tsx` - Dashboard placeholder page
- `src/app/globals.css` - Tailwind v4 with shadcn/ui OKLCH CSS variables (light + dark)
- `src/lib/utils.ts` - cn() class merge helper (clsx + tailwind-merge)
- `src/components/ui/button.tsx` - shadcn Button component with variants
- `src/types/database.ts` - Company, Task, CompanyWithTasks, Database types
- `src/lib/supabase.ts` - Typed Supabase singleton client
- `.env.example` - Environment variable template for onboarding
- `components.json` - shadcn/ui configuration
- `eslint.config.mjs` - ESLint 9 flat config with next core-web-vitals and typescript
- `next.config.ts` - Next.js configuration
- `postcss.config.mjs` - PostCSS with @tailwindcss/postcss plugin
- `.gitignore` - Git ignore rules with .env* and !.env.example exception

## Decisions Made

- **src/ directory structure:** create-next-app scaffolds without src/ by default; restructured to use src/ for clean separation between source code and config files, matching the plan's file paths.
- **Neutral base color:** Accepted shadcn/ui default (Neutral) for the color palette. OKLCH format used throughout.
- **No @supabase/ssr:** Project has no auth, so the simple singleton pattern from @supabase/supabase-js is sufficient. No cookie management needed.
- **Manual database types:** Types authored manually to match the SQL schema. Can be replaced with `npx supabase gen types typescript` later.
- **.claude/ added to .gitignore:** Claude's local settings file should not be committed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scaffolded in temp directory due to non-empty project root**
- **Found during:** Task 1 (Project scaffolding)
- **Issue:** create-next-app does not scaffold into a directory that already contains files (.planning/, .claude/, .git/)
- **Fix:** Created temp directory, scaffolded there, then moved files to project root with src/ restructuring
- **Files modified:** All scaffolded files
- **Verification:** npm run build passes
- **Committed in:** d42875b (Task 1 commit)

**2. [Rule 3 - Blocking] Added .claude/ to .gitignore**
- **Found during:** Task 1 (Staging files for commit)
- **Issue:** .claude/settings.local.json was showing as untracked -- local IDE config should not be committed
- **Fix:** Added `.claude/` to .gitignore
- **Files modified:** .gitignore
- **Verification:** git check-ignore .claude/ confirms ignored
- **Committed in:** d42875b (Task 1 commit)

**3. [Rule 3 - Blocking] Added !.env.example exception to .gitignore**
- **Found during:** Task 2 (Environment files)
- **Issue:** Default .gitignore uses `.env*` pattern which would also exclude .env.example from version control
- **Fix:** Added `!.env.example` exception line
- **Files modified:** .gitignore
- **Verification:** git check-ignore .env.example confirms NOT ignored
- **Committed in:** d42875b (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All auto-fixes necessary for correct scaffolding and git hygiene. No scope creep.

## Issues Encountered

None -- scaffolding and type creation proceeded smoothly after the temp directory workaround.

## User Setup Required

**External services require manual configuration before the Supabase client can connect:**

1. **Create a Supabase project** at https://supabase.com/dashboard -> New Project
2. **Run the SQL schema** in Supabase Dashboard -> SQL Editor to create `companies` and `tasks` tables (schema available in `.planning/phases/01-foundation-app-shell/01-RESEARCH.md`)
3. **Copy credentials** from Supabase Dashboard -> Project Settings -> API:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public key)
4. **Update `.env.local`** with the real values

## Next Phase Readiness

- Foundation scaffold complete -- all subsequent plans can import from @/types/database and @/lib/supabase
- shadcn/ui ready for additional component additions (card, input, dialog, etc.)
- Date utilities (Plan 02) can build on date-fns and @date-fns/tz already installed
- Theme provider (Plan 03) can use next-themes already installed
- Navigation (Plan 04) can use Button and cn() already available

---
*Phase: 01-foundation-app-shell*
*Completed: 2026-02-07*

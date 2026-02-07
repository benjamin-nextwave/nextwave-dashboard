# Phase 1: Foundation & App Shell - Research

**Researched:** 2026-02-07
**Domain:** Next.js App Router project scaffolding, Supabase database setup, date/timezone handling, dark mode theming, navigation shell
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire technical foundation: project scaffolding, database schema, Supabase client, date utilities with Dutch locale and Amsterdam timezone, dark/light mode, and the navigation shell. Every subsequent phase depends on these decisions being correct.

**Critical discovery during research:** Next.js 16 is now the current stable version (16.1.6 as of February 2026). The prior project research assumed Next.js 15. Running `npx create-next-app@latest` will scaffold Next.js 16, not 15. Next.js 16 is production-ready and recommended for new projects. Key differences from 15: async request APIs are now mandatory (no sync fallback), `next lint` is removed (use ESLint or Biome directly), Turbopack is the default bundler, and middleware is renamed to proxy. For a greenfield project with no legacy code, Next.js 16 is the correct choice.

Additionally, shadcn/ui now officially supports Tailwind v4 and React 19. New projects initialized with `npx shadcn@latest init` default to Tailwind v4. The prior research recommended pinning Tailwind v3.4 for shadcn compatibility -- this is no longer necessary. Tailwind v4 with shadcn/ui is the current standard.

**Primary recommendation:** Use Next.js 16 + Tailwind v4 + shadcn/ui (latest) + date-fns v4 with `@date-fns/tz` + next-themes + a simple `@supabase/supabase-js` singleton client (no `@supabase/ssr` needed since there is no auth).

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | ^16.1 | Full-stack React framework (App Router) | Current stable. Turbopack default, React Compiler stable, async APIs mandatory. Recommended for all new projects. |
| **React** | ^19.2 | UI library | Required by Next.js 16. React Compiler auto-memoizes components. |
| **TypeScript** | ^5.6 | Type safety | Non-negotiable. Catches schema mismatches at compile time. |
| **Tailwind CSS** | ^4.x | Utility-first CSS | shadcn/ui now supports v4. New projects default to v4. OKLCH colors, `@theme` directive. |
| **shadcn/ui** | latest CLI | Component library (copy-paste model) | Radix UI primitives, full dark mode, accessible. Now supports Tailwind v4 + React 19. |
| **@supabase/supabase-js** | ^2.x | Supabase client SDK | Official JS client. Singleton pattern for no-auth projects. |
| **date-fns** | ^4.x | Date manipulation & formatting | Tree-shakeable, Dutch locale (`nl`), first-class timezone support via `@date-fns/tz`. |
| **@date-fns/tz** | ^1.x | Timezone-aware date handling | `TZDate` class performs all calculations in specified timezone. Replaces `date-fns-tz`. |
| **next-themes** | ^0.4.x | Dark/light mode | Handles SSR flash, localStorage persistence, system preference. Used by shadcn/ui examples. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **lucide-react** | latest | Icons | Default icon set for shadcn/ui. Use for nav icons, theme toggle. |
| **tw-animate-css** | latest | Animations | Replaces `tailwindcss-animate` for Tailwind v4 projects. Installed by shadcn init. |
| **clsx** | ^2.x | Conditional classnames | Used in shadcn `cn()` helper. |
| **tailwind-merge** | ^2.x | Class deduplication | Used in shadcn `cn()` helper. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js 16 | Next.js 15 (pinned) | 15 still receives patches but 16 is recommended for new projects. Using 15 means dealing with deprecated patterns and missing Turbopack-as-default. |
| Tailwind v4 | Tailwind v3.4 | v3.4 still works with shadcn but is no longer the default for new projects. v4 is the forward-looking choice. |
| `@supabase/supabase-js` singleton | `@supabase/ssr` (server+browser clients) | `@supabase/ssr` is designed for auth-aware SSR. Without auth, a simple singleton from `@supabase/supabase-js` is simpler and sufficient. |
| `@date-fns/tz` (TZDate) | `date-fns-tz` (legacy) | `date-fns-tz` is the old companion library with the "lying Date" issue. `@date-fns/tz` is the official v4 replacement with proper `TZDate` class. |
| ESLint (direct) | Biome | `next lint` is removed in Next.js 16. Both ESLint and Biome work. ESLint has broader ecosystem; Biome is faster. Either is fine for a personal project. |

**Installation:**
```bash
# 1. Create Next.js 16 project (defaults: TypeScript, Tailwind, App Router, Turbopack)
npx create-next-app@latest nextwave-dashboard --yes

# 2. Initialize shadcn/ui (supports Tailwind v4)
npx shadcn@latest init

# 3. Core dependencies
npm install @supabase/supabase-js date-fns @date-fns/tz next-themes

# 4. Add shadcn components needed for Phase 1
npx shadcn@latest add button

# 5. Dev dependencies (linting - since next lint is removed in v16)
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react

# 6. Supabase CLI for type generation (optional - manual types also work)
npm install -D supabase
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope)

```
src/
├── app/
│   ├── layout.tsx              # Root layout: html, body, ThemeProvider, Navigation
│   ├── page.tsx                # Dashboard page (placeholder)
│   ├── globals.css             # Tailwind v4 base + shadcn CSS variables
│   ├── gantt/
│   │   └── page.tsx            # Gantt page (placeholder)
│   └── bedrijven/
│       └── page.tsx            # Bedrijven page (placeholder)
├── components/
│   ├── ui/                     # shadcn/ui primitives (auto-generated)
│   │   └── button.tsx
│   ├── navigation.tsx          # App navigation with active page indicator
│   ├── theme-provider.tsx      # next-themes wrapper (client component)
│   └── theme-toggle.tsx        # Dark/light mode switch
├── lib/
│   ├── supabase.ts             # Supabase singleton client
│   ├── dates.ts                # Timezone-aware date utilities (Amsterdam, Dutch locale)
│   ├── overdue.ts              # Overdue-rolling computation
│   ├── today-provider.tsx      # TodayContext for consistent date across app
│   └── utils.ts                # cn() helper (shadcn convention)
├── types/
│   └── database.ts             # TypeScript types matching Supabase schema
└── .env.local                  # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Pattern 1: Supabase Singleton Client (No Auth)

**What:** A single Supabase client instance shared across the entire app.
**When to use:** Projects without authentication where the anon key is the only credential.
**Why:** Prevents multiple WebSocket connections, stale data, and memory leaks (Pitfall 1 from project research). Without auth, there are no cookies to manage, so `@supabase/ssr` adds unnecessary complexity.

```typescript
// lib/supabase.ts
// Source: @supabase/supabase-js docs + Supabase GitHub discussions
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

**Key decision:** This project uses a single `@supabase/supabase-js` client, NOT the `@supabase/ssr` two-client pattern. The `@supabase/ssr` package exists for auth-aware SSR (cookie management). Without auth, it adds complexity for zero benefit. The singleton is usable from both server and client components.

### Pattern 2: TZDate for Amsterdam Timezone

**What:** Use `TZDate` from `@date-fns/tz` to perform all date computations in Europe/Amsterdam timezone.
**When to use:** Any time "today" is computed, any time dates are compared for overdue logic, any time dates are displayed.
**Why:** `TZDate` extends native `Date` and makes all `.getHours()`, `.getDay()`, etc. return values in the specified timezone. This eliminates the "lying Date" problem from the old `date-fns-tz` library.

```typescript
// lib/dates.ts
// Source: @date-fns/tz README (https://github.com/date-fns/tz)
// Source: date-fns v4 blog (https://blog.date-fns.org/v40-with-time-zone-support/)
import { TZDate } from '@date-fns/tz'
import { format, startOfDay, startOfWeek, parseISO, differenceInCalendarDays } from 'date-fns'
import { nl } from 'date-fns/locale/nl'

const TIMEZONE = 'Europe/Amsterdam'

/** Get "today" as a TZDate in Amsterdam timezone */
export function getToday(): TZDate {
  return startOfDay(TZDate.tz(TIMEZONE))
}

/** Get today's date as an ISO string (YYYY-MM-DD) */
export function getTodayISO(): string {
  const today = TZDate.tz(TIMEZONE)
  return format(today, 'yyyy-MM-dd')
}

/** Format date in Dutch: "maandag 10 februari 2025" */
export function formatDutchDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE d MMMM yyyy', { locale: nl })
}

/** Capitalize first letter for headers: "Maandag 10 februari 2025" */
export function formatDutchDateCapitalized(date: Date | string): string {
  const formatted = formatDutchDate(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/** Format short Dutch date: "10 feb 2025" */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM yyyy', { locale: nl })
}

/** Get start of week (Monday) for a given date */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1, locale: nl })
}
```

**Important:** Dutch locale `format()` output uses lowercase for months and days ("maandag", "februari"). For headers like "Vandaag -- Maandag 10 februari 2025", capitalize the first letter explicitly.

### Pattern 3: TodayContext for Consistent Date Computation

**What:** A React context that provides "today" as a single value to all components, refreshed at midnight Amsterdam time.
**When to use:** Every component that needs to compute overdue state, display today's date, or determine the current week.
**Why:** Prevents inconsistencies where different components compute "today" at different moments (Pitfall 7 from project research). Also handles overnight tab-stays and laptop sleep/wake.

```typescript
// lib/today-provider.tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { getTodayISO } from '@/lib/dates'

const TodayContext = createContext<string>('')

export function TodayProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState(() => getTodayISO())

  useEffect(() => {
    // Check every 60 seconds if the date has changed
    const interval = setInterval(() => {
      const now = getTodayISO()
      if (now !== today) setToday(now)
    }, 60_000)

    // Also check on tab focus (handles sleep/wake)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const now = getTodayISO()
        if (now !== today) setToday(now)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [today])

  return (
    <TodayContext.Provider value={today}>
      {children}
    </TodayContext.Provider>
  )
}

export function useToday(): string {
  const context = useContext(TodayContext)
  if (!context) throw new Error('useToday must be used within TodayProvider')
  return context
}
```

### Pattern 4: Overdue-Rolling Computation

**What:** Pure function that takes a task and today's date string, returns effective deadline and overdue state.
**When to use:** Every time a task is rendered (homepage, Gantt, overlays).
**Why:** Core business logic. Uses string comparison for dates (ISO strings compare correctly), no Date object ambiguity.

```typescript
// lib/overdue.ts
import { differenceInCalendarDays, parseISO } from 'date-fns'

export interface OverdueResult {
  effectiveDeadline: string  // ISO date string
  originalDeadline: string   // ISO date string
  daysOverdue: number        // 0 if not overdue
  isOverdue: boolean
}

/**
 * Compute overdue-rolling state for a task.
 * effective_deadline = max(deadline, today)
 * days_overdue = dateDiff(today, original_deadline) when overdue and not completed
 */
export function computeOverdue(
  deadline: string,
  today: string,
  isCompleted: boolean
): OverdueResult {
  const isOverdue = !isCompleted && deadline < today
  const effectiveDeadline = isOverdue ? today : deadline
  const daysOverdue = isOverdue
    ? differenceInCalendarDays(parseISO(today), parseISO(deadline))
    : 0

  return {
    effectiveDeadline,
    originalDeadline: deadline,
    daysOverdue,
    isOverdue,
  }
}
```

### Pattern 5: Dark Mode with next-themes

**What:** `ThemeProvider` wrapping the app with `attribute="class"` for Tailwind dark mode.
**When to use:** Root layout wraps all content.
**Why:** next-themes injects a blocking script that reads localStorage before React hydrates, preventing flash of wrong theme (Pitfall 2).

```typescript
// components/theme-provider.tsx
// Source: shadcn/ui dark mode docs (https://ui.shadcn.com/docs/dark-mode/next)
'use client'
import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'
import { TodayProvider } from '@/lib/today-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TodayProvider>
            {/* Navigation + children */}
            {children}
          </TodayProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Critical:** `suppressHydrationWarning` on `<html>` is required. next-themes modifies the class attribute before React hydrates, which would cause a hydration mismatch warning without it.

### Pattern 6: Navigation with Active Page Indicator

**What:** A navigation component using Next.js `usePathname()` to highlight the active page.
**When to use:** Persistent across all pages in the layout.

```typescript
// components/navigation.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/gantt', label: 'Gantt' },
  { href: '/bedrijven', label: 'Bedrijven' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6 border-b px-6 py-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-foreground/80',
            pathname === item.href
              ? 'text-foreground'
              : 'text-muted-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </nav>
  )
}
```

### Anti-Patterns to Avoid

- **Using `@supabase/ssr` without auth:** Adds unnecessary cookie management complexity. Use plain `@supabase/supabase-js` singleton.
- **Calling `new Date()` in multiple components for "today":** Leads to inconsistent overdue calculations near midnight. Use `TodayContext` instead.
- **Importing `format` from `date-fns` without locale:** Produces English output. Always use the wrapper functions from `lib/dates.ts` that include `{ locale: nl }`.
- **Using `startOfWeek` without `weekStartsOn: 1`:** date-fns defaults to Sunday. Dutch convention is Monday. Always pass the option or use the wrapper.
- **Using `date-fns-tz` (old package):** Use `@date-fns/tz` instead. The old package uses the "lying Date" pattern that causes subtle bugs.
- **Storing computed values (effective_deadline, days_overdue) in the database:** These change daily. Compute at render time from the `TodayContext`.
- **Using raw Tailwind colors (`bg-white`, `text-gray-900`) instead of CSS variables:** Breaks dark mode. Use semantic names (`bg-background`, `text-foreground`).
- **Using `next lint` (removed in Next.js 16):** Run ESLint or Biome directly via `npx eslint .` instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode with localStorage | Manual `<script>` + React state + class toggling | `next-themes` | Handles blocking script, system preference, SSR, localStorage, and hydration mismatch automatically |
| Theme-aware component styling | Per-component dark: variants for every color | shadcn/ui CSS variables (`bg-background`, `text-foreground`, etc.) | CSS variables switch automatically with theme class; no per-component work |
| Timezone-aware date objects | Manual UTC offset calculations | `@date-fns/tz` `TZDate` class | Handles DST transitions, timezone conversions, and interops with all date-fns functions |
| Date formatting with Dutch locale | Manual day/month name lookups | `date-fns` `format()` with `{ locale: nl }` | Complete, tested locale including month names, day names, ordinals |
| Supabase connection management | Connection pool, retry logic, WebSocket management | `@supabase/supabase-js` singleton | Handles connection pooling, retries, and real-time subscriptions internally |

**Key insight:** Every "simple" hand-rolled solution in this domain hides edge cases (DST transitions, hydration timing, connection lifecycle) that the standard libraries handle. The time savings from using the standard tools is measured in days of debugging avoided.

## Common Pitfalls

### Pitfall 1: Next.js 16 Breaking Changes (NEW -- not in prior research)

**What goes wrong:** Code examples and tutorials found online target Next.js 15 patterns. Using `next lint`, synchronous `params` access, or `middleware.ts` will fail silently or error on Next.js 16.
**Why it happens:** Next.js 16 was released after the project's initial research. The prior stack research assumed Next.js 15.
**How to avoid:**
1. Always use `await props.params` in page/layout components (async params are mandatory in v16)
2. Do NOT create `middleware.ts` -- it is renamed to `proxy.ts` in v16 (though we don't need either for this project)
3. Do NOT use `next lint` -- removed in v16. Use `npx eslint .` directly
4. Turbopack is default -- no `--turbopack` flag needed in scripts
5. If following any tutorial, check if it targets v15 or v16

**Warning signs:** Build errors mentioning deprecated APIs, "synchronous access" warnings.

### Pitfall 2: Hydration Flash with Dark Mode

**What goes wrong:** Page loads in light mode, then flashes to dark mode as React hydrates.
**Why it happens:** Server doesn't know user's theme preference (stored in localStorage).
**How to avoid:** Use `next-themes` with `attribute="class"` and `suppressHydrationWarning` on `<html>`. next-themes injects a blocking `<script>` that reads localStorage BEFORE React hydrates, setting the correct class immediately.
**Warning signs:** Any visible flash of wrong theme on page load.

### Pitfall 3: date-fns Timezone -- The Old vs New API

**What goes wrong:** Using `utcToZonedTime` from the OLD `date-fns-tz` package creates "lying" Date objects where the internal UTC timestamp is shifted. This corrupts any code that compares or stores these dates.
**Why it happens:** The old `date-fns-tz` package is still installable and still appears in many tutorials.
**How to avoid:** Use `@date-fns/tz` (new package). Use `TZDate` class. Import `tz()` context function for passing timezone to date-fns operations via the `in` option.
**Warning signs:** Import from `date-fns-tz` instead of `@date-fns/tz`. Function names like `utcToZonedTime` or `zonedTimeToUtc`.

### Pitfall 4: Week Starting on Sunday

**What goes wrong:** `startOfWeek()` from date-fns defaults to Sunday (US convention). The Gantt chart and date calculations show wrong week boundaries for Dutch users.
**Why it happens:** date-fns has no global locale configuration. Each function call needs `{ weekStartsOn: 1 }` explicitly.
**How to avoid:** Wrap `startOfWeek` and `endOfWeek` in `lib/dates.ts` with `weekStartsOn: 1` baked in. Import from your utility, never directly from date-fns for week functions.
**Warning signs:** Gantt week columns starting on Sunday. Week number calculations off by one.

### Pitfall 5: Supabase RLS -- Silent Empty Results

**What goes wrong:** RLS is enabled on Supabase tables by default. Without policies, all queries return empty arrays `[]` with no error. Developer thinks data is gone.
**Why it happens:** Supabase's default is "deny all" when RLS is enabled with no policies.
**How to avoid:** For a personal dashboard without auth, either: (a) disable RLS on each table, or (b) add a permissive policy allowing all operations for the anon role. Document the decision and accept the security tradeoff for a personal tool.
**Warning signs:** Queries return empty arrays despite data existing in the Supabase dashboard.

### Pitfall 6: Dutch Locale Lowercase Output

**What goes wrong:** The date header shows "maandag 10 februari 2025" (lowercase) instead of "Maandag 10 februari 2025" (capitalized).
**Why it happens:** The Dutch locale in date-fns outputs day and month names in lowercase, which is grammatically correct in Dutch for inline text but looks wrong as a page header.
**How to avoid:** Create `formatDutchDateCapitalized()` that capitalizes the first letter after formatting. Only capitalize when used as a standalone header, not inline.
**Warning signs:** Headers looking oddly lowercase compared to design expectations.

## Code Examples

### Database Schema (Supabase SQL)

```sql
-- Source: Project requirements FOUN-01
-- Run in Supabase SQL editor

-- Companies table
create table companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  warmup_start_date date,
  go_live_date date,
  status text default 'warmup' check (status in ('warmup', 'live', 'completed', 'paused')),
  contact_person text,
  email text,
  phone text,
  client_notes text,
  personality_score integer check (personality_score between 1 and 5),
  mail_variant_1 text,
  mail_variant_2 text,
  mail_variant_3 text,
  feedback_mailvarianten text,
  toekomstige_wensen text,
  extra_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  title text not null,
  deadline date not null,
  is_completed boolean default false,
  is_urgent boolean default false,
  is_date_editable boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index idx_tasks_company_id on tasks(company_id);
create index idx_tasks_deadline on tasks(deadline);
create index idx_tasks_incomplete on tasks(is_completed) where is_completed = false;

-- Disable RLS for personal use (no auth)
alter table companies disable row level security;
alter table tasks disable row level security;
```

**Key decisions:**
- `date` type (not `timestamptz`) for deadline, warmup_start_date, go_live_date -- these are calendar dates
- `on delete cascade` on tasks.company_id -- deleting a company removes its tasks
- `uuid` primary keys -- Supabase convention
- `status` as text with check constraint -- simpler than enum, no migration hassles
- RLS disabled -- personal dashboard, single user, no auth
- Company table includes all detail-page fields from requirements (COMP-03 through COMP-06) for schema-forward design

### TypeScript Types (Manual)

```typescript
// types/database.ts
// Manual types matching the Supabase schema above
// Can be replaced with auto-generated types later: npx supabase gen types typescript

export type Company = {
  id: string
  name: string
  warmup_start_date: string | null  // ISO date string
  go_live_date: string | null       // ISO date string
  status: 'warmup' | 'live' | 'completed' | 'paused'
  contact_person: string | null
  email: string | null
  phone: string | null
  client_notes: string | null
  personality_score: number | null
  mail_variant_1: string | null
  mail_variant_2: string | null
  mail_variant_3: string | null
  feedback_mailvarianten: string | null
  toekomstige_wensen: string | null
  extra_notes: string | null
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  company_id: string
  title: string
  deadline: string      // ISO date string
  is_completed: boolean
  is_urgent: boolean
  is_date_editable: boolean
  notes: string | null
  created_at: string
}

export type CompanyWithTasks = Company & {
  tasks: Task[]
}

// Supabase Database type for typed client
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
    }
  }
}
```

### Theme Toggle Component

```typescript
// components/theme-toggle.tsx
// Source: shadcn/ui dark mode docs
'use client'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Thema wisselen"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

### Tailwind v4 Dark Mode CSS Setup

```css
/* app/globals.css */
/* With Tailwind v4 + shadcn/ui, CSS variables are defined in :root and .dark */
/* shadcn init generates this automatically. Key variables: */

@import "tailwindcss";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  /* ... etc */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.651 0 0);
  --border: oklch(0.269 0 0);
  /* ... etc */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  /* ... etc - maps CSS vars to Tailwind utilities */
}
```

**Note:** Tailwind v4 uses `@theme inline` directive instead of extending `tailwind.config.ts`. shadcn/ui init generates this automatically. Colors use OKLCH format instead of HSL.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js 15 | **Next.js 16** (current stable) | Late 2025 | Async params mandatory, Turbopack default, `next lint` removed, middleware renamed to proxy |
| Tailwind v3.4 + `tailwind.config.ts` | **Tailwind v4** + `@theme` directive in CSS | Early 2025, shadcn support mid-2025 | No config file needed; CSS-native configuration; OKLCH colors |
| `tailwindcss-animate` | **`tw-animate-css`** | With Tailwind v4 | Drop-in replacement for animations in v4 |
| `date-fns-tz` (`utcToZonedTime`) | **`@date-fns/tz`** (`TZDate` class) | date-fns v4 (late 2024) | Proper timezone-aware Date subclass; no more "lying Date" |
| `npx shadcn-ui@latest init` | **`npx shadcn@latest init`** | 2025 | CLI package name changed from `shadcn-ui` to `shadcn` |
| HSL color format in shadcn | **OKLCH color format** | With Tailwind v4 support | Better perceptual uniformity; shadcn generates OKLCH by default now |
| `@supabase/auth-helpers-nextjs` | **`@supabase/ssr`** (or plain `@supabase/supabase-js` for no-auth) | 2024 | auth-helpers deprecated; @supabase/ssr is the replacement for auth-aware apps |
| `next lint` | **Direct ESLint or Biome CLI** | Next.js 16 | `next lint` removed; run linter directly |

**Deprecated/outdated from prior project research:**
- `npx shadcn-ui@latest init` -- use `npx shadcn@latest init` (package renamed)
- Tailwind v3.4 recommendation -- Tailwind v4 is now the standard for new shadcn projects
- `date-fns-tz` recommendation -- use `@date-fns/tz` with TZDate instead
- `@supabase/ssr` recommendation for this project -- use plain `@supabase/supabase-js` singleton (no auth means no cookie management needed)
- `next lint` in scripts -- removed in Next.js 16

## Open Questions

1. **Next.js 16 + next-themes compatibility**
   - What we know: next-themes v0.4.6 was published about a year ago and supports App Router. Next.js 16 doesn't change the `<html>` class mechanism that next-themes uses.
   - What's unclear: No explicit "works with Next.js 16" confirmation found.
   - Recommendation: Proceed with next-themes v0.4.6. The mechanism (injecting `<script>` to set class on `<html>`) is Next.js-version-independent. If issues arise, the fallback is a manual blocking script in `<head>`.

2. **Tailwind v4 darkMode configuration**
   - What we know: Tailwind v4 uses a different approach to dark mode. One source suggests `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` for data-attribute approach.
   - What's unclear: Whether `attribute="class"` from next-themes works out-of-the-box with Tailwind v4's dark mode, or if additional CSS configuration is needed.
   - Recommendation: Use `attribute="class"` with next-themes. Tailwind v4's `dark:` variant still responds to the `dark` class on a parent element by default. Test during implementation.

3. **Supabase RLS decision for personal dashboard**
   - What we know: Without RLS, anyone with the anon key (visible in client-side JS) can query the database. With RLS enabled and no policies, queries return empty arrays.
   - What's unclear: Whether the user cares about data exposure for a personal tool.
   - Recommendation: Disable RLS for now (simplest). Note this in the code. If security becomes a concern later, add permissive policies or move to server-only queries.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Breaking changes, async params, proxy, lint removal
- [Next.js installation docs](https://nextjs.org/docs/app/getting-started/installation) -- create-next-app current options
- [@date-fns/tz README](https://github.com/date-fns/tz) -- TZDate API, constructor, tz() context function
- [date-fns v4 blog post](https://blog.date-fns.org/v40-with-time-zone-support/) -- First-class timezone support, TZDate usage
- [shadcn/ui dark mode docs](https://ui.shadcn.com/docs/dark-mode/next) -- ThemeProvider setup, next-themes integration
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) -- v4 support status, @theme directive, OKLCH colors
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) -- CLI commands, init process
- [Supabase SSR client docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- createBrowserClient vs createClient patterns

### Secondary (MEDIUM confidence)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) -- v0.4.6 latest, App Router support
- [next-themes npm](https://www.npmjs.com/package/next-themes) -- Version history, compatibility
- [Supabase singleton discussion](https://github.com/orgs/supabase/discussions/26936) -- Community patterns for singleton client
- [date-fns Dutch locale usage](https://deepwiki.com/date-fns/date-fns/4.1-using-locales) -- Import path, weekStartsOn override
- [Next.js 15 vs 16 comparison](https://www.descope.com/blog/post/nextjs15-vs-nextjs16) -- Decision guidance for new projects
- [Next.js 16 linting setup](https://chris.lu/web_development/tutorials/next-js-16-linting-setup-eslint-9-flat-config) -- ESLint 9 flat config after `next lint` removal

### Tertiary (LOW confidence)
- Tailwind v4 + next-themes `attribute="class"` interaction -- no explicit documentation found; should work based on mechanism analysis but needs implementation testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All versions verified against current npm/official docs. Next.js 16, Tailwind v4, shadcn/ui, date-fns v4 with @date-fns/tz are all current stable releases.
- Architecture: HIGH -- Patterns verified against official documentation. Supabase singleton, next-themes setup, TZDate usage all documented in primary sources.
- Pitfalls: HIGH -- Pitfalls verified against Next.js 16 breaking changes list and date-fns v4 migration guide. The Next.js 16 pitfall is new and critical.

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days -- stable, mature stack)

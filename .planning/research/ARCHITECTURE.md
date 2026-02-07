# Architecture Patterns

**Domain:** Personal client management dashboard (Next.js App Router + Supabase + Tailwind CSS + shadcn/ui)
**Researched:** 2026-02-07
**Overall confidence:** HIGH (mature, well-documented stack; established patterns)

> **Note on sources:** WebSearch and WebFetch were unavailable during this research session. All findings are based on training data for well-established, stable technologies (Next.js App Router GA since Oct 2023, Supabase stable, shadcn/ui stable). Patterns described here are canonical and documented in official sources. Confidence is HIGH because these are mature, widely-adopted patterns -- not bleeding-edge features. Verify version-specific details (e.g., exact Supabase SSR helper API) against official docs at build time.

---

## Recommended Architecture

### High-Level Overview

```
+----------------------------------------------------------+
|                     Vercel (Edge/Node)                     |
|  +------------------------------------------------------+ |
|  |              Next.js App Router                       | |
|  |                                                       | |
|  |  [Root Layout] -- ThemeProvider, Supabase client init | |
|  |       |                                               | |
|  |  [Page Routes]                                        | |
|  |    /           -- Homepage (today's tasks, donut)     | |
|  |    /gantt       -- Gantt chart view                   | |
|  |    /bedrijven   -- Company overview grid              | |
|  |    /bedrijven/[id] -- Company detail page             | |
|  |                                                       | |
|  |  [Server Components] -- Data fetching, initial load   | |
|  |       |                                               | |
|  |  [Client Components] -- Interactivity, mutations      | |
|  |       |                                               | |
|  |  [Shared Hooks] -- useCompanies, useTasks, useTheme   | |
|  +------------------------------------------------------+ |
|                          |                                 |
|                     Supabase Client                        |
+----------------------------------------------------------+
                           |
                    +------+------+
                    |  Supabase   |
                    |  (Postgres) |
                    |             |
                    | companies   |
                    | tasks       |
                    +-------------+
```

### Server vs Client Component Strategy

This is the most critical architectural decision. The pattern for a dashboard with frequent user interaction:

**Server Components for:** Initial page shell, data fetching on navigation, SEO-irrelevant (personal dashboard, so this matters less)

**Client Components for:** Everything interactive -- and in this dashboard, that is almost everything. The Gantt chart, task lists, forms, donut chart, auto-save fields, and the overdue-rolling computation all require client-side state.

**Recommended approach: Thin server layer, fat client layer.**

```
Server Component (page.tsx)     Client Component (page-content.tsx)
+--------------------------+     +--------------------------------+
| - Fetch initial data     | --> | - Receive data as props        |
| - Pass to client as prop |     | - Manage local state           |
| - Handle loading/error   |     | - Handle mutations             |
|   via Suspense           |     | - Compute derived values       |
+--------------------------+     | - Render interactive UI        |
                                 +--------------------------------+
```

**Confidence:** HIGH -- this is the standard pattern documented in Next.js App Router guides for interactive dashboards.

---

## Component Boundaries

### Layer 1: App Shell

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `app/layout.tsx` | Root HTML, font loading, ThemeProvider wrapper | All pages (children) |
| `ThemeProvider` | Dark/light mode via `next-themes` | localStorage, all themed components |
| `components/navigation.tsx` | Sidebar or top nav, active page indication | Next.js `<Link>`, `usePathname()` |

### Layer 2: Page Routes

| Route | Server Component | Client Component | Data Needs |
|-------|-----------------|-------------------|------------|
| `/` | `app/page.tsx` | `components/homepage/homepage-content.tsx` | Today's tasks, all companies (for donut) |
| `/gantt` | `app/gantt/page.tsx` | `components/gantt/gantt-content.tsx` | All companies with tasks, date ranges |
| `/bedrijven` | `app/bedrijven/page.tsx` | `components/companies/company-grid.tsx` | All companies (summary data) |
| `/bedrijven/[id]` | `app/bedrijven/[id]/page.tsx` | `components/companies/company-detail.tsx` | Single company with tasks |

### Layer 3: Feature Components

| Component | Responsibility | Depends On |
|-----------|---------------|------------|
| `TaskList` | Sorted task list with overdue badges | Task data, overdue-rolling logic |
| `DonutChart` | Progress visualization | Company/task completion stats |
| `GanttChart` | Timeline with company bars + task markers | Companies, tasks, date range state |
| `GanttRow` | Single company row: warmup bar + task dots | Company data, tasks for that company |
| `TaskOverlay` | Slide-out or modal for task create/edit/complete | Task CRUD mutations, company context |
| `CompanyOverlay` | Slide-out for quick company info from Gantt | Company data |
| `CompanyCard` | Grid card on overview page | Company summary data |
| `CompanyForm` | Auto-save fields on detail page | Company data, save mutation |
| `DateHeader` | Dutch-formatted date display | date-fns with nl locale |
| `DelayBadge` | Shows overdue days (-1, -2, etc.) | Computed from original_deadline vs today |

### Layer 4: Shared Infrastructure

| Module | Responsibility | Used By |
|--------|---------------|---------|
| `lib/supabase/client.ts` | Browser Supabase client (singleton) | All client components doing mutations |
| `lib/supabase/server.ts` | Server Supabase client (per-request) | Server components for initial data fetch |
| `lib/dates.ts` | Timezone-aware date utilities | All date display/computation |
| `lib/overdue.ts` | Overdue-rolling computation logic | Homepage task list, Gantt task markers |
| `hooks/use-companies.ts` | Company data fetching + mutations | Company-related components |
| `hooks/use-tasks.ts` | Task data fetching + mutations | Task-related components |
| `types/database.ts` | TypeScript types matching Supabase schema | Everything |

---

## Data Flow

### Pattern: Fetch on Server, Interact on Client

```
1. User navigates to /gantt
2. app/gantt/page.tsx (Server Component):
   - Creates server Supabase client
   - Fetches companies + tasks
   - Passes data as props to <GanttContent />

3. GanttContent (Client Component):
   - Receives initial data via props
   - Stores in local state (useState)
   - Renders Gantt chart
   - User interactions mutate via browser Supabase client
   - On successful mutation: update local state optimistically
```

### Mutation Pattern: Optimistic Update with Auto-Save

```
User blurs a field (company detail page):
  |
  v
1. Update local state immediately (optimistic)
2. Show save indicator: "Opslaan..."
3. Call supabase.from('companies').update({...}).eq('id', id)
4. On success: Show "Opgeslagen" indicator, fade after 2s
5. On error: Revert local state, show error toast
```

**Why optimistic:** Single-user app, mutations rarely fail. Immediate feedback is more important than consistency guarantees here.

### Mutation Pattern: Task CRUD from Gantt

```
User clicks "+ Nieuwe taak" on company row:
  |
  v
1. Open TaskOverlay (sheet/dialog) with company pre-selected
2. User fills in task details
3. On save:
   a. Insert task via Supabase
   b. On success: Add task to local Gantt state, close overlay
   c. Task marker appears on Gantt immediately
4. On error: Show error in overlay, keep open
```

### Data Flow: Overdue Rolling (Client-Side Computed)

```
Raw task from DB:
  { id: 1, deadline: "2026-02-01", title: "DNS instellen" }

Compute at render time (lib/overdue.ts):
  const today = startOfDay(new Date()) // in Europe/Amsterdam
  const originalDeadline = parseISO(task.deadline)
  const effectiveDeadline = max(originalDeadline, today)
  const delayDays = differenceInDays(today, originalDeadline)
  // delayDays > 0 means overdue

Displayed task:
  { ...task, effectiveDeadline: "2026-02-07", delayDays: 6, isOverdue: true }
```

**Key principle:** The database stores the original deadline. The UI computes and displays the effective (rolled) deadline. No database mutations for overdue rolling.

### Data Flow: Gantt Chart Rendering

```
Companies + Tasks (from server fetch)
  |
  v
Sort companies (alphabetical or by warmup_start_date)
  |
  v
For each company:
  |-- Compute bar position: x = warmup_start_date, width = go_live_date - warmup_start_date
  |-- Compute task marker positions: x = task.effective_deadline
  |-- Compute bar color: based on status (warmup = amber, live = green, completed = gray)
  |
  v
Render timeline grid (date headers, today line)
  + Company rows (bar + task dots)
  |
  v
Click handlers:
  - Click bar -> open CompanyOverlay
  - Click task dot -> open TaskOverlay
  - Click "+ Nieuwe taak" -> open TaskOverlay (create mode)
```

---

## File Organization

```
nextwave-dashboard/
|-- app/
|   |-- layout.tsx              # Root layout: html, body, ThemeProvider, fonts
|   |-- page.tsx                # Homepage server component
|   |-- globals.css             # Tailwind base + shadcn/ui CSS variables
|   |-- gantt/
|   |   |-- page.tsx            # Gantt server component
|   |-- bedrijven/
|   |   |-- page.tsx            # Company overview server component
|   |   |-- [id]/
|   |       |-- page.tsx        # Company detail server component
|
|-- components/
|   |-- ui/                     # shadcn/ui primitives (auto-generated)
|   |   |-- button.tsx
|   |   |-- card.tsx
|   |   |-- dialog.tsx
|   |   |-- sheet.tsx
|   |   |-- input.tsx
|   |   |-- select.tsx
|   |   |-- badge.tsx
|   |   |-- toast.tsx           # Or sonner
|   |   |-- ...
|   |-- navigation.tsx          # App navigation (sidebar or top)
|   |-- theme-toggle.tsx        # Dark/light mode switch
|   |-- homepage/
|   |   |-- homepage-content.tsx  # Client: task list + donut
|   |   |-- task-list.tsx         # Sorted, overdue-aware task list
|   |   |-- donut-chart.tsx       # Progress donut visualization
|   |   |-- date-header.tsx       # "Vrijdag 7 februari 2026"
|   |-- gantt/
|   |   |-- gantt-content.tsx     # Client: main Gantt orchestrator
|   |   |-- gantt-timeline.tsx    # Date headers, grid lines, today marker
|   |   |-- gantt-row.tsx         # Single company row
|   |   |-- gantt-bar.tsx         # Warmup-to-golive bar
|   |   |-- task-marker.tsx       # Task dot on timeline
|   |   |-- task-overlay.tsx      # Sheet/dialog for task CRUD
|   |   |-- company-overlay.tsx   # Sheet for company quick view
|   |-- companies/
|   |   |-- company-grid.tsx      # Overview grid of company cards
|   |   |-- company-card.tsx      # Single company card
|   |   |-- company-detail.tsx    # Client: full detail page content
|   |   |-- company-form.tsx      # Auto-save form fields
|   |   |-- save-indicator.tsx    # "Opslaan..." / "Opgeslagen"
|   |-- shared/
|       |-- delay-badge.tsx       # Overdue days badge component
|       |-- loading-spinner.tsx   # Loading state
|       |-- confirm-dialog.tsx    # Delete confirmation
|
|-- hooks/
|   |-- use-companies.ts        # Fetch, create, update, delete companies
|   |-- use-tasks.ts            # Fetch, create, update, complete, delete tasks
|   |-- use-auto-save.ts        # Auto-save on blur logic
|   |-- use-gantt-navigation.ts # Timeline scroll, zoom, date range
|
|-- lib/
|   |-- supabase/
|   |   |-- client.ts           # createBrowserClient (singleton for client components)
|   |   |-- server.ts           # createServerClient (per-request for server components)
|   |-- dates.ts                # Europe/Amsterdam date formatting, nl locale
|   |-- overdue.ts              # Overdue-rolling computation
|   |-- constants.ts            # App-wide constants
|   |-- utils.ts                # cn() helper (shadcn/ui convention)
|
|-- types/
|   |-- database.ts             # Supabase-generated types or manual types
|
|-- public/
|   |-- ...                     # Static assets if any
|
|-- .env.local                  # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Confidence:** HIGH -- this structure follows official Next.js App Router conventions and shadcn/ui project conventions.

---

## Supabase Client Patterns

### Browser Client (Client Components)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Use in client components for all mutations and client-side fetches.

### Server Client (Server Components)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
```

Use in server components for initial page data fetches.

### Why Two Clients?

- **No auth** in this app, but the pattern is still correct to follow. The `@supabase/ssr` package handles cookie-based sessions properly for SSR contexts.
- Even without auth, the server client uses the cookies API which is required in the App Router server context.
- The browser client is a singleton that lives in the browser runtime.
- Following the official two-client pattern means adding auth later is trivial (even though it is out of scope).

**Confidence:** HIGH -- this is the official Supabase + Next.js App Router pattern from `@supabase/ssr`. However, verify the exact API surface of `@supabase/ssr` at build time, as the package has gone through iterations.

### Simplified Alternative (Given No Auth)

Since there is no authentication, a simpler alternative is valid:

```typescript
// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const supabase = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

This single client can be used everywhere (server and client components). Without auth there are no cookies to manage. **Recommendation:** Start with the simple single-client approach. The `@supabase/ssr` two-client pattern adds complexity that is only needed for auth-aware SSR. Since this is a personal dashboard with no auth, a single `@supabase/supabase-js` client is sufficient and simpler.

**Important caveat:** With the simple approach, server components still work -- they just use the anon key directly without cookie context. Supabase Row Level Security (RLS) would need to be disabled or have permissive policies, which is fine for a personal dashboard.

---

## Dark/Light Mode Architecture

### Implementation Pattern

```
next-themes (ThemeProvider)
    |
    v
Provides: theme class on <html> element ("dark" or "light")
    |
    v
Tailwind CSS: dark: variant responds to class
    |
    v
shadcn/ui CSS variables: switch between light/dark palettes
    |
    v
localStorage: persists user preference
```

### Setup

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```typescript
// components/theme-provider.tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

```typescript
// components/theme-toggle.tsx
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
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

The `suppressHydrationWarning` on `<html>` is essential to prevent hydration mismatch warnings from `next-themes` injecting the class before React hydrates.

**Confidence:** HIGH -- this is the exact pattern from shadcn/ui official documentation.

---

## Date Handling Architecture

### Core Principles

1. **Store dates as `date` type in Postgres** (not `timestamptz`) -- these are calendar dates (deadlines, warmup start), not moments in time.
2. **Format for display using `date-fns` with `nl` locale** for Dutch formatting.
3. **All "today" computations use Europe/Amsterdam timezone** via `date-fns-tz`.
4. **Weeks start on Monday** -- configure `date-fns` `weekStartsOn: 1`.

### Date Utility Module

```typescript
// lib/dates.ts
import { format, startOfWeek, startOfDay, parseISO, differenceInDays, max } from 'date-fns'
import { nl } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'Europe/Amsterdam'

/** Get "today" in Amsterdam timezone */
export function getToday(): Date {
  return startOfDay(toZonedTime(new Date(), TIMEZONE))
}

/** Format date in Dutch: "Vrijdag 7 februari 2026" */
export function formatDutchDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE d MMMM yyyy', { locale: nl })
}

/** Format short Dutch date: "7 feb" */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMM', { locale: nl })
}

/** Get start of week (Monday) for a given date */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

/** Compute overdue-rolled effective deadline */
export function getEffectiveDeadline(deadline: string): {
  effectiveDate: Date
  originalDate: Date
  delayDays: number
  isOverdue: boolean
} {
  const today = getToday()
  const originalDate = parseISO(deadline)
  const effectiveDate = max([originalDate, today])
  const delayDays = differenceInDays(today, originalDate)
  return {
    effectiveDate,
    originalDate,
    delayDays: Math.max(0, delayDays),
    isOverdue: delayDays > 0,
  }
}
```

### Why `date` not `timestamptz` in Postgres

Deadlines and warmup dates are **calendar dates** ("February 10th"), not precise moments in time. Using `date` type:
- Avoids timezone conversion issues at the database layer
- Returns "2026-02-10" as a string, which `parseISO` handles cleanly
- No midnight-boundary bugs from timezone offsets

### Why `date-fns` over `dayjs`

- Tree-shakeable (only import what you use)
- First-class TypeScript support
- `date-fns-tz` for timezone-aware operations
- Larger ecosystem, more patterns documented
- Immutable by design (no mutation bugs)
- The `nl` locale is well-supported

**Confidence:** HIGH for the pattern. MEDIUM for the exact `date-fns-tz` API (`toZonedTime` vs older `utcToZonedTime`) -- verify at build time as `date-fns-tz` v3 changed the API.

---

## Gantt Chart Implementation

### Build Custom vs Use Library

**Recommendation: Build custom.** Here is why:

| Factor | Custom | Library (e.g., gantt-task-react, frappe-gantt) |
|--------|--------|----------------------------------------------|
| Styling control | Full Tailwind/shadcn integration | Fight library styles, override everything |
| Dark mode | Native via Tailwind dark: | Requires theme API or CSS hacks |
| Bundle size | Only what you need | Large dependency for features you won't use |
| Feature match | Exact match to requirements | 80% unused features, missing the 20% you need |
| Interactivity | Click handlers, overlays as designed | Callbacks limited to library API |
| Dutch locale | date-fns nl locale, your format | Library's i18n (may not support nl) |

The Gantt in this project is **display-only with click interactions** (no drag-to-resize, no drag-to-reorder). It is essentially a horizontal timeline with colored bars and dots. This is straightforward to build with CSS Grid or positioned `div` elements.

### Gantt Implementation Architecture

```
GanttContent (client component, main orchestrator)
|
|-- State: dateRange, viewMode (week/month), scrollPosition
|-- Computed: visibleDateRange, columnWidth, totalWidth
|
|-- GanttTimeline (header row)
|   |-- Date labels (week numbers, day names, month names)
|   |-- Today marker (vertical red/accent line)
|
|-- GanttRow (one per company, virtualized if 50+ companies)
|   |-- Company label (left column, fixed position)
|   |-- GanttBar (positioned div)
|   |   |-- width: (go_live_date - warmup_start_date) * columnWidth
|   |   |-- left: (warmup_start_date - rangeStart) * columnWidth
|   |   |-- color: based on status
|   |   |-- onClick: open CompanyOverlay
|   |-- TaskMarker[] (positioned dots/icons on the bar or row)
|       |-- left: (effective_deadline - rangeStart) * columnWidth
|       |-- color/icon: based on task status, overdue state
|       |-- onClick: open TaskOverlay
|   |-- "+ Nieuwe taak" button (end of row or on hover)
|
|-- Navigation controls
    |-- Previous/Next period buttons
    |-- Today button (jump to current date)
    |-- Zoom: week view / month view
```

### Positioning Math

```typescript
// Core Gantt positioning logic
const COLUMN_WIDTH = 40 // pixels per day (adjustable for zoom)

function getPosition(date: Date, rangeStart: Date): number {
  return differenceInDays(date, rangeStart) * COLUMN_WIDTH
}

function getBarWidth(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate) * COLUMN_WIDTH
}
```

### CSS Approach

Use a container with `position: relative` for each row. Bars and markers are `position: absolute` with computed `left` and `width`. The timeline scrolls horizontally via `overflow-x: auto` on the container.

```
+-- Fixed column (company names) --+-- Scrollable timeline -----------+
|  Bedrijf A                       |  [====warmup bar====] o  o      |
|  Bedrijf B                       |       [===bar===] o             |
|  Bedrijf C                       |  [==bar==]  o  o  o             |
+----------------------------------+----------------------------------+
```

The fixed left column is achieved with `position: sticky; left: 0` on the company name cells, while the parent scrolls horizontally.

**Confidence:** HIGH for the pattern. This is standard horizontal timeline/Gantt rendering. No novel algorithms needed.

---

## Auto-Save Pattern

### Architecture

```typescript
// hooks/use-auto-save.ts
'use client'
import { useState, useCallback, useRef } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave<T>(
  saveFn: (data: T) => Promise<void>,
  debounceMs: number = 0 // 0 for save-on-blur (no debounce needed)
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<NodeJS.Timeout>()

  const save = useCallback(async (data: T) => {
    setStatus('saving')
    try {
      await saveFn(data)
      setStatus('saved')
      // Reset to idle after showing "Opgeslagen" for 2s
      timeoutRef.current = setTimeout(() => setStatus('idle'), 2000)
    } catch (error) {
      setStatus('error')
      console.error('Auto-save failed:', error)
    }
  }, [saveFn])

  return { save, status }
}
```

### Usage in Company Detail

```typescript
// components/companies/company-form.tsx
function CompanyForm({ company }: { company: Company }) {
  const [formData, setFormData] = useState(company)
  const { save, status } = useAutoSave(async (data: Company) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', data.id)
    if (error) throw error
  })

  const handleBlur = (field: keyof Company) => {
    if (formData[field] !== company[field]) {
      save(formData)
    }
  }

  return (
    <>
      <SaveIndicator status={status} />
      <Input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        onBlur={() => handleBlur('name')}
      />
      {/* ... more fields ... */}
      <Button onClick={() => save(formData)}>Opslaan</Button>
    </>
  )
}
```

**Key decisions:**
- Save triggers on `onBlur`, not on every keystroke (no debounce needed)
- Only saves if value actually changed (compare with original)
- Manual save button as explicit fallback
- Visual indicator shows save status

---

## Patterns to Follow

### Pattern 1: Colocate Client Component with Page

**What:** Each `page.tsx` (server component) has a corresponding `*-content.tsx` (client component) in the `components/` folder.

**When:** Every page that has interactive content (which is all pages in this app).

**Why:** Clean separation of server data-fetching from client interactivity. Server component is thin -- just fetches and passes props.

```typescript
// app/gantt/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import { GanttContent } from '@/components/gantt/gantt-content'

export default async function GanttPage() {
  const supabase = await createClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('*, tasks(*)')
    .order('name')

  return <GanttContent companies={companies ?? []} />
}
```

### Pattern 2: Type-Safe Supabase Queries

**What:** Generate TypeScript types from Supabase schema and use them throughout.

**When:** Always.

**Why:** Catches schema mismatches at compile time, provides autocomplete.

```typescript
// types/database.ts
export type Company = {
  id: string
  name: string
  warmup_start_date: string // date as ISO string
  go_live_date: string
  status: 'warmup' | 'live' | 'completed' | 'paused'
  // ... other fields
  created_at: string
}

export type Task = {
  id: string
  company_id: string
  title: string
  deadline: string // date as ISO string
  is_completed: boolean
  created_at: string
}

export type CompanyWithTasks = Company & {
  tasks: Task[]
}
```

Alternatively, use `supabase gen types typescript` to auto-generate from your schema. Recommended once schema is stable.

### Pattern 3: Centralized Date Logic

**What:** All date formatting, timezone conversions, and overdue computations live in `lib/dates.ts` and `lib/overdue.ts`.

**When:** Any time a date is displayed or compared.

**Why:** Prevents timezone bugs from scattered `new Date()` calls. Dutch formatting in one place.

### Pattern 4: Component Composition with shadcn/ui

**What:** Build feature components by composing shadcn/ui primitives rather than creating custom UI elements.

**When:** Any UI element that has a shadcn/ui equivalent.

**Why:** Consistent styling, dark mode support, accessibility baked in.

```typescript
// Good: Compose from shadcn/ui primitives
<Card>
  <CardHeader>
    <CardTitle>{company.name}</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge variant={company.status === 'live' ? 'default' : 'secondary'}>
      {company.status}
    </Badge>
  </CardContent>
</Card>

// Bad: Custom div soup
<div className="border rounded-lg p-4 shadow">
  <h3 className="font-bold">{company.name}</h3>
  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
    {company.status}
  </span>
</div>
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Server Actions for Everything

**What:** Using Next.js Server Actions for every Supabase mutation.

**Why bad:** For a personal dashboard with no auth, Server Actions add unnecessary round-trips through the server. The browser can talk directly to Supabase via the anon key. Server Actions are valuable when you need server-side validation, auth context, or to hide API keys -- none of which apply here.

**Instead:** Use the browser Supabase client directly for mutations. Keep Server Actions for cases where you genuinely need server-side logic (none identified in this project).

### Anti-Pattern 2: Overfetching in Nested Layouts

**What:** Fetching data in `layout.tsx` and passing it down to pages.

**Why bad:** Layouts don't re-render on navigation between child pages. Data fetched in a layout is stale for subsequent navigations. Also, layouts cannot pass props to their `children`.

**Instead:** Fetch data in each `page.tsx` server component. Layouts only handle shell concerns (theme, navigation chrome).

### Anti-Pattern 3: `useEffect` for Initial Data Fetch

**What:** Using `useEffect` + `useState` in client components to fetch data on mount.

**Why bad:** Creates loading waterfalls, flickers, and duplicates what server components do natively. Also makes the app feel like a SPA with loading spinners everywhere.

**Instead:** Fetch in the server component, pass as props to the client component. The client component receives data immediately on first render -- no loading state needed for initial load.

### Anti-Pattern 4: Storing Computed Values in Database

**What:** Writing `effective_deadline` or `delay_days` to the tasks table.

**Why bad:** These values change daily (they depend on "today"). Storing them requires a cron job or trigger to update every day. They also represent display logic, not business data.

**Instead:** Compute at render time in `lib/overdue.ts`. The database stores only the original `deadline`. The UI computes `effective_deadline` and `delay_days` on every render using today's date.

### Anti-Pattern 5: Global State Management (Redux, Zustand)

**What:** Introducing a state management library for this app.

**Why bad:** Three pages, two data entities (companies, tasks), single user. The complexity of a state management library exceeds the complexity of the state being managed. React's built-in `useState` + passing props is sufficient.

**Instead:** Fetch data per-page via server components. Pass to client components as props. Local state for form fields and UI interactions. If a component needs to refetch after a mutation, call `router.refresh()` to re-run the server component, or update local state directly.

### Anti-Pattern 6: Building Gantt with `<canvas>` or `<svg>`

**What:** Using Canvas or SVG for the Gantt chart rendering.

**Why bad:** Loses Tailwind styling, dark mode support, shadcn/ui integration, accessibility, and click handling. Adds complexity for rendering that is fundamentally rectangular divs.

**Instead:** Use HTML `div` elements with CSS positioning (`position: absolute`, computed `left` and `width`). This gives you full Tailwind classes, dark mode via `dark:` variant, and native click/hover events.

---

## Scalability Considerations

This is a personal dashboard. Scalability is not a primary concern, but architecture should not paint into a corner.

| Concern | Current (1-20 companies) | If Grows (50+ companies) | If Grows (200+ companies) |
|---------|-------------------------|--------------------------|---------------------------|
| Gantt rendering | All rows rendered | Still fine, CSS is fast | Consider virtualization (react-window) |
| Data fetching | Fetch all on page load | Still fine (<100KB) | Paginate or filter by status |
| Task list | Render all today's tasks | Still fine | Group by company, collapse sections |
| Supabase queries | Simple selects | Add indexes on deadline, company_id | Still fine for this scale |
| Bundle size | No concern | No concern | Code-split Gantt chart if needed |

**Recommendation:** Do not pre-optimize. The architecture supports growth without rewrites. Add virtualization or pagination only if performance is measurably impacted.

---

## Database Schema (Architecture Perspective)

```sql
-- companies table
create table companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  warmup_start_date date,
  go_live_date date,
  status text default 'warmup' check (status in ('warmup', 'live', 'completed', 'paused')),
  -- Additional fields for company detail page:
  contact_person text,
  email text,
  phone text,
  domains text,           -- or text[] for multiple domains
  notes text,
  mailbox_count integer,
  emails_per_day integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id) on delete cascade not null,
  title text not null,
  deadline date not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Index for common queries
create index idx_tasks_company_id on tasks(company_id);
create index idx_tasks_deadline on tasks(deadline);
create index idx_tasks_incomplete on tasks(is_completed) where is_completed = false;
```

**Key decisions:**
- `on delete cascade` for tasks: deleting a company deletes its tasks (as specified in requirements)
- `date` type (not `timestamptz`) for deadlines and warmup dates: these are calendar dates
- `uuid` primary keys: Supabase convention, works well with client-side inserts
- `status` as text with check constraint: simple, readable, no enum migration hassles
- Partial index on incomplete tasks: speeds up the homepage "today's tasks" query

---

## Suggested Build Order

Based on component dependencies, the recommended build order is:

### Phase 1: Foundation (No UI Yet)

```
1. Next.js project setup + Tailwind + shadcn/ui init
2. Supabase project + schema (companies + tasks tables)
3. lib/supabase/client.ts (browser client)
4. lib/supabase/server.ts (server client -- or skip if using simple client)
5. types/database.ts
6. lib/dates.ts (date utilities)
7. lib/overdue.ts (overdue computation)
8. app/layout.tsx with ThemeProvider
9. globals.css with shadcn/ui CSS variables
```

**Rationale:** Everything else depends on these. No point building UI without data layer and utilities.

### Phase 2: Company Management (Simplest Complete Feature)

```
1. app/bedrijven/page.tsx (server fetch + grid)
2. components/companies/company-grid.tsx
3. components/companies/company-card.tsx
4. app/bedrijven/[id]/page.tsx (server fetch + detail)
5. components/companies/company-detail.tsx
6. components/companies/company-form.tsx + auto-save
7. components/companies/save-indicator.tsx
8. hooks/use-auto-save.ts
```

**Rationale:** Company CRUD is the simplest feature. It validates the Supabase connection, data flow pattern, and auto-save mechanic. No complex computed values. Builds confidence before tackling Gantt.

### Phase 3: Gantt Chart (Most Complex Feature)

```
1. components/gantt/gantt-content.tsx (orchestrator)
2. components/gantt/gantt-timeline.tsx (date headers)
3. components/gantt/gantt-row.tsx + gantt-bar.tsx (company bars)
4. components/gantt/task-marker.tsx (task dots with overdue logic)
5. hooks/use-gantt-navigation.ts (date range, scroll)
6. components/gantt/task-overlay.tsx (task CRUD sheet)
7. components/gantt/company-overlay.tsx (company quick view)
8. app/gantt/page.tsx (server fetch + pass to GanttContent)
```

**Rationale:** Gantt is the most complex feature but depends on company and task data being real. Building it after company management means you have real data to render. Task CRUD is integrated into Gantt (overlays), so the full task lifecycle is implemented here.

### Phase 4: Homepage (Depends on Tasks Existing)

```
1. components/homepage/date-header.tsx (Dutch date)
2. components/homepage/task-list.tsx (sorted, overdue-aware)
3. components/shared/delay-badge.tsx
4. components/homepage/donut-chart.tsx
5. components/homepage/homepage-content.tsx (orchestrator)
6. app/page.tsx (server fetch + pass to HomepageContent)
```

**Rationale:** Homepage shows today's tasks and a donut chart. It needs tasks to exist (created via Gantt in Phase 3). The overdue-rolling logic is already built in Phase 1 (`lib/overdue.ts`), so this phase is primarily UI composition.

### Phase 5: Navigation + Polish

```
1. components/navigation.tsx (sidebar or top nav)
2. components/theme-toggle.tsx
3. Loading states (loading.tsx per route)
4. Error states (error.tsx per route)
5. Confirm dialogs (delete company, delete task)
6. Empty states ("Geen taken vandaag", "Geen bedrijven")
7. Visual polish, responsive tweaks
```

**Rationale:** Navigation can be added anytime (it is just links), but polish comes last. Get functionality working first.

### Dependency Graph

```
Phase 1 (Foundation)
    |
    +---> Phase 2 (Companies) --+
    |                           |
    +---> Phase 3 (Gantt) ------+  (Gantt needs company data to render)
              |
              v
         Phase 4 (Homepage)  (needs tasks from Gantt)
              |
              v
         Phase 5 (Polish)
```

**Note:** Phases 2 and 3 could be built in parallel by different developers, but for a single developer, building Company Management first validates the data flow pattern and provides seed data for Gantt development.

---

## Donut Chart Implementation

### Options

| Option | Pros | Cons |
|--------|------|------|
| **Custom SVG** | Zero dependencies, full styling control, tiny | Manual math for arcs |
| **Recharts** | Popular, declarative API, responsive | Large bundle for one chart |
| **Chart.js (react-chartjs-2)** | Feature-rich | Canvas-based, dark mode harder |
| **shadcn/ui charts** | If available, consistent styling | May not support donut specifically |

**Recommendation: Custom SVG donut.** A donut chart is a single SVG with a few `<circle>` elements using `stroke-dasharray` and `stroke-dashoffset`. For displaying "X of Y tasks completed" or "X of Y companies live", a custom SVG is 20 lines of code with full Tailwind color integration.

```typescript
// Simplified donut concept
<svg viewBox="0 0 36 36" className="w-32 h-32">
  {/* Background circle */}
  <circle cx="18" cy="18" r="15.9" fill="none"
    className="stroke-muted" strokeWidth="3" />
  {/* Progress arc */}
  <circle cx="18" cy="18" r="15.9" fill="none"
    className="stroke-primary" strokeWidth="3"
    strokeDasharray={`${percentage} ${100 - percentage}`}
    strokeDashoffset="25" />
  {/* Center text */}
  <text x="18" y="20" textAnchor="middle"
    className="fill-foreground text-[8px] font-bold">
    {completed}/{total}
  </text>
</svg>
```

**Confidence:** HIGH -- SVG donut charts are a well-known pattern with no library dependency.

---

## Sources and Confidence Summary

| Topic | Confidence | Basis |
|-------|-----------|-------|
| Next.js App Router file structure | HIGH | Stable since Oct 2023, well-documented convention |
| Server vs Client component split | HIGH | Core App Router pattern, extensively documented |
| Supabase client patterns (`@supabase/ssr`) | HIGH (pattern), MEDIUM (exact API) | Pattern is stable; verify exact `@supabase/ssr` imports at build time |
| Dark mode via next-themes + Tailwind | HIGH | shadcn/ui official documentation pattern |
| Date handling with date-fns + nl locale | HIGH (pattern), MEDIUM (date-fns-tz v3 API) | Verify `toZonedTime` vs `utcToZonedTime` naming |
| Custom Gantt chart approach | HIGH | Standard CSS positioning, no novel technique |
| Auto-save on blur pattern | HIGH | Common React pattern |
| Supabase schema design | HIGH | Standard Postgres patterns |
| Build order dependencies | HIGH | Logical dependency analysis |
| Custom SVG donut chart | HIGH | Well-known SVG technique |

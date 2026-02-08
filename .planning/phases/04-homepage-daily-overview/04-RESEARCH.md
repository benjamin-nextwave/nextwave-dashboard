# Phase 4: Homepage & Daily Overview - Research

**Researched:** 2026-02-08
**Domain:** React dashboard page (date formatting, SVG donut chart, task list with sorting/filtering, overlay reuse)
**Confidence:** HIGH

## Summary

Phase 4 builds the homepage at `/` (replacing the current placeholder) to show a daily overview: a Dutch-formatted date header, a progress donut chart, and a sorted task list with overdue badges. The codebase already has nearly all the building blocks: `formatDutchDateCapitalized()` in `dates.ts` for HOME-01, `computeOverdue()` in `overdue.ts` for overdue calculations, `TaskEditDialog` for HOME-07's edit overlay, the `Badge` component for overdue badges, and `useToday()` for reactive date tracking.

The main new work is: (1) a data-fetching function to get all tasks with their company names for today's effective deadline, (2) a pure SVG donut chart component (no external charting library needed -- this is a simple two-segment ratio), (3) a task list component with the specified sort order, and (4) wiring the existing `TaskEditDialog` into the homepage with the same overlay state machine pattern used in `GanttPage`.

**Primary recommendation:** Build with zero new dependencies. Use an SVG `<circle>` with `stroke-dasharray`/`stroke-dashoffset` for the donut, reuse `TaskEditDialog` directly, and fetch tasks with company names via a Supabase join query with client-side filtering for effective deadline.

## Standard Stack

### Core (already installed -- no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| date-fns | ^4.1.0 | Date formatting, Dutch locale | Already used throughout, `formatDutchDateCapitalized` exists |
| date-fns/locale/nl | (bundled) | Dutch day/month names | Already imported in dates.ts |
| @date-fns/tz | ^1.4.1 | Amsterdam timezone handling | Already used in getTodayISO |
| lucide-react | ^0.563.0 | Icons (CircleCheck, Check) | Already used throughout (Trash2, Plus) |
| radix-ui | ^1.4.3 | Dialog primitives | Already used for all overlay dialogs |
| shadcn/ui | ^3.8.4 | Badge, Dialog, Button, Card | Already installed and used |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | ^2.1.1 / ^3.4.0 | Conditional class merging via `cn()` | All component styling |
| class-variance-authority | ^0.7.1 | Badge variants | Overdue badge variant |

### No New Dependencies Needed

| Problem | Why No Library Needed |
|---------|----------------------|
| Donut chart | Simple 2-segment ratio -- raw SVG `<circle>` with `stroke-dasharray` is 30 lines of code |
| Date formatting | `formatDutchDateCapitalized()` already exists in `dates.ts` |
| Task sorting | Plain array `.sort()` with a custom comparator |
| Overdue calculation | `computeOverdue()` already exists in `overdue.ts` |
| Edit overlay | `TaskEditDialog` already exists and follows null-prop pattern |

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    page.tsx                       # Homepage route (replace placeholder)
  components/
    homepage/
      homepage.tsx                 # Client component: data fetch, overlay state machine
      daily-header.tsx             # "Vandaag" + Dutch date display
      progress-donut.tsx           # SVG donut chart component
      today-task-list.tsx          # Filtered/sorted task list
      today-task-row.tsx           # Single task row with company name + overdue badge
  lib/
    homepage.ts                    # Data fetching: getTodayTasks() query
    __tests__/
      homepage.test.ts             # Sort logic unit tests
```

### Pattern 1: Server Route + Client Boundary (established pattern)

**What:** The `page.tsx` is a thin server component that renders a `'use client'` boundary component. This is the exact same pattern used by `/gantt/page.tsx` and `/bedrijven/page.tsx`.

**When to use:** Every page in this app.

**Example:**
```typescript
// src/app/page.tsx
import { Homepage } from '@/components/homepage/homepage'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <main className="p-6">
      <Homepage />
    </main>
  )
}
```

### Pattern 2: Overlay State Machine (established pattern)

**What:** The parent component owns an `OverlayState` discriminated union, renders `TaskEditDialog` with null-prop pattern, and passes callbacks to child components. This is identical to how `GanttPage` works.

**When to use:** Any page that needs the task edit dialog.

**Example:**
```typescript
// In homepage.tsx (mirroring gantt-page.tsx exactly)
type OverlayState =
  | { type: 'none' }
  | { type: 'editTask'; task: Task }

const [overlay, setOverlay] = useState<OverlayState>({ type: 'none' })

// In JSX:
<TaskEditDialog
  task={overlay.type === 'editTask' ? overlay.task : null}
  onClose={() => setOverlay({ type: 'none' })}
  onSaved={refreshData}
/>
```

### Pattern 3: SVG Donut via stroke-dasharray

**What:** A pure SVG circle-based progress ring. Two `<circle>` elements: one for the track (background), one for the filled arc. The filled arc uses `stroke-dasharray` = circumference and `stroke-dashoffset` = circumference * (1 - ratio) to show the progress.

**When to use:** Simple progress/completion ratios with a single metric.

**Example:**
```typescript
// src/components/homepage/progress-donut.tsx
interface ProgressDonutProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
}

export function ProgressDonut({
  completed,
  total,
  size = 120,
  strokeWidth = 10,
}: ProgressDonutProps) {
  const center = size / 2
  const radius = center - strokeWidth
  const circumference = 2 * Math.PI * radius
  const ratio = total > 0 ? completed / total : 0
  const dashOffset = circumference * (1 - ratio)

  // Color: green when all done, red/orange gradient when incomplete
  const strokeColor = ratio >= 1
    ? 'stroke-green-500'
    : ratio >= 0.5
      ? 'stroke-orange-500'
      : 'stroke-red-500'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        {/* Track (background circle) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Center text: "3/7" */}
      <span className="absolute text-lg font-bold">
        {completed}/{total}
      </span>
    </div>
  )
}
```

### Pattern 4: Task List Sorting (requirement HOME-06)

**What:** Multi-criteria sort: urgent first, then most overdue first, then alphabetical by title.

**Example:**
```typescript
// src/lib/homepage.ts (pure function, testable)
import { computeOverdue } from '@/lib/overdue'

export interface TodayTask {
  task: Task
  companyName: string
  overdue: OverdueResult
}

export function sortTodayTasks(tasks: TodayTask[]): TodayTask[] {
  return [...tasks].sort((a, b) => {
    // 1. Urgent first (incomplete urgent tasks above non-urgent)
    if (a.task.is_urgent !== b.task.is_urgent) {
      return a.task.is_urgent ? -1 : 1
    }
    // 2. Most overdue first
    if (a.overdue.daysOverdue !== b.overdue.daysOverdue) {
      return b.overdue.daysOverdue - a.overdue.daysOverdue
    }
    // 3. Alphabetical by title
    return a.task.title.localeCompare(b.task.title, 'nl')
  })
}
```

### Pattern 5: Data Fetching -- Tasks with Company Names

**What:** Supabase query to fetch all tasks joined with company name, then client-side filter for effective deadline = today. This follows the established pattern (e.g., `getCompaniesWithOpenTaskCounts` does client-side filtering to avoid Supabase embedded filter edge cases).

**Example:**
```typescript
// src/lib/homepage.ts
import { supabase } from '@/lib/supabase'
import { computeOverdue } from '@/lib/overdue'
import type { Task } from '@/types/database'

export interface TaskWithCompany extends Task {
  company_name: string
}

export async function getTasksWithCompany(): Promise<TaskWithCompany[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, companies!inner(name)')
    .eq('is_completed', false)

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as unknown as Task & { companies: { name: string } }
    return {
      ...r,
      company_name: r.companies.name,
    } as TaskWithCompany
  })
}

// Filter for tasks whose effective deadline is today
export function filterTodayTasks(
  tasks: TaskWithCompany[],
  today: string
): TodayTask[] {
  return tasks
    .map((t) => ({
      task: t,
      companyName: t.company_name,
      overdue: computeOverdue(t.deadline, today, t.is_completed),
    }))
    .filter((t) => t.overdue.effectiveDeadline === today)
}
```

**Important nuance:** We also need completed tasks that have deadline = today (they show with strikethrough per HOME-05). So the query should NOT filter `is_completed = false` only. Instead, fetch all tasks where `deadline <= today` (to catch overdue) plus tasks where `deadline = today` (including completed ones), then filter client-side.

**Revised approach:**
```typescript
export async function getTodayTasksWithCompany(): Promise<TaskWithCompany[]> {
  // Fetch tasks with deadline <= today (catches overdue) OR deadline = today (catches completed today tasks)
  // Simplest: fetch all non-completed with deadline <= today, plus completed with deadline = today
  const { data, error } = await supabase
    .from('tasks')
    .select('*, companies!inner(name)')
    .or(`deadline.lte.${today},and(deadline.eq.${today},is_completed.eq.true)`)

  // ... but this gets complex. Better: fetch all tasks with deadline <= today, filter client-side.
}
```

**Simplest correct approach:** Fetch ALL tasks with company names (the dataset is small -- this is a single-user dashboard), filter client-side for effective deadline = today. This mirrors the Gantt view's approach of loading all companies with tasks.

### Anti-Patterns to Avoid

- **Do NOT add Recharts/chart library for a single donut:** Adding a 200KB+ charting library for a two-segment circle is wasteful. Raw SVG is simpler and more performant.
- **Do NOT duplicate TaskEditDialog:** The edit overlay must be the same component instance, not a copy. Import from `@/components/gantt/task-edit-dialog`.
- **Do NOT use server-side filtering for effective deadline:** The "effective deadline" concept (overdue tasks rolled to today) is computed by `computeOverdue()` which requires knowing today's date. This is a client-side computation. Attempting to replicate this logic in a Supabase query would be fragile and diverge from the established pattern.
- **Do NOT build completed-task state differently:** Completed tasks with strikethrough should use the same `is_completed` field toggle via `TaskEditDialog`. No separate "mark complete" button on the homepage row.
- **Do NOT use `Date` objects for comparison:** The codebase consistently uses `'yyyy-MM-dd'` string comparison. Follow this pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dutch date formatting | Custom string construction | `formatDutchDateCapitalized()` from `dates.ts` | Already handles locale, capitalization |
| Overdue calculation | Manual date arithmetic | `computeOverdue()` from `overdue.ts` | Tested, handles edge cases (completed tasks, boundary days) |
| Task edit overlay | New dialog component | `TaskEditDialog` from `gantt/task-edit-dialog.tsx` | HOME-07 explicitly requires "same edit overlay as Gantt view" |
| Today's date (reactive) | `new Date()` / manual polling | `useToday()` from `today-provider.tsx` | Handles timezone, tab focus, midnight rollover |
| Conditional CSS classes | String concatenation | `cn()` from `utils.ts` | Established pattern, handles undefined/false values |

**Key insight:** This phase is primarily a composition task. Almost every building block exists. The work is fetching the right data, filtering/sorting it correctly, and composing existing components into a new page layout.

## Common Pitfalls

### Pitfall 1: Forgetting Completed Tasks in Today's List

**What goes wrong:** Filtering only incomplete tasks misses completed tasks whose deadline is today. HOME-05 requires showing completed tasks with strikethrough.
**Why it happens:** The mental model is "tasks I need to do today" but the requirement is "all tasks due today."
**How to avoid:** The filter for "today's tasks" must include: (a) incomplete tasks with effective deadline = today (overdue rolled forward), AND (b) completed tasks with original deadline = today.
**Warning signs:** Completing a task makes it disappear from the list instead of showing with strikethrough.

### Pitfall 2: Sorting Completed vs Incomplete Tasks

**What goes wrong:** The sort order (HOME-06) says "urgent first, then most overdue, then alphabetical" but does not explicitly mention where completed tasks go. If completed tasks are mixed into the urgent/overdue sort, they clutter the top of the list.
**Why it happens:** Completed tasks have `is_urgent = true` or were overdue when completed.
**How to avoid:** Add a primary sort: incomplete tasks above completed tasks. Then apply the HOME-06 sort within each group. This matches user intent -- "what needs attention" should be at the top.
**Warning signs:** A completed urgent task appears above an incomplete overdue task.

### Pitfall 3: Double-counting Overdue Tasks

**What goes wrong:** An overdue task from 3 days ago shows on the homepage (effective deadline = today) but also the task's original deadline is not today. If the filter checks `task.deadline === today`, it misses overdue tasks. If it checks `effectiveDeadline === today`, it might duplicate with completed-today tasks.
**Why it happens:** Two different deadline concepts: original vs effective.
**How to avoid:** Use `computeOverdue()` consistently. The filter should be: `effectiveDeadline === today` for incomplete tasks, and `task.deadline === today` for completed tasks.
**Warning signs:** Tasks appearing on wrong days or missing from the list.

### Pitfall 4: SVG Donut Rotation

**What goes wrong:** The SVG `stroke-dashoffset` progress starts at 3 o'clock (right side) by default, not 12 o'clock (top).
**Why it happens:** SVG arcs start at 0 degrees which is the right side in SVG coordinate space.
**How to avoid:** Apply `className="-rotate-90"` (or `transform="rotate(-90 center center)"`) to the SVG element.
**Warning signs:** The progress arc starts from the right instead of the top.

### Pitfall 5: Overdue Badge Format

**What goes wrong:** The overdue badge shows the wrong format. HOME-04 specifies "-1, -2 etc." format (negative numbers), not "1d te laat" as used in `CompanyTasksDialog`.
**Why it happens:** Copying the existing Gantt pattern without checking the homepage spec.
**How to avoid:** Use `Badge` with `variant="destructive"` showing `-${daysOverdue}` text, matching the format in `TaskMarker` (`-{overdue.daysOverdue}`).
**Warning signs:** Badge shows "2d te laat" instead of "-2".

### Pitfall 6: Data Freshness After Edit

**What goes wrong:** User edits a task via the overlay (marks complete, changes title), but the homepage list does not update.
**Why it happens:** Not calling `refreshData` after the overlay closes, or not re-filtering after refresh.
**How to avoid:** Follow the `GanttPage` pattern exactly: `onSaved={refreshData}` where `refreshData` re-fetches all data from Supabase.
**Warning signs:** Stale data after closing the edit dialog.

## Code Examples

### Dutch Date Header (HOME-01)

```typescript
// Already exists in dates.ts -- direct usage
import { formatDutchDateCapitalized } from '@/lib/dates'
import { useToday } from '@/lib/today-provider'

export function DailyHeader() {
  const today = useToday()
  return (
    <div>
      <h1 className="text-2xl font-bold">Vandaag</h1>
      <p className="text-muted-foreground">
        {formatDutchDateCapitalized(today)}
      </p>
    </div>
  )
}
```

### Task Row with Overdue Badge (HOME-04, HOME-05)

```typescript
import { CircleCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TodayTask } from '@/lib/homepage'

interface TodayTaskRowProps {
  item: TodayTask
  onClick: () => void
}

export function TodayTaskRow({ item, onClick }: TodayTaskRowProps) {
  const { task, companyName, overdue } = item

  return (
    <button
      type="button"
      className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors flex items-center justify-between"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {task.is_completed && (
          <CircleCheck className="size-5 text-green-500 shrink-0" />
        )}
        <div>
          <p className="text-xs text-muted-foreground">{companyName}</p>
          <p className={cn(
            'text-sm',
            task.is_completed && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
        </div>
      </div>
      {overdue.isOverdue && (
        <Badge variant="destructive">-{overdue.daysOverdue}</Badge>
      )}
    </button>
  )
}
```

### Complete Sort Function (HOME-06)

```typescript
export function sortTodayTasks(tasks: TodayTask[]): TodayTask[] {
  return [...tasks].sort((a, b) => {
    // 0. Incomplete above completed
    if (a.task.is_completed !== b.task.is_completed) {
      return a.task.is_completed ? 1 : -1
    }
    // 1. Urgent first
    if (a.task.is_urgent !== b.task.is_urgent) {
      return a.task.is_urgent ? -1 : 1
    }
    // 2. Most overdue first (higher daysOverdue = higher priority)
    if (a.overdue.daysOverdue !== b.overdue.daysOverdue) {
      return b.overdue.daysOverdue - a.overdue.daysOverdue
    }
    // 3. Alphabetical by task title
    return a.task.title.localeCompare(b.task.title, 'nl')
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts for all charts | SVG primitives for simple gauges, Recharts for complex charts | Ongoing consensus | No new dependency for a 2-segment donut |
| Separate date providers | Shared `TodayProvider` context | Phase 1 (this project) | All pages share reactive `today` via `useToday()` |
| Server-side computed effective deadlines | Client-side `computeOverdue()` | Phase 3 (this project) | Consistent behavior, tested pure function |

**Deprecated/outdated:**
- N/A -- this phase builds on stable, established patterns from earlier phases.

## Open Questions

1. **Completed task inclusion in the donut chart**
   - What we know: HOME-02 says "completed/total task ratio." The numerator is completed tasks and denominator is total tasks.
   - What's unclear: Does "total" mean all tasks for today (including completed), or all tasks for the company overall? Given context (daily overview), it almost certainly means today's tasks only.
   - Recommendation: `completed` = count of today's tasks where `is_completed === true`. `total` = count of all today's tasks (completed + incomplete). This gives a "today's progress" metric.

2. **Data fetch strategy: all tasks vs filtered query**
   - What we know: The dataset is small (single-user dashboard, ~10-50 companies, ~5-10 tasks each). The Gantt view fetches ALL companies with ALL tasks.
   - What's unclear: Whether to reuse `getCompaniesWithTasks()` or write a new query.
   - Recommendation: Write a dedicated `getTodayTasksWithCompany()` that fetches tasks with `deadline <= today` joined with company name. This avoids loading unnecessary future tasks and company details, but is still a simple query. If the dataset ever grows, this is the right boundary.

3. **Where completed tasks sort in the list**
   - What we know: HOME-06 says "urgent first, then most overdue first, then alphabetical." It does not mention completed tasks.
   - What's unclear: Whether completed tasks should be at the bottom or mixed in.
   - Recommendation: Put completed tasks at the bottom of the list (after all incomplete tasks). Within completed tasks, sort alphabetically. This is the most intuitive UX for a "what needs attention today" view.

## Sources

### Primary (HIGH confidence)

- **Codebase analysis** -- Direct reading of all referenced files:
  - `src/lib/dates.ts` -- `formatDutchDateCapitalized()` already exists (line 24-27)
  - `src/lib/overdue.ts` -- `computeOverdue()` with `OverdueResult` type
  - `src/lib/today-provider.tsx` -- `useToday()` hook for reactive today
  - `src/components/gantt/gantt-page.tsx` -- Overlay state machine pattern (lines 15-19, 57-71, 94-109)
  - `src/components/gantt/task-edit-dialog.tsx` -- Null-prop dialog pattern
  - `src/components/gantt/task-marker.tsx` -- Overdue badge format (`-{daysOverdue}`)
  - `src/components/gantt/company-tasks-dialog.tsx` -- Task list rendering pattern
  - `src/components/ui/badge.tsx` -- Badge component with `destructive` variant
  - `src/types/database.ts` -- `Task`, `CompanyWithTasks` types
  - `src/lib/companies.ts` -- `getCompaniesWithTasks()` query pattern
  - `src/lib/tasks.ts` -- `updateTask()`, `deleteTask()` functions

### Secondary (MEDIUM confidence)

- [SVG circular progress component (LogRocket)](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/) -- SVG circle `stroke-dasharray` technique
- [shadcn/ui chart docs](https://ui.shadcn.com/docs/components/radix/chart) -- Confirmed Recharts dependency; justified avoiding it for simple donut
- [Lucide icon reference](https://lucide.dev/icons/circle-check) -- `CircleCheck` icon name confirmed

### Tertiary (LOW confidence)

- None -- all findings verified against codebase or official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed, no new packages needed
- Architecture: HIGH -- directly mirrors established patterns in GanttPage, CompanyTasksDialog
- Pitfalls: HIGH -- derived from analyzing actual codebase patterns and requirement edge cases
- Code examples: HIGH -- based on actual codebase code, tested patterns

**Research date:** 2026-02-08
**Valid until:** 2026-03-10 (stable -- all building blocks are internal to the project)

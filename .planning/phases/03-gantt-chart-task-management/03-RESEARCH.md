# Phase 3: Gantt Chart & Task Management - Research

**Researched:** 2026-02-08
**Domain:** Custom Gantt chart UI, horizontal timeline grid, task CRUD overlays, date-fns timeline generation, CSS sticky sidebar with horizontal scroll
**Confidence:** HIGH

## Summary

Phase 3 builds a custom Gantt chart that shows company warmup timelines as horizontal bars across a scrollable day-column grid, with task markers at deadline positions. The core technical challenge is building a split-pane layout: a fixed left sidebar with company names and a horizontally scrollable right area with day columns, warmup bars, and task markers. This is entirely achievable with CSS (`position: sticky`, `overflow-x: auto`, CSS Grid) and does not require any third-party Gantt or charting library.

The data requirements are straightforward: fetch all companies with their tasks in a single Supabase query using the existing foreign key relationship, then render the timeline client-side. Date arithmetic uses `date-fns` functions already installed (`eachDayOfInterval`, `startOfWeek`, `addWeeks`, `subWeeks`, `differenceInCalendarDays`, `parseISO`, `format`). The task edit/create overlays reuse the existing `Dialog` component pattern from Phase 2 with `Checkbox` and `Switch` components for completion and urgency toggles.

The Gantt page is a client component (needs interactive scroll, state for current date window, overlays). The `useToday()` hook from Phase 1 provides today's date string for highlighting the current column and computing overdue status. All task CRUD operations extend the existing `src/lib/tasks.ts` data access layer.

**Primary recommendation:** Build a custom Gantt chart using CSS Grid with `position: sticky` for the sidebar, `overflow-x: auto` for horizontal scrolling, `date-fns` `eachDayOfInterval` for generating day columns, and `Dialog` overlays for task editing/creation. No third-party Gantt library needed.

## Standard Stack

### Core (already installed from Phase 1 & 2)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | 16.1.6 | App Router, `/gantt` route (placeholder exists) | Already installed. Page placeholder at `src/app/gantt/page.tsx`. |
| **React** | 19.2.3 | Client components, state for timeline navigation, overlay control | Already installed. |
| **@supabase/supabase-js** | ^2.95 | Fetch companies+tasks, CRUD task operations | Already installed. Typed singleton client. |
| **date-fns** | ^4.1 | `eachDayOfInterval`, `startOfWeek`, `addWeeks`, `subWeeks`, `differenceInCalendarDays`, `parseISO`, `format`, `addDays` | Already installed. All functions verified available. |
| **@date-fns/tz** | ^1.4 | `TZDate.tz` for Amsterdam timezone (via `useToday`) | Already installed. Used indirectly through `dates.ts` utilities. |
| **shadcn/ui** | CLI ^3.8 | Dialog (task edit/create), Checkbox (completion), Switch (urgency), Badge (overdue), Button, Input, Label, Textarea | CLI installed. Most components already exist. |
| **Tailwind CSS** | ^4 | All Gantt layout styling, colors, responsive | Already installed with OKLCH Neutral theme. |
| **lucide-react** | ^0.563 | Icons: ChevronLeft, ChevronRight, Plus, Check, X, Trash2, AlertTriangle | Already installed. |

### shadcn/ui Components to Add

| Component | Install Command | Purpose |
|-----------|----------------|---------|
| **checkbox** | `npx shadcn@latest add checkbox` | Task completion toggle in edit overlay |
| **switch** | `npx shadcn@latest add switch` | Urgency toggle in task edit overlay |
| **popover** | `npx shadcn@latest add popover` | Task marker click overlay (alternative to Dialog for inline editing) |
| **tooltip** | `npx shadcn@latest add tooltip` | Hover info on task markers, overdue badges |
| **scroll-area** | `npx shadcn@latest add scroll-area` | Styled horizontal scroll for timeline (optional, native scroll also works) |

**Note on Popover vs Dialog for task editing:** The requirements say "click task marker opens edit overlay." A `Dialog` (modal) is the better choice because:
1. It centers the user's focus on the edit form
2. It works consistently regardless of where the marker is on screen
3. The overlay contains multiple fields (title, urgency, notes, completion, delete) which need space
4. A Popover positioned near a small marker would be cramped and could overflow the viewport

Use `Dialog` for both task edit (GANT-05) and company task list (GANT-06) overlays. Use `Popover` only if a lightweight alternative is needed for simple interactions.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom CSS Grid Gantt | react-gantt-chart, gantt-task-react | Third-party libraries add bundle size, styling conflicts with Tailwind/shadcn, and are less flexible for this specific design. The requirements are simple enough for a custom build. |
| CSS `position: sticky` sidebar | Two separate scrollable divs with synced scroll | Sticky is simpler, more performant, and natively supported. Synced scroll requires JS event listeners and can jank. |
| Native `overflow-x: auto` | shadcn/ui ScrollArea with horizontal orientation | ScrollArea adds styled scrollbars but native scroll works fine. ScrollArea can be added for polish but is not required. |
| Dialog for task edit | Sheet (slide-over panel) | Sheet is an option but Dialog is more appropriate for focused edit actions. Sheet is better for secondary navigation. |
| Direct Supabase calls in components | React Query / SWR | Overkill for this app. The Gantt page loads all data once on mount, with manual refresh after mutations. No need for cache invalidation or stale-while-revalidate. |

**Installation:**
```bash
npx shadcn@latest add checkbox switch popover tooltip scroll-area
```

## Architecture Patterns

### Recommended Project Structure (Phase 3 additions)

```
src/
├── app/
│   └── gantt/
│       └── page.tsx                      # Server component wrapper -> GanttPage client component
├── components/
│   ├── ui/                              # shadcn/ui (auto-generated)
│   │   ├── checkbox.tsx                 # NEW: task completion
│   │   ├── switch.tsx                   # NEW: urgency toggle
│   │   ├── popover.tsx                  # NEW: optional for tooltips
│   │   ├── tooltip.tsx                  # NEW: hover info
│   │   └── scroll-area.tsx             # NEW: styled scroll (optional)
│   └── gantt/
│       ├── gantt-page.tsx              # Main client component: data fetch, state, layout
│       ├── gantt-header.tsx            # Title, navigation arrows, "Vandaag" button
│       ├── gantt-timeline.tsx          # The scrollable grid: sidebar + day columns
│       ├── gantt-company-row.tsx       # Single company row: warmup bar + task markers
│       ├── gantt-day-header.tsx        # Day column header with date labels
│       ├── task-marker.tsx             # Colored circle/dot for a task on the timeline
│       ├── task-edit-dialog.tsx        # Edit overlay: title, urgency, notes, complete, delete
│       ├── task-create-dialog.tsx      # Create overlay: title + deadline, company pre-selected
│       └── company-tasks-dialog.tsx    # Company click overlay: list of all tasks for company
├── lib/
│   ├── tasks.ts                        # EXTEND: add updateTask, deleteTask, createTask, getAllTasks
│   ├── gantt-utils.ts                  # NEW: timeline date range generation, column position calc
│   ├── overdue.ts                      # EXISTING: computeOverdue (reuse as-is)
│   └── dates.ts                        # EXISTING: getWeekStart, format functions (reuse as-is)
└── types/
    └── database.ts                     # EXISTING: Company, Task, CompanyWithTasks types
```

### Pattern 1: CSS Grid + Sticky Sidebar Gantt Layout

**What:** A single scrollable container using CSS Grid where the first column (company names) is sticky and the remaining columns (day grid) scroll horizontally.
**When to use:** The main Gantt timeline view (GANT-01).
**Why:** This is the standard approach for data grids with frozen columns. No JavaScript syncing needed.

```typescript
// gantt-timeline.tsx - Layout structure
// Source: CSS position:sticky specification + CSS Grid

<div className="overflow-x-auto border rounded-lg">
  <div
    className="grid"
    style={{
      gridTemplateColumns: `200px repeat(${days.length}, 48px)`,
      // 200px = sidebar width, 48px = day column width
    }}
  >
    {/* Header row: empty cell + day headers */}
    <div className="sticky left-0 z-20 bg-background border-b border-r p-2 font-medium">
      Bedrijf
    </div>
    {days.map((day) => (
      <GanttDayHeader key={day} date={day} isToday={day === today} />
    ))}

    {/* Company rows */}
    {companies.map((company) => (
      <GanttCompanyRow
        key={company.id}
        company={company}
        days={days}
        today={today}
        rangeStart={days[0]}
      />
    ))}
  </div>
</div>
```

**Key CSS details:**
- The sidebar column uses `position: sticky; left: 0; z-index: 20` to stay fixed while the grid scrolls
- Each day column has a fixed width (e.g., 48px) to ensure consistent spacing
- The outer container has `overflow-x: auto` for horizontal scrolling
- Today's column gets a highlighted background (e.g., `bg-blue-50 dark:bg-blue-950/20`)

### Pattern 2: Date Range Generation for Timeline

**What:** Generate an array of ISO date strings for the visible 14-day window using `date-fns`.
**When to use:** Computing which day columns to render and navigating between weeks.

```typescript
// gantt-utils.ts
import { eachDayOfInterval, startOfWeek, addDays, addWeeks, subWeeks, format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale/nl'

export function getTimelineRange(anchorDate: string, dayCount: number = 14): string[] {
  const anchor = parseISO(anchorDate)
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = addDays(weekStart, dayCount - 1)

  return eachDayOfInterval({ start: weekStart, end }).map(
    (d) => format(d, 'yyyy-MM-dd')
  )
}

export function getColumnIndex(taskDeadline: string, rangeStart: string): number {
  // Both are 'yyyy-MM-dd' strings; use string-to-date for differenceInCalendarDays
  return differenceInCalendarDays(parseISO(taskDeadline), parseISO(rangeStart))
}

export function formatDayHeader(dateStr: string): { dayName: string; dayNum: string; monthName: string } {
  const d = parseISO(dateStr)
  return {
    dayName: format(d, 'EEE', { locale: nl }),   // "ma", "di", etc.
    dayNum: format(d, 'd'),                        // "8"
    monthName: format(d, 'MMM', { locale: nl }),   // "feb."
  }
}
```

**Verified:** `eachDayOfInterval` with a 14-day range returns exactly 14 Date objects. Dutch locale abbreviations: "maa", "din", "woe", "don", "vri", "zat", "zon".

### Pattern 3: Company Row with Warmup Bar and Task Markers

**What:** Each company row contains a sticky sidebar cell (name + add task button) and day cells. The warmup bar spans across the appropriate columns as an absolutely positioned element, and task markers are placed at their deadline column.
**When to use:** Rendering each company in the Gantt grid (GANT-02, GANT-03).

```typescript
// gantt-company-row.tsx - Key rendering logic
// The warmup bar is rendered as a positioned div spanning the correct columns

function GanttCompanyRow({ company, days, today, rangeStart }: Props) {
  const tasks = company.tasks
  const barStart = company.warmup_start_date
  const barEnd = company.go_live_date

  return (
    <>
      {/* Sticky sidebar cell */}
      <div className="sticky left-0 z-10 bg-background border-b border-r p-2 flex items-center justify-between">
        <button
          className="text-sm font-medium hover:underline truncate"
          onClick={() => onCompanyClick(company)}
        >
          {company.name}
        </button>
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onAddTask(company.id)}
        >
          <Plus className="size-3" />
        </button>
      </div>

      {/* Day cells */}
      {days.map((day) => {
        const isInWarmup = barStart && barEnd && day >= barStart && day <= barEnd
        const isToday = day === today
        const dayTasks = tasks.filter((t) => {
          const overdue = computeOverdue(t.deadline, today, t.is_completed)
          return overdue.effectiveDeadline === day
        })

        return (
          <div
            key={day}
            className={cn(
              'relative border-b border-r h-12 flex items-center justify-center',
              isToday && 'bg-blue-50 dark:bg-blue-950/20',
              isInWarmup && 'bg-blue-100/40 dark:bg-blue-900/20'
            )}
          >
            {dayTasks.map((task) => (
              <TaskMarker key={task.id} task={task} today={today} onClick={onTaskClick} />
            ))}
          </div>
        )
      })}
    </>
  )
}
```

**Important note on overdue tasks:** Overdue tasks should appear at today's column (their effective deadline), not their original deadline. Use `computeOverdue()` from `src/lib/overdue.ts` to get the `effectiveDeadline` and place the marker there.

### Pattern 4: Task Marker with Status Colors

**What:** A small colored circle/dot rendered at the task's deadline position, with optional overdue badge.
**When to use:** For each task within a company row (GANT-03, GANT-04, UIST-04, UIST-05).

```typescript
// task-marker.tsx
function TaskMarker({ task, today, onClick }: TaskMarkerProps) {
  const overdue = computeOverdue(task.deadline, today, task.is_completed)

  return (
    <button
      onClick={() => onClick(task)}
      className="relative group"
      title={task.title}
    >
      {/* Main marker dot */}
      <div
        className={cn(
          'size-4 rounded-full border-2 transition-transform group-hover:scale-125',
          task.is_completed
            ? 'bg-green-500 border-green-600'
            : task.is_urgent
              ? 'bg-orange-500 border-orange-600'
              : 'bg-red-500 border-red-600'
        )}
      />

      {/* Overdue badge */}
      {overdue.isOverdue && (
        <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-bold px-1 rounded-full leading-tight">
          -{overdue.daysOverdue}
        </span>
      )}
    </button>
  )
}
```

**Color mapping (from UIST-04, UIST-05):**
- Red (`bg-red-500`): pending, not urgent
- Green (`bg-green-500`): completed
- Orange (`bg-orange-500`): urgent, not completed
- Overdue badge: red background, white text, pill shape

### Pattern 5: Timeline Navigation State

**What:** The Gantt page maintains an `anchorDate` state that determines which 14-day window is shown. Arrow buttons shift by 7 days, "Vandaag" resets to today.
**When to use:** Timeline navigation (GANT-08, GANT-09).

```typescript
// Inside gantt-page.tsx
const today = useToday()  // 'yyyy-MM-dd' string from TodayProvider
const [anchorDate, setAnchorDate] = useState(today)

const days = useMemo(
  () => getTimelineRange(anchorDate, 14),
  [anchorDate]
)

function navigateWeek(direction: 'prev' | 'next') {
  setAnchorDate((prev) => {
    const current = parseISO(prev)
    const shifted = direction === 'next' ? addWeeks(current, 1) : subWeeks(current, 1)
    return format(shifted, 'yyyy-MM-dd')
  })
}

function goToToday() {
  setAnchorDate(today)
}
```

### Pattern 6: Task Edit Dialog

**What:** A `Dialog` overlay for editing a task with: editable title, urgency toggle, notes textarea, completion checkbox, save/cancel buttons, and delete with confirmation.
**When to use:** When clicking a task marker (GANT-05).

```typescript
// task-edit-dialog.tsx
<Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Taak bewerken</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Titel</Label>
        <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="task-completed"
          checked={isCompleted}
          onCheckedChange={(checked) => setIsCompleted(checked === true)}
        />
        <Label htmlFor="task-completed">Afgerond</Label>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="task-urgent"
          checked={isUrgent}
          onCheckedChange={setIsUrgent}
        />
        <Label htmlFor="task-urgent">Urgent</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-notes">Notities</Label>
        <Textarea id="task-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </div>

    <DialogFooter>
      <Button variant="destructive" onClick={handleDelete}>
        <Trash2 className="size-4" /> Verwijderen
      </Button>
      <div className="flex-1" />
      <DialogClose asChild>
        <Button variant="outline">Annuleren</Button>
      </DialogClose>
      <Button onClick={handleSave}>Opslaan</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Pattern 7: Supabase Data Fetch for Gantt

**What:** A single query to fetch all companies with their tasks, suitable for rendering the entire Gantt chart.
**When to use:** On Gantt page mount and after any task mutation.

```typescript
// lib/tasks.ts (or lib/gantt-data.ts) - extend existing module
export async function getCompaniesWithTasks(): Promise<CompanyWithTasks[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*, tasks(*)')
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? []).map((company) => ({
    ...company,
    tasks: (company.tasks ?? []).sort(
      (a: Task, b: Task) => a.deadline.localeCompare(b.deadline)
    ),
  })) as CompanyWithTasks[]
}
```

**Important:** The `CompanyWithTasks` type already exists in `src/types/database.ts`. The query uses `tasks(*)` to embed all task rows. Tasks are sorted client-side by deadline for consistency.

### Anti-Patterns to Avoid

- **Using a third-party Gantt library:** Libraries like `gantt-task-react` or `react-gantt-chart` are designed for project management Gantt charts with dependency arrows, drag-and-drop, and resource allocation. This project's Gantt is a simple timeline visualization. A custom build is simpler, lighter, and easier to style with Tailwind.

- **Rendering warmup bars with absolute positioning across the full grid:** Don't try to position a single `<div>` spanning the entire warmup period with `position: absolute` and calculated `left`/`width`. Instead, render each day cell independently and conditionally apply the warmup background color. This is simpler and avoids measurement/resize issues.

- **Syncing two separate scroll containers:** Don't create a fixed sidebar and a separate scrollable timeline area, then try to sync their vertical scroll positions with JavaScript. Use a single container with CSS `position: sticky` for the sidebar column.

- **Fetching tasks separately per company:** Don't make N queries (one per company). Fetch all companies with tasks in one Supabase query using `select('*, tasks(*)')`.

- **Using Date objects for comparisons in the render loop:** Keep all dates as `'yyyy-MM-dd'` strings. String comparison (`day === taskDeadline`) is sufficient and avoids timezone bugs. Only convert to Date objects when using date-fns arithmetic functions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlay for task editing | Custom portal + backdrop + focus trap | shadcn/ui `Dialog` | Accessibility, keyboard nav, backdrop click, escape key all handled |
| Checkbox with accessible label | Custom styled checkbox input | shadcn/ui `Checkbox` | Focus ring, checked state, accessibility attributes, theming |
| Toggle switch for urgency | Custom button with on/off state | shadcn/ui `Switch` | Accessible role=switch, animation, proper semantics |
| Date range generation | Manual for-loop with `new Date()` arithmetic | date-fns `eachDayOfInterval` + `startOfWeek` + `addDays` | Handles month boundaries, leap years, DST transitions |
| Overdue calculation | Custom date comparison logic | Existing `computeOverdue()` from `src/lib/overdue.ts` | Already tested, handles edge cases, returns structured result |
| Today's date with timezone | `new Date().toISOString().slice(0,10)` | Existing `useToday()` hook from `src/lib/today-provider.tsx` | Amsterdam timezone aware, auto-updates at midnight, consistent across components |
| Delete confirmation | Custom two-button state management | `window.confirm()` or a separate confirmation Dialog state | Simple and effective for single-user app; Dialog state adds unnecessary complexity for a destructive action confirmation |
| Week start calculation | Manual day-of-week math | date-fns `startOfWeek` with `weekStartsOn: 1` | Locale-aware, correct for Monday start (Dutch convention) |

**Key insight:** The Gantt chart's complexity is in the CSS layout (sticky sidebar + scrollable grid) and the date arithmetic (computing column positions, overdue rolling). Both are well-handled by CSS Grid + date-fns. The UI interactions (edit, create, delete tasks) are standard CRUD overlays using existing shadcn/ui patterns.

## Common Pitfalls

### Pitfall 1: Sticky Sidebar Not Working in Overflow Container

**What goes wrong:** `position: sticky` on the sidebar cells doesn't work because the parent has `overflow: hidden` or the sticky element doesn't have proper z-index.
**Why it happens:** Sticky positioning only works within the nearest scrolling ancestor. If a parent between the sticky element and the scrolling container has `overflow: hidden` or `overflow: auto`, sticky breaks.
**How to avoid:** Ensure the `overflow-x: auto` is on the direct parent of the grid, and no intermediate elements have overflow set. The sidebar cells need `z-index: 10` (or higher) to stay above the scrolling day cells, and `bg-background` to prevent content showing through.
**Warning signs:** Sidebar scrolls away with the content instead of staying fixed.

### Pitfall 2: Overdue Tasks Appearing in Wrong Column

**What goes wrong:** An overdue task appears at its original deadline date (which may be off-screen in the past) instead of at today's column.
**Why it happens:** Developer uses `task.deadline` directly for column placement instead of the effective deadline.
**How to avoid:** Always compute column position using `computeOverdue(task.deadline, today, task.is_completed).effectiveDeadline`. This rolls overdue tasks to today's date.
**Warning signs:** Tasks disappearing when they become overdue (their original deadline scrolls off the visible range).

### Pitfall 3: Grid Column Count Mismatch

**What goes wrong:** The CSS Grid's `gridTemplateColumns` doesn't match the actual number of rendered children, causing layout breakage.
**Why it happens:** The grid template specifies `200px repeat(14, 48px)` (15 columns) but the JSX renders a different number of cells per row.
**How to avoid:** Derive column count from the `days` array length: `gridTemplateColumns: \`200px repeat(\${days.length}, 48px)\``. Never hardcode the day count in the CSS. Verify each row renders exactly `1 + days.length` cells.
**Warning signs:** Items wrapping to next row, misaligned columns.

### Pitfall 4: Multiple Task Markers in Same Cell Overlapping

**What goes wrong:** When multiple tasks share the same deadline (or multiple overdue tasks roll to today), their markers stack on top of each other and are unclickable.
**Why it happens:** All markers render at the same position within a cell without spacing.
**How to avoid:** Use a flex container within each cell with `gap-0.5` and allow markers to wrap or stack horizontally. If many tasks share a day, consider a "+N" overflow indicator or a small stacked layout. For a personal dashboard with ~6 tasks per company, overlaps will be rare but should be handled.
**Warning signs:** Clicking a marker but getting the wrong task's edit overlay.

### Pitfall 5: Weekend Columns Cluttering the View

**What goes wrong:** Showing Saturday and Sunday columns wastes space when no tasks are scheduled on weekends.
**Why it happens:** `eachDayOfInterval` generates all days including weekends.
**How to avoid:** For now, include weekends in the 14-day view (requirements say "14 days" which implies calendar days). If weekends are visually noisy, they can be styled with a muted background. Do NOT filter them out -- task deadlines could fall on weekends if the user sets them.
**Warning signs:** User confusion about missing days if weekends are filtered.

### Pitfall 6: Task Create Dialog Missing Company Pre-selection

**What goes wrong:** The "+ Nieuwe taak" button opens a create dialog but forgets which company was clicked.
**Why it happens:** The dialog state doesn't capture the company ID when the button is clicked.
**How to avoid:** Store `creatingForCompanyId: string | null` in the Gantt page state. When the "+" button is clicked, set it to that company's ID. Pass it to the create dialog. Reset to null when dialog closes.
**Warning signs:** Task created for wrong company or company_id is null.

### Pitfall 7: Warmup Bar Not Rendering When Dates Are Outside Visible Range

**What goes wrong:** A company's warmup bar doesn't appear even though the company has a warmup period, because the bar start/end dates are outside the current 14-day window.
**Why it happens:** Developer only renders the bar if both start and end are within the visible range.
**How to avoid:** For each day cell, check if that day falls within the warmup period (`day >= warmup_start_date && day <= go_live_date`). This correctly renders partial bars when only part of the warmup period is in view. Handle null `go_live_date` gracefully (no bar end, or use a special indicator).
**Warning signs:** Warmup bars disappearing when scrolling to different weeks.

### Pitfall 8: Dialog State Conflicts Between Edit, Create, and Company List Overlays

**What goes wrong:** Opening the company task list overlay, then clicking a task to edit, results in both overlays fighting for control.
**Why it happens:** Multiple independent Dialog open states step on each other.
**How to avoid:** Use a single overlay state machine: `type OverlayState = { type: 'none' } | { type: 'editTask', task: Task } | { type: 'createTask', companyId: string } | { type: 'companyTasks', company: CompanyWithTasks }`. Only one overlay can be open at a time. Transitioning from company list to task edit replaces the state.
**Warning signs:** Two overlays rendering simultaneously, or closing one closes both.

## Code Examples

### Gantt Data Fetching (extend existing lib/tasks.ts)

```typescript
// Additional functions for lib/tasks.ts
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/database'

export async function createTask(
  task: Omit<Task, 'id' | 'created_at'>
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'created_at'>>
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

### Timeline Range Utility

```typescript
// lib/gantt-utils.ts
import {
  eachDayOfInterval,
  startOfWeek,
  addDays,
  format,
  parseISO,
  differenceInCalendarDays,
} from 'date-fns'
import { nl } from 'date-fns/locale/nl'

/** Generate array of 'yyyy-MM-dd' strings for the 14-day window starting from Monday of anchorDate's week */
export function getTimelineRange(anchorDate: string, dayCount: number = 14): string[] {
  const anchor = parseISO(anchorDate)
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = addDays(weekStart, dayCount - 1)

  return eachDayOfInterval({ start: weekStart, end }).map(
    (d) => format(d, 'yyyy-MM-dd')
  )
}

/** Get 0-based column index for a date within the timeline range */
export function getColumnIndex(dateStr: string, rangeStart: string): number {
  return differenceInCalendarDays(parseISO(dateStr), parseISO(rangeStart))
}

/** Check if a date falls within an interval (inclusive), using string comparison */
export function isDateInRange(date: string, start: string | null, end: string | null): boolean {
  if (!start) return false
  if (!end) return date >= start  // If no end date, treat as ongoing from start
  return date >= start && date <= end
}

/** Format date for day column header */
export function formatDayHeader(dateStr: string): { dayName: string; dayNum: string } {
  const d = parseISO(dateStr)
  return {
    dayName: format(d, 'EEEEEE', { locale: nl }),  // "ma", "di", etc.
    dayNum: format(d, 'd'),
  }
}
```

### Gantt Page Component Structure

```typescript
// components/gantt/gantt-page.tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { addWeeks, subWeeks, format, parseISO } from 'date-fns'
import { useToday } from '@/lib/today-provider'
import { getTimelineRange } from '@/lib/gantt-utils'
import type { Task, CompanyWithTasks } from '@/types/database'

type OverlayState =
  | { type: 'none' }
  | { type: 'editTask'; task: Task }
  | { type: 'createTask'; companyId: string }
  | { type: 'companyTasks'; company: CompanyWithTasks }

export function GanttPage() {
  const today = useToday()
  const [anchorDate, setAnchorDate] = useState(today)
  const [companies, setCompanies] = useState<CompanyWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [overlay, setOverlay] = useState<OverlayState>({ type: 'none' })

  const days = useMemo(() => getTimelineRange(anchorDate, 14), [anchorDate])

  // ... data fetching, navigation handlers, overlay management
}
```

### Overdue Badge Component

```typescript
// Reusable overdue badge (from UIST-05)
function OverdueBadge({ daysOverdue }: { daysOverdue: number }) {
  if (daysOverdue <= 0) return null
  return (
    <span className="inline-flex items-center justify-center bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
      -{daysOverdue}
    </span>
  )
}
```

### Company Tasks List in Dialog (GANT-06)

```typescript
// company-tasks-dialog.tsx - List all tasks for a company
<Dialog open={overlay.type === 'companyTasks'} onOpenChange={() => setOverlay({ type: 'none' })}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Taken - {company.name}</DialogTitle>
    </DialogHeader>
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {company.tasks
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .map((task) => {
          const overdue = computeOverdue(task.deadline, today, task.is_completed)
          return (
            <button
              key={task.id}
              className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors flex items-center justify-between"
              onClick={() => setOverlay({ type: 'editTask', task })}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  'size-2 rounded-full',
                  task.is_completed ? 'bg-green-500' : task.is_urgent ? 'bg-orange-500' : 'bg-red-500'
                )} />
                <span className={cn(task.is_completed && 'line-through text-muted-foreground')}>
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {overdue.isOverdue && <OverdueBadge daysOverdue={overdue.daysOverdue} />}
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(task.deadline)}
                </span>
              </div>
            </button>
          )
        })}
    </div>
  </DialogContent>
</Dialog>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Third-party Gantt libraries (dhtmlxGantt, TOAST UI) | Custom CSS Grid + sticky layouts | Ongoing trend | Lighter, more flexible, no dependency lock-in for simple timelines |
| Synced dual-scroll containers | Single container with CSS `position: sticky` | CSS sticky is universally supported since 2020 | Simpler, no JavaScript scroll event listeners |
| `params.id` (sync access in Next.js) | `await params` (async in Next.js 16) | Next.js 16 | Already handled in project's dynamic routes |
| Separate `@radix-ui/*` packages | Unified `radix-ui` package | 2026 | Already using unified package in this project |

## Open Questions

1. **Handling companies without go_live_date for warmup bar rendering**
   - What we know: `go_live_date` is nullable in the schema. The warmup bar needs both start and end dates to render.
   - What's unclear: How to visually represent a company with a warmup start but no go-live date. Should the bar extend indefinitely to the right? Should it show a dashed end?
   - Recommendation: If `go_live_date` is null, render the warmup bar from `warmup_start_date` to the last visible day in the timeline (visually extending to the edge). This indicates "ongoing warmup." Alternatively, don't render a bar at all and only show task markers. Suggest the simpler approach: render the bar extending to the right edge of the visible range.

2. **Scroll position when navigating weeks**
   - What we know: Arrow buttons shift the timeline by 7 days. The "Vandaag" button resets to today's week.
   - What's unclear: Should the scroll position reset to the left when navigating? Or should the user's scroll position be preserved?
   - Recommendation: Reset scroll to the left on navigation. The user is asking to see a new date range, so starting from the left (Monday) is the natural starting point.

3. **Whether to show completed task markers differently beyond color**
   - What we know: UIST-04 says green for completed, red for pending. GANT-03 says "colored markers."
   - What's unclear: Should completed tasks have additional visual distinction (e.g., a checkmark inside, reduced opacity, smaller size)?
   - Recommendation: Use filled green circle for completed, filled red/orange for pending/urgent. A small checkmark icon inside the green marker adds useful clarity. Keep it simple.

4. **Task count per cell overflow handling**
   - What we know: Multiple tasks can share the same deadline date for a company.
   - What's unclear: How to display 3+ markers in a single 48px-wide cell.
   - Recommendation: Use a flex layout with small markers (12-16px dots). If more than 2-3 tasks per cell, show a "+N" indicator that opens the company tasks dialog on click. For the initial implementation, use small dots with flex-wrap; overflow handling can be refined iteratively.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src/lib/dates.ts`, `src/lib/overdue.ts`, `src/lib/tasks.ts`, `src/lib/companies.ts`, `src/types/database.ts` -- All reviewed for types, patterns, and existing utilities
- date-fns v4.1 -- Functions verified available via `node -e` (eachDayOfInterval, startOfWeek, addWeeks, subWeeks, differenceInCalendarDays, format, parseISO, addDays)
- date-fns Dutch locale -- Verified output: "maa", "din", "woe", "don", "vri", "zat", "zon" for day abbreviations
- shadcn/ui official docs -- [Popover](https://ui.shadcn.com/docs/components/popover), [Checkbox](https://ui.shadcn.com/docs/components/checkbox), [Switch](https://ui.shadcn.com/docs/components/switch), [Tooltip](https://ui.shadcn.com/docs/components/tooltip), [ScrollArea](https://ui.shadcn.com/docs/components/scroll-area), [Sheet](https://ui.shadcn.com/docs/components/sheet), [Dialog](https://ui.shadcn.com/docs/components/dialog) -- Import patterns, props, and usage confirmed via WebFetch
- CSS `position: sticky` specification -- Universally supported, works within overflow scroll containers when applied to grid/table cells with explicit z-index and background

### Secondary (MEDIUM confidence)
- CSS Grid for Gantt-like layouts -- Standard web technique, widely documented. Sticky sidebar + scrollable grid is a proven pattern for data grids (AG Grid, TanStack Table use similar approaches).
- Supabase `select('*, tasks(*)')` for embedded foreign key queries -- Documented in Supabase JS v2 API reference, used successfully in Phase 2 for `tasks(id, is_completed)`.

### Tertiary (LOW confidence)
- Web search was unavailable during this research session. Patterns for custom Gantt charts are based on established CSS/React knowledge and codebase analysis rather than current community research. However, the techniques involved (CSS Grid, sticky positioning, date-fns) are stable and well-understood, so this limitation has minimal impact.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries already installed and verified. No new dependencies needed (only new shadcn/ui components via CLI).
- Architecture: HIGH -- Layout approach (CSS Grid + sticky) is a proven pattern. Component decomposition follows established project conventions. Data access patterns extend existing `lib/tasks.ts`.
- Pitfalls: HIGH -- Based on direct codebase analysis (overdue computation, date string handling, Dialog patterns all verified against existing code). CSS sticky pitfalls are well-documented in browser implementations.
- Code examples: HIGH -- All examples reference verified APIs (date-fns functions tested, Supabase patterns match existing code, shadcn/ui imports match installed versions).

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days -- stable stack, no fast-moving dependencies)

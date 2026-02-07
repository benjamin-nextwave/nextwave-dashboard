# Phase 2: Company Management & Default Tasks - Research

**Researched:** 2026-02-07
**Domain:** Company CRUD, auto-save forms, default task generation, Next.js dynamic routes, Supabase insert/update patterns
**Confidence:** HIGH

## Summary

Phase 2 builds the core company management workflow: a company overview page with cards, a creation dialog with default task generation, and a multi-section detail page with auto-save on blur. All foundational infrastructure (Supabase client, types, date utilities, navigation, theming) is established from Phase 1.

The main technical challenges are: (1) implementing auto-save on blur with a visible save indicator, (2) generating 6 correctly-dated default tasks when a company is created, (3) building a multi-section detail page with diverse input types (text, textarea, date, phone, email, 1-5 personality selector), and (4) using Next.js App Router dynamic routes with async params for the `[id]` detail page.

The approach is straightforward: use shadcn/ui components (Card, Input, Textarea, Dialog, Badge, Slider, Button, Field, Label, Separator) for the UI, Supabase `.insert()` / `.update()` / `.select()` for data operations, `date-fns` `addDays` for computing task dates, and React state with `onBlur` handlers for auto-save. No form library (react-hook-form, etc.) is needed -- the forms are simple enough for controlled components with direct Supabase calls.

**Primary recommendation:** Build with shadcn/ui components, controlled React state, onBlur auto-save with a simple status indicator, sequential Supabase inserts (company first, then batch tasks), and Next.js dynamic route `[id]` for the detail page. No form libraries or state management libraries needed.

## Standard Stack

### Core (already installed from Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Next.js** | 16.1.6 | App Router, dynamic routes `[id]` | Already installed. Async params for dynamic routes. |
| **React** | 19.2.3 | UI components, controlled forms | Already installed. `use()` hook for unwrapping params in client components. |
| **@supabase/supabase-js** | ^2.95 | Insert, update, select, delete operations | Already installed. Typed singleton client ready. |
| **date-fns** | ^4.1 | `addDays`, `format`, `parseISO` for task date computation | Already installed. Tree-shakeable imports. |
| **shadcn/ui** | latest CLI | Card, Input, Textarea, Dialog, Badge, Field, Label, Separator, Slider | CLI installed. Only Button component exists; need to add more. |
| **Tailwind CSS** | ^4 | Styling with semantic color classes | Already installed with OKLCH colors. |
| **lucide-react** | ^0.563 | Icons (ArrowLeft, Plus, Save, Check, Loader2) | Already installed. |

### shadcn/ui Components to Add

| Component | Install Command | Purpose |
|-----------|----------------|---------|
| **card** | `npx shadcn@latest add card` | Company overview cards |
| **input** | `npx shadcn@latest add input` | Text inputs for name, email, phone, dates |
| **textarea** | `npx shadcn@latest add textarea` | Client notes, mail variants, feedback fields |
| **dialog** | `npx shadcn@latest add dialog` | "+ Nieuw bedrijf" creation form modal |
| **badge** | `npx shadcn@latest add badge` | Open task count on company cards |
| **label** | `npx shadcn@latest add label` | Form field labels |
| **separator** | `npx shadcn@latest add separator` | Section dividers on detail page |
| **field** | `npx shadcn@latest add field` | Accessible form field wrappers (label + input + description) |

Note: The Slider component could be used for personality score 1-5, but a simpler custom 5-button selector is more appropriate for a discrete 1-5 integer scale. A slider implies continuous values; 5 clickable circles/squares better communicate discrete choices.

### Supporting (no new installs)

| Library | Purpose | Notes |
|---------|---------|-------|
| **@date-fns/tz** | Not needed directly in Phase 2 | Task dates are calendar dates (ISO strings), not timezone-sensitive timestamps. `addDays` from `date-fns` works on plain dates. |
| **next-themes** | Already providing dark mode | All shadcn/ui components respect theme automatically via CSS variables. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Controlled components + onBlur | react-hook-form | Overkill for simple forms without complex validation. Adds dependency and abstraction. |
| Sequential Supabase inserts | Supabase RPC function (transaction) | RPC provides atomicity but requires SQL function in DB. For a single-user app, sequential inserts are simpler and the failure window is negligible. |
| Custom 5-button personality selector | shadcn/ui Slider | Slider implies continuous range; 1-5 discrete scale is better served by 5 clickable buttons with visual feedback. |
| Manual save indicator | react-hot-toast or sonner | Toast notifications are more complex than needed. A simple inline "Opgeslagen" / "Opslaan..." text indicator next to the save button is cleaner for auto-save feedback. |

**Installation:**
```bash
npx shadcn@latest add card input textarea dialog badge label separator field
```

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
src/
├── app/
│   └── bedrijven/
│       ├── page.tsx                    # Company overview (COMP-01, COMP-02)
│       └── [id]/
│           └── page.tsx                # Company detail page (COMP-03 to COMP-08)
├── components/
│   ├── ui/                            # shadcn/ui (auto-generated)
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   └── field.tsx
│   ├── companies/
│   │   ├── company-card.tsx           # Single company card for the grid
│   │   ├── company-grid.tsx           # Grid of company cards (client component)
│   │   ├── create-company-dialog.tsx  # "+ Nieuw bedrijf" dialog
│   │   └── company-detail/
│   │       ├── company-detail-page.tsx  # Main detail page wrapper (client component)
│   │       ├── section-basisgegevens.tsx # Section 1: Basic info
│   │       ├── section-klantprofiel.tsx  # Section 2: Client profile
│   │       ├── section-mailvarianten.tsx # Section 3: Mail variants
│   │       ├── section-feedback.tsx     # Section 4: Feedback & planning
│   │       ├── personality-selector.tsx # 1-5 visual personality selector
│   │       └── save-indicator.tsx       # Auto-save status display
│   └── ...
├── lib/
│   ├── companies.ts                   # Supabase CRUD functions for companies
│   ├── tasks.ts                       # Supabase CRUD functions for tasks
│   └── default-tasks.ts              # Default task definitions and generation logic
└── types/
    └── database.ts                    # Already exists from Phase 1
```

### Pattern 1: Next.js Dynamic Route with Async Params

**What:** Company detail page at `/bedrijven/[id]` using Next.js App Router dynamic routes.
**When to use:** For the company detail page that loads a single company by UUID.
**Why:** Standard App Router pattern. In Next.js 16, params is a Promise that must be awaited.

```typescript
// src/app/bedrijven/[id]/page.tsx
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes

import { CompanyDetailPage } from '@/components/companies/company-detail/company-detail-page'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CompanyDetailPage companyId={id} />
}
```

**Key detail:** The page component is a thin async Server Component that unwraps params and passes the `id` to a Client Component that manages the form state. This keeps the dynamic route handling clean while allowing interactive form behavior.

### Pattern 2: Supabase Data Access Layer

**What:** Dedicated modules for company and task CRUD operations, keeping Supabase logic out of components.
**When to use:** Every data fetch, insert, update, or delete operation.
**Why:** Centralized error handling, typed responses, reusable across pages.

```typescript
// src/lib/companies.ts
import { supabase } from '@/lib/supabase'
import type { Company, CompanyWithTasks } from '@/types/database'

export async function getCompaniesWithTaskCounts(): Promise<
  (Company & { open_task_count: number })[]
> {
  const { data, error } = await supabase
    .from('companies')
    .select('*, tasks(count)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((company: any) => ({
    ...company,
    open_task_count: company.tasks?.[0]?.count ?? 0,
  }))
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCompany(
  company: { name: string; warmup_start_date: string; go_live_date: string }
): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCompany(
  id: string,
  updates: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

**Important:** The `tasks(count)` syntax on the select query uses the foreign key relationship to get a count of related tasks. The result structure is `{ tasks: [{ count: N }] }`, which needs to be unwrapped.

### Pattern 3: Default Task Generation

**What:** Pure function that generates 6 default task objects from a warmup_start_date, plus a function to insert them.
**When to use:** After creating a company, batch-insert the 6 default tasks.
**Why:** Separating task definition from insertion makes the logic testable and the definitions easy to review.

```typescript
// src/lib/default-tasks.ts
import { addDays, format } from 'date-fns'
import type { Task } from '@/types/database'

type DefaultTaskDef = {
  title: string
  dayOffset: number  // days after warmup_start_date (0-based: day 1 = offset 0)
  is_date_editable: boolean
}

export const DEFAULT_TASKS: DefaultTaskDef[] = [
  { title: 'Create email templates', dayOffset: 0, is_date_editable: false },
  { title: 'Have an onboarding call', dayOffset: 1, is_date_editable: true },
  { title: 'Buy custom domains and mailboxes, place in warmup tool', dayOffset: 2, is_date_editable: false },
  { title: 'Create an RLM', dayOffset: 3, is_date_editable: false },
  { title: 'Create follow-up mails', dayOffset: 4, is_date_editable: false },
  { title: 'Create a dashboard', dayOffset: 5, is_date_editable: false },
]

export function generateDefaultTasks(
  companyId: string,
  warmupStartDate: string // ISO date string 'YYYY-MM-DD'
): Omit<Task, 'id' | 'created_at'>[] {
  const baseDate = new Date(warmupStartDate + 'T00:00:00')

  return DEFAULT_TASKS.map((def) => ({
    company_id: companyId,
    title: def.title,
    deadline: format(addDays(baseDate, def.dayOffset), 'yyyy-MM-dd'),
    is_completed: false,
    is_urgent: false,
    is_date_editable: def.is_date_editable,
    notes: null,
  }))
}
```

**Key detail about day offsets:** The requirements say "6 default tasks starting from warmup_start_date, each 1 day apart". This means: day 1 = warmup_start_date (offset 0), day 2 = warmup_start_date + 1 (offset 1), etc. The dayOffset is zero-based.

### Pattern 4: Auto-Save on Blur with Status Indicator

**What:** Each field saves to Supabase when it loses focus (onBlur). A status indicator shows "Opslaan..." while saving and "Opgeslagen" after success.
**When to use:** All editable fields on the company detail page.
**Why:** Auto-save eliminates the need to remember to save. The manual save button exists as a fallback but auto-save is the primary mechanism.

```typescript
// Simplified auto-save hook pattern
// src/hooks/use-auto-save.ts

import { useState, useCallback, useRef } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(
  saveFn: (updates: Record<string, unknown>) => Promise<void>
) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const save = useCallback(
    async (field: string, value: unknown) => {
      // Clear any existing "saved" timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      setStatus('saving')
      try {
        await saveFn({ [field]: value })
        setStatus('saved')
        // Reset to idle after 2 seconds
        timeoutRef.current = setTimeout(() => setStatus('idle'), 2000)
      } catch {
        setStatus('error')
      }
    },
    [saveFn]
  )

  return { status, save }
}
```

**How it works in a field:**
```typescript
// Inside a section component
const { status, save } = useAutoSave(async (updates) => {
  await updateCompany(companyId, updates)
})

// On each field:
<Input
  value={company.name}
  onChange={(e) => setCompany({ ...company, name: e.target.value })}
  onBlur={() => save('name', company.name)}
/>
```

**The save indicator component:**
```typescript
// src/components/companies/company-detail/save-indicator.tsx
function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  if (status === 'saving') return <span className="text-muted-foreground text-sm flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> Opslaan...</span>
  if (status === 'saved') return <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1"><Check className="size-3" /> Opgeslagen</span>
  if (status === 'error') return <span className="text-destructive text-sm">Fout bij opslaan</span>
}
```

### Pattern 5: Company Creation Flow

**What:** Sequential operations: create company -> get ID from response -> generate default tasks -> batch insert tasks -> navigate to detail page or refresh grid.
**When to use:** When the user clicks "Aanmaken" in the create company dialog.
**Why:** Sequential inserts are simple and sufficient for single-user app. `.select().single()` on the insert returns the created company with its generated UUID.

```typescript
// Inside create-company-dialog.tsx
async function handleCreate() {
  // 1. Insert company, get back the created record with ID
  const company = await createCompany({
    name,
    warmup_start_date: warmupStartDate,
    go_live_date: goLiveDate,
  })

  // 2. Generate default tasks using the new company ID
  const tasks = generateDefaultTasks(company.id, warmupStartDate)

  // 3. Batch insert all 6 tasks
  const { error } = await supabase.from('tasks').insert(tasks)
  if (error) throw error

  // 4. Close dialog and refresh the company list
  onCreated()
}
```

### Pattern 6: Personality Score Selector (1-5)

**What:** Five clickable circles/buttons representing scores 1-5, with the selected one filled.
**When to use:** COMP-04 "personality scale 1-5 visual selector".
**Why:** A discrete 1-5 scale is better represented as 5 distinct buttons rather than a continuous slider. This makes the interaction clear and the visual state obvious.

```typescript
// src/components/companies/company-detail/personality-selector.tsx
function PersonalitySelector({
  value,
  onChange,
}: {
  value: number | null
  onChange: (score: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          className={cn(
            'size-9 rounded-full border-2 text-sm font-medium transition-colors',
            value === score
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border hover:border-primary/50 text-muted-foreground'
          )}
        >
          {score}
        </button>
      ))}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Fetching data inside useEffect on mount:** For the overview page, prefer fetching in the server component or using React's `use()` with a promise. For the detail page (client component), useEffect + fetch on mount is acceptable since the form needs client-side state management.
- **Storing the entire form in a single useState:** Use individual state variables or a single company object state. Avoid spreading state across many individual useState calls -- a single `company` state object with field-level updates is cleanest.
- **Using router.back() without fallback:** If the user navigates directly to `/bedrijven/[id]` (no history), `router.back()` goes nowhere useful. Use a Link to `/bedrijven` instead of `router.back()` for the back button. This ensures predictable navigation.
- **Debouncing the save on every keystroke:** Auto-save should fire on BLUR, not on every keystroke. This is simpler and avoids unnecessary API calls while the user is still typing.
- **Forgetting to handle the open task count correctly:** The `tasks(count)` query returns `{ tasks: [{ count: N }] }` (an array with one object). The count includes ALL tasks, not just incomplete ones. Filter to incomplete tasks: `.select('*, tasks!inner(count)').eq('tasks.is_completed', false)` or compute client-side.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialog for company creation | Custom overlay with portal, focus trap, backdrop | shadcn/ui `Dialog` component | Handles focus trapping, escape key, overlay click, animation, accessibility |
| Form field layout with labels | Custom div + label + input stacking | shadcn/ui `Field` + `FieldLabel` + `FieldDescription` | Handles accessible label association, consistent spacing, responsive orientation |
| Card layout for company overview | Custom div with shadows and borders | shadcn/ui `Card` + `CardHeader` + `CardContent` | Consistent with design system, dark mode compatible, proper semantic structure |
| Date arithmetic (adding days) | Manual day counting with edge cases | `date-fns` `addDays()` | Handles month/year boundaries, leap years correctly |
| UUID generation | Custom random string generation | Let Supabase generate via `gen_random_uuid()` default | Database-generated UUIDs are guaranteed unique, no client-side generation needed |

**Key insight:** Phase 2's complexity is in the orchestration (create company -> generate tasks -> save -> navigate) and the UX (auto-save feedback), not in the individual components. Use standard shadcn/ui primitives for all visual elements and focus implementation effort on the data flow and save behavior.

## Common Pitfalls

### Pitfall 1: Next.js 16 Async Params in Dynamic Routes

**What goes wrong:** Using `params.id` directly without awaiting the params Promise causes a runtime error in Next.js 16.
**Why it happens:** In Next.js 16, params is always a Promise. This is a breaking change from Next.js 15 where sync access was still supported.
**How to avoid:** In server components, use `const { id } = await params`. In client components, use `const { id } = use(params)` or pass `id` as a prop from a server component wrapper.
**Warning signs:** Error about accessing properties on a Promise object.

### Pitfall 2: Supabase tasks(count) Returns Array-Wrapped Count

**What goes wrong:** Developer expects `company.tasks` to be a number but it is `[{ count: N }]`.
**Why it happens:** Supabase's foreign key aggregate syntax wraps the count in an array with a single object.
**How to avoid:** Always unwrap: `company.tasks?.[0]?.count ?? 0`. Write a helper function in the data access layer to transform the result.
**Warning signs:** Rendering `[object Object]` instead of a number.

### Pitfall 3: Task Count Includes Completed Tasks

**What goes wrong:** The company card shows "3 open tasks" but one is actually completed. The count includes all tasks.
**Why it happens:** `tasks(count)` counts ALL related tasks regardless of `is_completed`.
**How to avoid:** Either: (a) filter in the query using `.eq('tasks.is_completed', false)` with the embedded filter syntax, or (b) fetch task counts separately with a filter, or (c) load all tasks and count client-side. Option (c) is simplest for a small dataset but option (a) is most efficient.
**Warning signs:** Task counts not matching what the user sees on the detail page.

### Pitfall 4: Auto-Save Race Condition on Rapid Field Changes

**What goes wrong:** User changes field A, blurs, immediately changes field B, blurs. The save for field B might overwrite field A if the update sends the entire company object.
**Why it happens:** If both saves send the full company state, the second save uses state that hasn't yet reflected the first save's server response.
**How to avoid:** Send ONLY the changed field in each update call: `updateCompany(id, { name: newName })` rather than `updateCompany(id, entireCompanyObject)`. Supabase's `.update()` with a partial object is a PATCH operation, so only the specified field is modified.
**Warning signs:** Fields reverting to old values after rapid editing.

### Pitfall 5: Date Input Format Mismatch

**What goes wrong:** HTML date input (`<input type="date">`) returns dates as `YYYY-MM-DD` strings. Supabase stores dates as `YYYY-MM-DD`. But if the developer converts to Date objects in between, timezone offsets can shift the date by one day.
**Why it happens:** `new Date('2026-02-07')` in a browser interprets this as UTC midnight, which could be February 6th in some timezones when converted back.
**How to avoid:** Keep dates as `YYYY-MM-DD` strings throughout. Use `<input type="date" value={dateString} />` directly with the ISO string. Only convert to Date objects when using `date-fns` for arithmetic (like `addDays`), and immediately convert back to string with `format(result, 'yyyy-MM-dd')`.
**Warning signs:** Dates appearing one day off from what was entered.

### Pitfall 6: Creating Default Tasks with Wrong Day Numbering

**What goes wrong:** Tasks are created starting from warmup_start_date + 1 instead of warmup_start_date itself, or the spacing is wrong.
**Why it happens:** Confusion between "day 1" (which IS the warmup_start_date) and "offset 1" (which is one day AFTER warmup_start_date).
**How to avoid:** Use zero-based offsets: day 1 = offset 0, day 2 = offset 1, ..., day 6 = offset 5. Write a unit test that verifies the exact dates for a known warmup_start_date.
**Warning signs:** First task's deadline doesn't match the warmup_start_date.

### Pitfall 7: Link vs router.back() for Back Button

**What goes wrong:** Using `router.back()` for the back button on the detail page. If the user directly navigated to `/bedrijven/some-id` (e.g., bookmarked or shared link), `router.back()` navigates somewhere unexpected.
**Why it happens:** `router.back()` relies on browser history, which might not contain the bedrijven overview page.
**How to avoid:** Use a Next.js `<Link href="/bedrijven">` for the back button. This always navigates to the companies overview regardless of navigation history.
**Warning signs:** Back button leading to unexpected pages.

## Code Examples

### Company Overview Page with Data Fetching

```typescript
// src/app/bedrijven/page.tsx
// Source: Next.js App Router conventions + Supabase select
import { CompanyGrid } from '@/components/companies/company-grid'

export default function BedrijvenPage() {
  return (
    <main className="p-6">
      <CompanyGrid />
    </main>
  )
}
```

The `CompanyGrid` is a client component that fetches companies on mount and manages the creation dialog state. This approach is used because the grid needs to be refreshable after creating a new company without a full page reload.

### Company Card Component

```typescript
// src/components/companies/company-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatShortDate } from '@/lib/dates'
import Link from 'next/link'

type CompanyCardProps = {
  id: string
  name: string
  goLiveDate: string | null
  openTaskCount: number
}

export function CompanyCard({ id, name, goLiveDate, openTaskCount }: CompanyCardProps) {
  return (
    <Link href={`/bedrijven/${id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {goLiveDate ? formatShortDate(goLiveDate) : 'Geen go-live datum'}
          </span>
          <Badge variant="secondary">
            {openTaskCount} open
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### Create Company Dialog

```typescript
// src/components/companies/create-company-dialog.tsx
// Source: shadcn/ui Dialog docs
'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { createCompany } from '@/lib/companies'
import { generateDefaultTasks } from '@/lib/default-tasks'
import { supabase } from '@/lib/supabase'

export function CreateCompanyDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [warmupStartDate, setWarmupStartDate] = useState('')
  const [goLiveDate, setGoLiveDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !warmupStartDate) return

    setIsSubmitting(true)
    try {
      // 1. Create company
      const company = await createCompany({
        name,
        warmup_start_date: warmupStartDate,
        go_live_date: goLiveDate || null,
      })

      // 2. Generate and insert default tasks
      const tasks = generateDefaultTasks(company.id, warmupStartDate)
      const { error } = await supabase.from('tasks').insert(tasks)
      if (error) throw error

      // 3. Reset and close
      setName('')
      setWarmupStartDate('')
      setGoLiveDate('')
      setOpen(false)
      onCreated()
    } catch (err) {
      console.error('Failed to create company:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nieuw bedrijf
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuw bedrijf aanmaken</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bedrijfsnaam</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warmup">Warmup startdatum</Label>
            <Input
              id="warmup"
              type="date"
              value={warmupStartDate}
              onChange={(e) => setWarmupStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="golive">Go-live datum</Label>
            <Input
              id="golive"
              type="date"
              value={goLiveDate}
              onChange={(e) => setGoLiveDate(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Aanmaken...' : 'Aanmaken'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Detail Page Back Button

```typescript
// Source: Next.js Link component (deterministic navigation)
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

<Button variant="ghost" asChild>
  <Link href="/bedrijven">
    <ArrowLeft className="size-4" />
    Terug naar overzicht
  </Link>
</Button>
```

### Supabase Batch Insert for Default Tasks

```typescript
// src/lib/tasks.ts
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/database'

export async function insertDefaultTasks(
  tasks: Omit<Task, 'id' | 'created_at'>[]
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(tasks)
    .select()

  if (error) throw error
  return data ?? []
}

export async function getTasksByCompanyId(companyId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('company_id', companyId)
    .order('deadline', { ascending: true })

  if (error) throw error
  return data ?? []
}
```

### Open Task Count Query Pattern

```typescript
// Pattern for getting companies with OPEN (incomplete) task count
// Two approaches:

// Approach A: Query all, count client-side (simpler, fine for small datasets)
const { data, error } = await supabase
  .from('companies')
  .select('*, tasks(id, is_completed)')
  .order('created_at', { ascending: false })

const companiesWithCounts = data.map(company => ({
  ...company,
  open_task_count: company.tasks.filter((t: any) => !t.is_completed).length,
}))

// Approach B: Separate query for count (more efficient for large datasets)
// Not needed for a personal dashboard with < 100 companies
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params.id` (sync access) | `const { id } = await params` (async) | Next.js 16 (late 2025) | All dynamic route params must be awaited |
| `@radix-ui/react-dialog` (separate pkg) | `radix-ui` (unified package) | Feb 2026 | shadcn/ui components import from single `radix-ui` package |
| shadcn/ui `Label` for form fields | shadcn/ui `Field` + `FieldLabel` component family | Oct 2025 | `Field` provides integrated label + input + description + error |
| react-hook-form for all forms | Controlled components for simple forms | Ongoing | Simple forms with auto-save don't benefit from form library overhead |

**Note for shadcn/ui components:** The project already uses the unified `radix-ui` package (confirmed in package.json). All newly added shadcn/ui components will automatically use this unified import pattern.

## Open Questions

1. **Open task count query efficiency**
   - What we know: For the overview page, we need count of INCOMPLETE tasks per company. `tasks(count)` counts ALL tasks. We can either (a) filter with embedded query syntax or (b) fetch task IDs with `is_completed` and count client-side.
   - What's unclear: The embedded filter syntax for count aggregates (`.eq('tasks.is_completed', false)` with `tasks(count)`) may not work as expected in all Supabase versions.
   - Recommendation: Use approach (b) -- fetch `tasks(id, is_completed)` and count client-side. The dataset is small (< 100 companies, < 1000 tasks) so this is negligible performance cost and avoids query syntax edge cases.

2. **Auto-save vs manual save interaction**
   - What we know: COMP-07 requires BOTH auto-save on blur AND a manual save button as fallback.
   - What's unclear: Should the manual save button save ALL fields or only dirty fields? Should it show its own status?
   - Recommendation: The manual save button sends ALL current field values to Supabase (full update). It uses the same save status indicator. Both auto-save and manual save update the same status. This is the simplest approach and covers the "user doesn't trust auto-save" use case.

3. **Detail page data loading pattern**
   - What we know: The detail page needs to load company data on mount and provide it to the form as initial state. The form then manages its own local state with auto-save on blur.
   - What's unclear: Whether to fetch in the server component and pass as props, or fetch in the client component on mount.
   - Recommendation: Fetch in the client component on mount (useEffect). This is simpler because the form needs mutable client state anyway, and it avoids the complexity of hydrating server-fetched data into client state. Show a loading skeleton while fetching.

## Sources

### Primary (HIGH confidence)
- [Next.js Dynamic Routes docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - Async params, folder conventions, type definitions
- [Next.js useRouter docs](https://nextjs.org/docs/app/api-reference/functions/use-router) - back(), push(), replace() methods
- [Supabase JS insert docs](https://supabase.com/docs/reference/javascript/insert) - Single/batch insert, .select() chaining
- [Supabase JS update docs](https://supabase.com/docs/reference/javascript/update) - Partial updates, .eq() filter, .select() chaining
- [Supabase JS select docs](https://supabase.com/docs/reference/javascript/select) - Foreign key queries, count aggregates, .single()
- [shadcn/ui Card component](https://ui.shadcn.com/docs/components/card) - Card, CardHeader, CardTitle, CardContent, CardFooter, CardAction
- [shadcn/ui Dialog component](https://ui.shadcn.com/docs/components/dialog) - Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
- [shadcn/ui Input component](https://ui.shadcn.com/docs/components/radix/input) - Input with Field integration
- [shadcn/ui Textarea component](https://ui.shadcn.com/docs/components/textarea) - Textarea with Field integration
- [shadcn/ui Badge component](https://ui.shadcn.com/docs/components/badge) - Badge variants (default, outline, secondary, destructive)
- [shadcn/ui Field component](https://ui.shadcn.com/docs/components/radix/field) - Field, FieldLabel, FieldDescription, FieldError
- [shadcn/ui Label component](https://ui.shadcn.com/docs/components/radix/label) - Label with htmlFor
- [shadcn/ui Slider component](https://ui.shadcn.com/docs/components/radix/slider) - Slider with controlled value
- [shadcn/ui Feb 2026 changelog](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) - Unified radix-ui package

### Secondary (MEDIUM confidence)
- [Supabase transactions discussion](https://github.com/orgs/supabase/discussions/526) - RPC vs sequential inserts pattern
- [date-fns addDays](https://date-fns.org/) - addDays function usage

### Tertiary (LOW confidence)
- Auto-save on blur pattern - Based on community patterns, no single authoritative source; the approach is straightforward React (onBlur + API call) so confidence in the pattern itself is high despite no official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed from Phase 1. shadcn/ui components verified against official docs. Supabase CRUD patterns verified against official API reference.
- Architecture: HIGH - Next.js dynamic routes pattern verified against official docs. Data access layer pattern is standard practice. Component decomposition follows React conventions.
- Pitfalls: HIGH - Async params pitfall verified against Next.js 16 docs. Supabase count syntax verified against official API. Date string handling is well-documented behavior.

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stable, mature stack; no fast-moving dependencies)

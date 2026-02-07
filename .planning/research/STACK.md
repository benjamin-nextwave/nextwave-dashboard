# Technology Stack

**Project:** NextWave Client Management Dashboard
**Researched:** 2026-02-07
**Overall Confidence:** MEDIUM (versions based on training data through May 2025; verify with `npm view <pkg> version` before installing)

> **Verification note:** WebSearch, WebFetch, and npm CLI were unavailable during research. All version numbers reflect the latest known stable releases as of May 2025. Before running `create-next-app` or `npm install`, verify each version is still current. The architectural recommendations and library choices are HIGH confidence -- these are mature, well-established tools unlikely to have been superseded.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Next.js** | ^15.1 | Full-stack React framework (App Router) | App Router is the standard for new Next.js projects. Server Components reduce client JS bundle. Server Actions simplify data mutations. Vercel deployment is zero-config. Non-negotiable per project constraints. | MEDIUM (version) / HIGH (choice) |
| **React** | ^19.0 | UI library | Next.js 15 ships with React 19. React 19 brings `use()` hook, Server Components as first-class, improved Suspense. Do NOT pin React 18 -- Next 15 expects React 19. | MEDIUM (version) / HIGH (choice) |
| **TypeScript** | ^5.6 | Type safety | Non-negotiable for any serious project. Catches bugs at build time, enables IDE autocomplete for Supabase types, component props, and form schemas. | MEDIUM (version) / HIGH (choice) |

### Database & Backend

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Supabase** (hosted) | — | Postgres database + API | Non-negotiable per constraints. Provides Postgres with auto-generated REST API, real-time subscriptions if needed later, and a generous free tier for personal projects. | HIGH |
| **@supabase/supabase-js** | ^2.45 | Supabase client SDK | The official JavaScript client. v2 is the stable line. Provides typed queries when combined with generated types. | MEDIUM (version) / HIGH (choice) |
| **@supabase/ssr** | ^0.5 | Server-side Supabase helpers | Provides `createServerClient` and `createBrowserClient` for Next.js App Router. Handles cookie-based auth sessions properly (even though we skip auth, the client pattern is still correct for SSR). Replaces the deprecated `@supabase/auth-helpers-nextjs`. | MEDIUM (version) / HIGH (choice) |

### Styling & Components

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Tailwind CSS** | ^3.4 | Utility-first CSS | Non-negotiable per constraints. v3.4 is the latest stable v3 line. NOTE: Tailwind v4 was released in early 2025 but shadcn/ui may not fully support it yet -- stick with v3.4 for compatibility. Verify shadcn/ui v4 support before upgrading. | MEDIUM (version) / HIGH (reasoning) |
| **shadcn/ui** | latest CLI | Component library (copy-paste model) | Non-negotiable per constraints. Not a package dependency -- components are copied into your project via CLI (`npx shadcn-ui@latest init`). Uses Radix UI primitives under the hood. Fully customizable since code lives in your repo. | HIGH |
| **@radix-ui/react-*** | (installed by shadcn) | Accessible UI primitives | Installed automatically when adding shadcn components. Provides Dialog, Popover, Select, DropdownMenu, Tooltip, etc. with full keyboard navigation and ARIA compliance. Do NOT install manually -- let shadcn manage these. | HIGH |
| **lucide-react** | ^0.460 | Icon library | The default icon set for shadcn/ui. Tree-shakeable, consistent style. Already integrated into shadcn components. | MEDIUM (version) / HIGH (choice) |
| **class-variance-authority** | ^0.7 | Component variant API | Used by shadcn/ui for defining component variants (size, color, etc.). Installed as part of shadcn setup. | HIGH |
| **clsx** | ^2.1 | Conditional classnames | Lightweight utility for conditional CSS classes. Used in the `cn()` helper that shadcn provides. | HIGH |
| **tailwind-merge** | ^2.6 | Tailwind class deduplication | Merges Tailwind classes intelligently (e.g., `p-4` + `p-2` = `p-2`). Used in the `cn()` helper alongside clsx. | MEDIUM (version) / HIGH (choice) |

### Date Handling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **date-fns** | ^4.1 | Date manipulation & formatting | **Recommended over dayjs.** Tree-shakeable (only import what you use), functional API (no prototype pollution), excellent locale support for Dutch (`nl` locale), built-in timezone support via `date-fns-tz`. Works naturally with native Date objects. v4 is the latest line. | MEDIUM (version) / HIGH (choice) |
| **date-fns-tz** | (bundled in date-fns v4) | Timezone conversion | In date-fns v3+, timezone functions are included in the main package or in `@date-fns/tz`. Needed for Europe/Amsterdam timezone handling. Verify import paths at install time. | MEDIUM |

**Why NOT dayjs:** dayjs is lighter but requires plugins for everything (locale, timezone, weekday). date-fns v4 is tree-shakeable so bundle size is comparable. date-fns has better TypeScript types and more predictable behavior with immutable operations. For a dashboard with heavy date manipulation (Gantt chart, overdue rolling, Dutch formatting), date-fns is the more robust choice.

### Gantt Chart

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Custom implementation** | — | Gantt chart visualization | **Build it custom with plain divs + Tailwind.** See rationale below. | HIGH |

**Why custom instead of a library:**

This project's Gantt chart is relatively simple -- horizontal bars (warmup period) with task markers on a timeline. The requirements are:
1. Company rows with warmup bars spanning start-to-go-live dates
2. Task markers at deadline positions
3. Click overlays for task/company details
4. Timeline navigation (scroll weeks)

Existing Gantt libraries (gantt-task-react, frappe-gantt, dhtmlxGantt) are:
- **Overly complex** -- designed for MS Project-style dependency management, critical paths, resource allocation
- **Hard to style** -- most render to canvas or SVG with their own styling, fighting Tailwind and shadcn theming
- **Heavy** -- 50-200KB for features you won't use
- **Dark mode hostile** -- most don't support CSS-variable-based theming

A custom Gantt with positioned `<div>` elements inside a scrollable container is:
- 200-300 lines of code for the core logic
- Fully styled with Tailwind classes
- Fully themed with CSS variables (dark/light mode)
- Exactly matches the interaction model (click to open overlay, not drag-to-resize)

**If you later need drag-and-drop rescheduling**, consider adding `@dnd-kit/core` (^6.1) as a targeted enhancement rather than adopting a full Gantt library.

### Form Handling & Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **react-hook-form** | ^7.54 | Form state management | Best React form library for performance (uncontrolled inputs, minimal re-renders). Integrates seamlessly with shadcn form components. Handles the auto-save-on-blur pattern well via `watch()` and field-level `onBlur`. | MEDIUM (version) / HIGH (choice) |
| **@hookform/resolvers** | ^3.9 | Schema validation bridge | Connects react-hook-form to Zod for schema-based validation. | MEDIUM (version) / HIGH (choice) |
| **zod** | ^3.23 | Schema validation | TypeScript-first validation. Define schemas once, use for form validation AND Supabase type inference. Smaller and faster than yup. The standard choice in the Next.js ecosystem. | MEDIUM (version) / HIGH (choice) |

### State Management & Data Fetching

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Server Components** (built-in) | — | Data fetching | Fetch data in Server Components. No client-side state management library needed for data loading. Use `async` Server Components that `await` Supabase queries. | HIGH |
| **React `useState`/`useReducer`** (built-in) | — | Client UI state | For UI state (modal open, selected company, active tab). This project is simple enough that you do NOT need Zustand, Jotai, or Redux. | HIGH |
| **nuqs** | ^2.2 | URL search params state | Type-safe URL search parameter management. Use for Gantt timeline position, filters, and active views. Preserves state on reload/share. Works with Next.js App Router. | MEDIUM (version) / HIGH (choice) |

**Why NOT TanStack Query / SWR:** For this single-user personal dashboard, Server Components handle data fetching. Client-side mutations (save company, create task) are simple enough with Server Actions + `revalidatePath()`. Adding TanStack Query would introduce unnecessary complexity. If you later need optimistic updates or real-time sync, reconsider.

### Notifications / Feedback

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **sonner** | ^1.7 | Toast notifications | Beautiful, minimal toast library. Works with shadcn (shadcn wraps it as the `<Toaster>` component). Use for save confirmations, error messages, delete confirmations. | MEDIUM (version) / HIGH (choice) |

### Theming

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **next-themes** | ^0.4 | Dark/light mode | The standard for Next.js theme switching. Handles SSR flash-of-wrong-theme, localStorage persistence, system preference detection. Used by shadcn's theme examples. | MEDIUM (version) / HIGH (choice) |

### Development Tools

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **ESLint** | ^9.0 | Linting | Next.js 15 ships with ESLint 9 flat config. Use `next lint` defaults + `@typescript-eslint`. | MEDIUM (version) / HIGH (choice) |
| **Prettier** | ^3.4 | Code formatting | Consistent formatting. Add `prettier-plugin-tailwindcss` to auto-sort Tailwind classes. | MEDIUM (version) / HIGH (choice) |
| **prettier-plugin-tailwindcss** | ^0.6 | Tailwind class sorting | Automatically sorts Tailwind utility classes in a consistent, readable order. One less thing to think about. | MEDIUM (version) / HIGH (choice) |
| **Supabase CLI** | latest | Local development, type generation | Run `supabase gen types typescript` to generate TypeScript types from your database schema. Enables end-to-end type safety from DB to UI. | HIGH |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Date library** | date-fns v4 | dayjs | dayjs needs plugins for everything; date-fns is tree-shakeable and has better TS types |
| **Gantt chart** | Custom (divs + Tailwind) | gantt-task-react, frappe-gantt | Over-engineered for simple bars; hard to theme; heavy bundle |
| **State management** | React built-ins + nuqs | Zustand, Jotai, Redux | Overkill for single-user dashboard with Server Components |
| **Data fetching** | Server Components + Server Actions | TanStack Query, SWR | Unnecessary layer; Server Components fetch data directly |
| **CSS framework** | Tailwind v3.4 | Tailwind v4 | shadcn/ui compatibility not confirmed for v4; v3.4 is stable and well-supported |
| **Form library** | react-hook-form + zod | Formik, uncontrolled forms | react-hook-form has better performance and DX; zod provides type-safe validation |
| **Icons** | lucide-react | heroicons, react-icons | lucide-react is the shadcn default; consistent with component library |
| **Toast library** | sonner | react-hot-toast, shadcn toast | sonner is the modern standard; shadcn wraps it natively |
| **Theme switching** | next-themes | Custom implementation | next-themes solves SSR flash, localStorage, system preference out of the box |
| **URL state** | nuqs | Manual useSearchParams | nuqs provides type safety, serialization, and debouncing built-in |
| **Supabase auth helpers** | @supabase/ssr | @supabase/auth-helpers-nextjs | auth-helpers-nextjs is deprecated; @supabase/ssr is the replacement |

---

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| **@supabase/auth-helpers-nextjs** | Deprecated. Use `@supabase/ssr` instead. |
| **Tailwind CSS v4** | Too new; shadcn/ui compatibility uncertain. Stick with v3.4. Verify before upgrading. |
| **Pages Router** | Legacy routing model. App Router is the standard for new Next.js projects. |
| **getServerSideProps / getStaticProps** | Pages Router patterns. Use `async` Server Components and Server Actions instead. |
| **Redux / Redux Toolkit** | Massive overkill for a personal dashboard. React built-ins suffice. |
| **Prisma** | Adds an unnecessary ORM layer. Supabase provides its own query builder and PostgREST API. Use Supabase client directly. |
| **Drizzle ORM** | Same reasoning as Prisma. Direct Supabase client queries are simpler for this project. |
| **moment.js** | Deprecated. Use date-fns. |
| **Gantt chart libraries** | See Gantt section above. Build custom. |
| **CSS Modules / styled-components** | Tailwind is the styling approach. Don't mix paradigms. |
| **NextAuth.js / Auth.js** | No authentication needed. Single-user, personal use. |
| **React Context for state** | Leads to unnecessary re-renders. Use React state locally, URL state via nuqs, server state via Server Components. |

---

## Architecture Patterns (Stack-Level)

### Supabase Client Setup

Create two client factories in `lib/supabase/`:

```typescript
// lib/supabase/server.ts -- for Server Components and Server Actions
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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// lib/supabase/client.ts -- for Client Components (rare, use sparingly)
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Type Generation

```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

This gives you full type safety on every Supabase query. Update types whenever schema changes.

### Dutch Date Formatting with date-fns

```typescript
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

// "maandag 10 februari 2025"
format(new Date(), 'EEEE d MMMM yyyy', { locale: nl })

// "ma 10 feb"
format(new Date(), 'EEE d MMM', { locale: nl })
```

### Server Actions Pattern

```typescript
// app/actions/tasks.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateTaskSchema = z.object({
  company_id: z.string().uuid(),
  title: z.string().min(1),
  deadline: z.string().date(),
})

export async function createTask(formData: FormData) {
  const parsed = CreateTaskSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = await createClient()
  const { error } = await supabase.from('tasks').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/gantt')
  return { success: true }
}
```

---

## Installation

```bash
# 1. Create Next.js project
npx create-next-app@latest nextwave-dashboard \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

# 2. Initialize shadcn/ui
npx shadcn-ui@latest init
# Choose: New York style, Zinc color, CSS variables: yes

# 3. Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install date-fns
npm install zod react-hook-form @hookform/resolvers
npm install next-themes
npm install nuqs
npm install sonner

# 4. Add shadcn components (adds Radix dependencies automatically)
npx shadcn-ui@latest add button card dialog dropdown-menu input label \
  popover select separator sheet table tabs textarea toast tooltip badge \
  calendar form

# 5. Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss
npm install -D supabase

# 6. Generate Supabase types (after schema is created)
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

No server-only secrets needed since we skip authentication and RLS is disabled for personal use.

---

## Version Verification Checklist

Before installing, verify these versions are still current:

```bash
npm view next version           # Expected: ~15.x
npm view react version          # Expected: ~19.x
npm view tailwindcss version    # Expected: ~3.4.x (check shadcn v4 compat)
npm view @supabase/supabase-js version  # Expected: ~2.x
npm view @supabase/ssr version  # Expected: ~0.5.x
npm view date-fns version       # Expected: ~4.x
npm view zod version            # Expected: ~3.x
npm view react-hook-form version # Expected: ~7.x
npm view nuqs version           # Expected: ~2.x
npm view next-themes version    # Expected: ~0.4.x
npm view sonner version         # Expected: ~1.x
```

If any major version has bumped (e.g., Next.js 16, Tailwind v4 with shadcn support), investigate breaking changes before adopting.

---

## Sources

- **Stack choices:** Based on established Next.js App Router + Supabase ecosystem patterns (training data through May 2025)
- **shadcn/ui:** Component model verified from extensive usage patterns; copy-paste architecture is stable
- **@supabase/ssr:** Confirmed replacement for deprecated auth-helpers via Supabase documentation patterns
- **date-fns vs dayjs:** Based on feature comparison, tree-shaking analysis, and TypeScript type quality
- **Gantt custom build rationale:** Based on analysis of available Gantt libraries (gantt-task-react, frappe-gantt, dhtmlxGantt) vs. project requirements

**Confidence caveat:** All version numbers are MEDIUM confidence. Verify with `npm view` before installing. Architectural recommendations and library choices are HIGH confidence -- these are mature patterns in the Next.js ecosystem.

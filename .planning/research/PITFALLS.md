# Domain Pitfalls

**Domain:** Client management dashboard (Next.js App Router + Supabase + Tailwind CSS)
**Researched:** 2026-02-07
**Confidence:** MEDIUM (based on training data; web search unavailable for latest verification)

---

## Critical Pitfalls

Mistakes that cause rewrites, data corruption, or fundamentally broken behavior.

---

### Pitfall 1: Supabase Client Instantiation — Multiple Clients, Stale Data, Memory Leaks

**What goes wrong:** Creating new Supabase client instances on every render or in every component. Each `createClient()` call spins up a new GoTrue/Realtime connection. In a React component tree, this leads to: (a) dozens of WebSocket connections, (b) stale data as different components talk to different client instances, (c) memory leaks as old clients are never cleaned up.

**Why it happens:** The Next.js App Router blurs the line between server and client code. Developers instinctively call `createClient()` wherever they need data, not realizing the client should be a singleton (browser) or request-scoped (server).

**Consequences:**
- Supabase rate-limits your connections (free tier: 200 concurrent)
- Components show inconsistent data
- Memory usage climbs over time in long-running browser sessions
- Auto-save triggers on stale client instances, silently failing or overwriting data

**Prevention:**
1. Create exactly ONE browser-side Supabase client using a singleton module pattern:
   ```typescript
   // lib/supabase/client.ts
   import { createBrowserClient } from '@supabase/ssr'

   let client: ReturnType<typeof createBrowserClient> | null = null

   export function getSupabaseClient() {
     if (!client) {
       client = createBrowserClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
       )
     }
     return client
   }
   ```
2. For Server Components/Route Handlers, use `createServerClient` from `@supabase/ssr` with cookies — these are request-scoped by design.
3. Never call `createClient` inside a component body or useEffect.

**Detection:** Watch browser DevTools Network tab for multiple WebSocket connections to `*.supabase.co`. If you see more than 1-2 realtime connections, you have this bug.

**Phase:** Foundation/Infrastructure (Phase 1). Get this right before building any features.

**Confidence:** HIGH — well-documented pattern in Supabase SSR docs.

---

### Pitfall 2: Hydration Mismatch with Date Formatting and Dark Mode

**What goes wrong:** Server renders dates in UTC (or server timezone) while client renders in `Europe/Amsterdam`. Server renders light mode while client reads `localStorage` for dark mode. Both cause React hydration mismatches, resulting in: flash of wrong content (FOUC), console errors, and sometimes broken interactivity.

**Why it happens:** Next.js App Router Server Components run on the server (Vercel = UTC timezone). The browser has `Europe/Amsterdam`. Date strings like "Maandag 10 februari 2025" will differ between server and client if the current date is near midnight CET (UTC+1/+2). Dark mode stored in `localStorage` is unavailable on the server.

**Consequences:**
- Dutch date header on homepage shows wrong day around midnight
- Dark mode flashes light then dark on every page load
- React hydration warnings flood the console
- In worst case, entire component trees re-mount, destroying client state (including unsaved edits)

**Prevention:**
1. **Dates:** Make all date-displaying components Client Components (`'use client'`). Do NOT server-render timezone-sensitive dates. Or, pass the formatted date string from a client-side computation.
2. **Dark mode:** Use the `class` strategy with a blocking `<script>` in the `<head>` that reads `localStorage` and sets the `dark` class BEFORE React hydrates:
   ```html
   <!-- In layout.tsx or a Script component with strategy="beforeInteractive" -->
   <script dangerouslySetInnerHTML={{ __html: `
     try {
       if (localStorage.getItem('theme') === 'dark' ||
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
         document.documentElement.classList.add('dark')
       }
     } catch (e) {}
   `}} />
   ```
3. **Alternatively for dark mode:** Use `next-themes` which handles this blocking script pattern automatically with `attribute="class"`.
4. **Never** use `suppressHydrationWarning` as a fix for date mismatches — it hides the symptom but the wrong date still flashes.

**Detection:** Load the page with browser cache cleared. Watch for any flash of content change. Check console for "Text content does not match server-rendered HTML."

**Phase:** Foundation (Phase 1). Dark mode and date formatting are infrastructure, not features.

**Confidence:** HIGH — this is the single most common Next.js App Router pitfall.

---

### Pitfall 3: date-fns Timezone Handling — The `date-fns-tz` Trap

**What goes wrong:** Using `date-fns` for date manipulation but getting timezone-unaware results. JavaScript `Date` objects are always in local time or UTC internally. `date-fns` functions like `startOfWeek`, `addDays`, `format` all operate on the Date object's internal timestamp. If the server is in UTC and you call `startOfWeek(new Date())` at 23:30 UTC on a Sunday, you get the PREVIOUS week's Monday — but in Amsterdam it is already Monday 00:30, so you want THIS week's Monday.

**Why it happens:** `date-fns` is timezone-unaware by design. The companion library `date-fns-tz` provides `utcToZonedTime` and `zonedTimeToUtc`, but these have subtle API issues: `utcToZonedTime` returns a Date object that "lies" — its internal UTC timestamp is shifted so that when you call `.getHours()` you get the Amsterdam hours, but the actual point-in-time it represents is wrong. This breaks any code that compares dates, stores them, or sends them to Supabase.

**Consequences:**
- Gantt chart bars shift by one day near midnight
- Overdue calculations are wrong around midnight CET (tasks appear overdue 1 day early or 1 day late)
- DST transitions (last Sunday of March, last Sunday of October) cause 1-hour shifts that can flip a date comparison
- Supabase stores the "lied-about" timestamp, corrupting your data permanently

**Prevention:**
1. **Store dates as DATE (not TIMESTAMP) in Supabase** for deadline, warmup_start_date, go_live_date. These are calendar dates, not points in time. A `DATE` column stores `2025-02-10` with no timezone ambiguity.
2. **Parse date strings, not Date objects.** When reading from Supabase, you get `"2025-02-10"`. Parse this with `parseISO("2025-02-10")` which creates a Date at midnight LOCAL time — exactly what you want for a calendar date.
3. **For "today" in Amsterdam:** Use a utility function:
   ```typescript
   import { TZDate } from '@date-fns/tz'  // date-fns v4+ approach
   // OR for date-fns v3:
   import { formatInTimeZone } from 'date-fns-tz'

   function getTodayAmsterdam(): string {
     // Returns "2025-02-10" string — no Date object ambiguity
     return formatInTimeZone(new Date(), 'Europe/Amsterdam', 'yyyy-MM-dd')
   }
   ```
4. **Compare dates as strings** for calendar-date logic: `"2025-02-10" < "2025-02-15"` works correctly with ISO date strings. No need for Date object comparison.
5. **For the overdue rolling mechanic specifically:**
   ```typescript
   const todayStr = getTodayAmsterdam() // "2025-02-10"
   const deadlineStr = task.deadline     // "2025-02-08" from Supabase
   const effectiveDeadline = deadlineStr < todayStr ? todayStr : deadlineStr
   const daysOverdue = deadlineStr < todayStr
     ? differenceInCalendarDays(parseISO(todayStr), parseISO(deadlineStr))
     : 0
   ```

**Detection:** Test your date logic at 23:00 UTC (midnight CET in winter, 01:00 CET in summer). If any dates are off by one day, you have this bug. Also test on the exact DST transition dates.

**Phase:** Foundation (Phase 1). Date handling must be correct before building Gantt or overdue logic.

**Confidence:** HIGH — this is THE most common date bug in JavaScript dashboards. The `date-fns-tz` "lying Date" issue is well-documented in their GitHub issues.

**Note on date-fns v4:** date-fns v4 introduced `TZDate` from `@date-fns/tz` which is a proper timezone-aware Date subclass. This is significantly better than the v3 `utcToZonedTime` approach. Verify the current version and API before implementation — my knowledge may be slightly stale here. **Confidence for v4 API specifics: LOW — verify with docs.**

---

### Pitfall 4: Auto-Save Race Conditions and Data Loss

**What goes wrong:** User edits field A, blurs (triggering save), immediately edits field B, blurs again. The second save overwrites the first if both send the full object. Or: the first save is still in-flight when the second fires, and Supabase returns them out of order, causing the second save to be overwritten by the first save's response updating local state.

**Why it happens:** Auto-save on blur is inherently a concurrent operation. Users tab between fields quickly. Network latency means saves overlap.

**Consequences:**
- Silent data loss — user thinks they saved field A, but field B's save overwrote it
- UI shows saved state, database has different state
- User trust erodes when they notice missing data
- Extremely hard to debug because it is timing-dependent

**Prevention:**
1. **Debounce saves with a queue, not per-field.** Collect all dirty fields into a single pending update. Use a debounce timer (300-500ms after last blur). Only send when the timer fires:
   ```typescript
   const dirtyFields = useRef<Partial<Company>>({})
   const saveTimer = useRef<NodeJS.Timeout>()

   function markDirty(field: string, value: any) {
     dirtyFields.current = { ...dirtyFields.current, [field]: value }
     clearTimeout(saveTimer.current)
     saveTimer.current = setTimeout(() => flushSave(), 500)
   }

   async function flushSave() {
     const updates = { ...dirtyFields.current }
     dirtyFields.current = {}
     await supabase.from('companies').update(updates).eq('id', companyId)
   }
   ```
2. **Use optimistic local state.** Never update local state from the save response. The local state IS the truth. The save just persists it.
3. **Show save status indicator:** "Opslaan..." (saving), "Opgeslagen" (saved), "Fout bij opslaan" (save error). Use a visible indicator that is NOT a toast (toasts disappear and can't be re-checked).
4. **Manual save button as fallback** must flush the pending queue immediately, not start a new save.
5. **Add `beforeunload` handler** to warn if there are dirty unsaved fields when navigating away.

**Detection:** Open the company detail page. Rapidly tab through 5 fields, changing each one. Check the database — are all 5 values correct? Do this on a throttled network (Chrome DevTools > Network > Slow 3G).

**Phase:** Company Detail Page (Phase 2/3). Must be designed correctly from the start.

**Confidence:** HIGH — well-known pattern in auto-save implementations.

---

### Pitfall 5: Gantt Chart Horizontal Scroll Performance Collapse

**What goes wrong:** The Gantt chart renders a column for every day in the visible range. With 50+ companies and a 90-day range, that is 4,500+ DOM cells. Every scroll event triggers re-renders. Performance drops below 30fps, the chart feels sluggish, and on lower-end devices it becomes unusable.

**Why it happens:** Naive Gantt implementations render the full grid. CSS-based horizontal scrolling recalculates layout on every scroll frame. React re-renders the entire grid on state changes (like hovering a task marker).

**Consequences:**
- Janky scrolling, especially horizontal
- Browser tab memory climbs to 500MB+
- Task markers become unclickable due to delayed rendering
- Users avoid the Gantt chart, defeating the core feature

**Prevention:**
1. **Use CSS transforms for positioning, not grid/table layout.** Position bars and markers with `transform: translateX(${dayOffset * dayWidth}px)` and `width: ${durationDays * dayWidth}px`. The browser's compositor handles transforms without layout recalculation.
2. **Virtualize columns.** Only render day columns that are currently visible. Use `IntersectionObserver` or manual scroll-position calculation to determine visible range. For a personal dashboard with likely <50 companies, row virtualization is less critical but column virtualization matters (timeline can span months).
3. **Memoize aggressively.** Each company row should be `React.memo()` with stable props. Task markers within a row should be memoized. The timeline header should be its own memoized component.
4. **Avoid state-on-scroll.** Do NOT store scroll position in React state. Use refs for scroll tracking. Only update state when scroll stops (for loading new date ranges).
5. **Fixed column width.** Each day = fixed pixel width (e.g., 40px). This makes all position calculations O(1) — just `dayIndex * 40`. Do not use percentage-based widths.

**Detection:** Open Chrome DevTools > Performance tab. Record while scrolling the Gantt chart horizontally. If any frames exceed 16ms, you have a performance issue. Look for "Layout" and "Paint" entries — these should be minimal during scroll.

**Phase:** Gantt Chart (Phase 2). Architecture decisions made here cannot be easily changed later.

**Confidence:** HIGH — standard performance patterns for timeline/Gantt UIs.

---

### Pitfall 6: Supabase Row-Level Security (RLS) — The Silent Data Leak or Silent Empty Query

**What goes wrong:** Two failure modes:
1. **RLS disabled:** All data is accessible to anyone with the anon key (which is in your client-side JavaScript, visible to anyone). Even for a personal dashboard, bots scan for exposed Supabase URLs.
2. **RLS enabled but no policy:** All queries return empty arrays. No error, just silently empty. Developer thinks the data is gone or the query is wrong, wastes hours debugging.

**Why it happens:** Supabase enables RLS on new tables by default (as of recent versions), but the default is "deny all" — meaning no `SELECT` policy = no rows returned. The anon key is designed to be public, and RLS is the security layer. Without RLS policies, either everything is exposed (RLS off) or nothing works (RLS on, no policies).

**Consequences:**
- Without RLS: Your client data (company names, email campaign details, go-live dates) is publicly accessible to anyone who finds your Supabase URL in the page source
- With RLS but no policies: Every query returns `[]`, you think your app is broken
- Wrong policies: Partial data leaks or intermittent empty results

**Prevention:**
1. **Enable RLS on every table.** Non-negotiable, even for personal projects.
2. **For a single-user, no-auth dashboard, use a simple service-role approach:**
   - Option A: Create a permissive policy that allows all operations for the anon role. This is acceptable for a personal tool but means anyone with the anon key has full access.
   - Option B (recommended): Use Supabase Edge Functions or Next.js API routes as a proxy. Client never talks directly to Supabase. API routes use the service_role key (server-side only, never exposed to browser). This keeps data private.
   - Option C: Use Supabase's API key restriction features to lock down access.
3. **Test RLS by querying your Supabase URL directly from curl** with the anon key. If you get data back, anyone can.
4. **Never put `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*` env vars.** The `NEXT_PUBLIC_` prefix means it ships to the browser.

**Detection:** After deployment, open the browser console on your deployed site. Copy the Supabase URL and anon key from the network requests. Use them in a curl command from a different machine. If you get data, your data is exposed.

**Phase:** Foundation/Database Setup (Phase 1). Must be decided before writing any data access code.

**Confidence:** HIGH — fundamental Supabase security model, extensively documented.

---

## Moderate Pitfalls

Mistakes that cause delays, incorrect behavior, or significant technical debt.

---

### Pitfall 7: Overdue Rolling — Client-Side Computation Inconsistencies

**What goes wrong:** The overdue rolling mechanic (`effective_deadline = max(deadline, today)`) is computed client-side at render time. If different components compute "today" at different moments (one at 23:59, another at 00:01 after midnight), tasks appear in inconsistent states. The homepage shows a task as on-time while the Gantt shows it as overdue.

**Why it happens:** `new Date()` is called independently in each component. Near midnight, these can span the date boundary. Additionally, if the tab stays open overnight, "today" is stale until refresh.

**Consequences:**
- Inconsistent overdue badges between views
- Tasks appear/disappear from the overdue list as components re-render
- User confusion about which tasks are actually overdue

**Prevention:**
1. **Compute "today" once per render cycle** at the top of the component tree and pass it down via React context or as a prop:
   ```typescript
   const TodayContext = createContext<string>('')

   function DashboardLayout({ children }) {
     const [today, setToday] = useState(() => getTodayAmsterdam())

     // Refresh at midnight Amsterdam time
     useEffect(() => {
       const checkMidnight = setInterval(() => {
         const now = getTodayAmsterdam()
         if (now !== today) setToday(now)
       }, 60_000) // check every minute
       return () => clearInterval(checkMidnight)
     }, [today])

     return (
       <TodayContext.Provider value={today}>
         {children}
       </TodayContext.Provider>
     )
   }
   ```
2. **Compute overdue state in a single utility function** that takes `today` as a parameter, not as an implicit dependency:
   ```typescript
   function computeTaskState(task: Task, today: string) {
     const isOverdue = task.deadline < today
     const effectiveDeadline = isOverdue ? today : task.deadline
     const daysOverdue = isOverdue
       ? differenceInCalendarDays(parseISO(today), parseISO(task.deadline))
       : 0
     return { effectiveDeadline, daysOverdue, isOverdue }
   }
   ```
3. **Never call `new Date()` or `Date.now()` inside the overdue computation.** Always use the context-provided `today`.

**Detection:** Open the dashboard at 23:55 local time. Wait for midnight. Check if the overdue counts update consistently across all views. Also: mock the date in tests and verify all components agree.

**Phase:** Homepage + Gantt (Phase 2-3). Design the context in Phase 1.

**Confidence:** HIGH — straightforward React state management issue.

---

### Pitfall 8: startOfWeek Locale Mismatch — Monday vs Sunday

**What goes wrong:** `date-fns` defaults to Sunday as the start of the week (US convention). The project requires Monday (European/Dutch convention). Forgetting to pass `{ weekStartsOn: 1 }` to functions like `startOfWeek`, `endOfWeek`, `eachWeekOfInterval`, `getWeek` causes the Gantt chart timeline to show weeks starting on Sunday, and the "current week" highlighting is wrong.

**Why it happens:** It is easy to forget the option on one of many call sites. `date-fns` does not have a global locale configuration — you must pass the option every time.

**Consequences:**
- Gantt chart week columns start on Sunday instead of Monday
- "This week" filter shows wrong date range
- Week numbers are off by one in some cases
- Dutch users find the interface confusing

**Prevention:**
1. **Wrap all week-related date-fns functions** in your own utility module that always passes `{ weekStartsOn: 1 }`:
   ```typescript
   // lib/date-utils.ts
   import { startOfWeek as _startOfWeek, endOfWeek as _endOfWeek } from 'date-fns'

   export const startOfWeek = (date: Date) =>
     _startOfWeek(date, { weekStartsOn: 1 })

   export const endOfWeek = (date: Date) =>
     _endOfWeek(date, { weekStartsOn: 1 })
   ```
2. **Import from your utility module, never directly from date-fns** for week-related functions.
3. **Add an ESLint rule or code review check** to flag direct imports of `startOfWeek`/`endOfWeek` from `date-fns`.
4. **Set the `nl` locale from `date-fns/locale/nl`** for formatting functions. The Dutch locale defaults to Monday starts, but only for formatting — computation functions still need the explicit option.

**Detection:** Look at the Gantt chart timeline header. Does the first column of each week row show "Ma" (Monday) or "Zo" (Sunday)?

**Phase:** Date Utilities Setup (Phase 1). Create the wrapper module before any feature uses dates.

**Confidence:** HIGH — extremely common date-fns pitfall, especially for European projects.

---

### Pitfall 9: Tailwind Dark Mode — Inconsistent Color Application

**What goes wrong:** Some components look correct in light mode but are unreadable in dark mode. White text on white background, or dark text on dark background. This happens gradually as features are added — each new component works in whichever mode the developer is testing in, but breaks in the other.

**Why it happens:** Tailwind's dark mode (`dark:` variant) requires explicitly specifying dark variants for every color utility. Miss one `dark:bg-gray-800` and you get a white card on a dark page. shadcn/ui helps by using CSS variables, but custom components or overrides often forget the dark variant.

**Consequences:**
- Unreadable text in one mode
- Invisible borders or dividers
- Charts/Gantt bars that lose contrast
- Professional appearance undermined

**Prevention:**
1. **Use shadcn/ui's CSS variable approach consistently.** Use semantic color names (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`) instead of raw Tailwind colors (`bg-white`, `text-gray-900`). These automatically adapt to dark mode.
2. **For custom colors (Gantt bars, status badges),** define CSS variables in both `:root` and `.dark`:
   ```css
   :root {
     --gantt-bar-warmup: 59 130 246;    /* blue-500 */
     --gantt-bar-active: 34 197 94;     /* green-500 */
     --overdue-badge: 239 68 68;        /* red-500 */
   }
   .dark {
     --gantt-bar-warmup: 96 165 250;    /* blue-400 - lighter for dark bg */
     --gantt-bar-active: 74 222 128;    /* green-400 */
     --overdue-badge: 248 113 113;      /* red-400 */
   }
   ```
3. **Test both modes after every component.** Not at the end. Add a keyboard shortcut (Ctrl+D or similar) to toggle quickly during development.
4. **Never use hardcoded white/black** except for true white/black overlays. Always use theme-aware alternatives.

**Detection:** Toggle dark mode. Scan every component. Any text that disappears or becomes hard to read indicates a missing `dark:` variant or a hardcoded color.

**Phase:** Every phase. Set up the theme variables in Phase 1, but this is an ongoing discipline.

**Confidence:** HIGH — universal Tailwind dark mode issue.

---

### Pitfall 10: Next.js App Router — Unnecessary Client Components

**What goes wrong:** Marking too many components as `'use client'` because they use event handlers or state. This pushes all their children to the client too, defeating the purpose of Server Components. The entire page becomes a client-side React app with none of the App Router benefits.

**Why it happens:** Any component that uses `useState`, `useEffect`, `onClick`, or browser APIs must be a Client Component. Developers mark parent layout components as `'use client'` to use a single state variable, dragging the entire subtree to the client.

**Consequences:**
- Larger JavaScript bundles shipped to the browser
- Slower initial page load
- Loss of server-side data fetching benefits
- Supabase queries run client-side (exposing anon key, adding latency)

**Prevention:**
1. **Push `'use client'` to the leaves.** The interactive toggle button is a Client Component. The page layout wrapping it is a Server Component.
2. **Pattern: Server Component fetches data, passes to Client Component for interactivity:**
   ```typescript
   // app/page.tsx (Server Component)
   export default async function HomePage() {
     const tasks = await fetchTasks() // server-side Supabase call
     return <TaskList tasks={tasks} /> // Client Component for interactivity
   }

   // components/TaskList.tsx
   'use client'
   export function TaskList({ tasks }: { tasks: Task[] }) {
     // interactive logic here
   }
   ```
3. **For this project:** The homepage, Gantt chart, and company detail pages all need interactivity. The question is WHERE the client boundary sits. Fetch data in Server Components (or route handlers), pass serialized data to Client Components.
4. **Exception:** If you use client-side Supabase exclusively (which may be simpler for this single-user dashboard), everything is a Client Component anyway. This is a valid architectural choice — just be intentional about it.

**Detection:** Check the browser's JavaScript bundle size. If it is >500KB for a simple dashboard, too much is client-side. Also: search the codebase for `'use client'` — if it is in layout files or page files, reconsider.

**Phase:** Foundation (Phase 1). Component boundary decisions cascade through the entire app.

**Confidence:** HIGH — fundamental Next.js App Router pattern.

---

### Pitfall 11: Gantt Chart Date-to-Pixel Mapping Edge Cases

**What goes wrong:** The Gantt chart maps calendar dates to pixel positions. Edge cases that break the mapping:
- **DST transitions:** In `Europe/Amsterdam`, clocks spring forward on the last Sunday of March (losing an hour) and fall back on the last Sunday of October (gaining an hour). If you calculate day widths using hour-based math (`(endDate - startDate) / (24*60*60*1000)`), DST transition days are 23 or 25 hours, causing bars to be slightly too narrow or too wide.
- **Warmup bars spanning the new year:** December 28 to January 11 crosses a year boundary. If week calculation uses year-based logic, the bar may break.
- **Zero-duration bars:** If warmup_start_date equals go_live_date, the bar has zero width and is invisible.
- **Bars starting before the visible range:** A bar from January 1 to February 15 should still be visible when the viewport shows February 1-28, but only the February portion.

**Why it happens:** Date math is deceptively complex. Simple subtraction works for most dates but fails on edge cases.

**Consequences:**
- Bars misaligned by 1 pixel (minor but looks unprofessional)
- Bars disappear at DST transitions
- Task markers appear at wrong positions
- Company rows show no bar when dates are at extremes

**Prevention:**
1. **Use calendar-day-based positioning, not timestamp-based.** Map each date to a day index: `dayIndex = differenceInCalendarDays(date, timelineStartDate)`. Pixel position = `dayIndex * dayWidth`. This ignores DST entirely because `differenceInCalendarDays` counts calendar days, not hours.
2. **Handle edge cases explicitly:**
   ```typescript
   function getBarGeometry(warmupStart: string, goLive: string, timelineStart: string, dayWidth: number) {
     const startIdx = differenceInCalendarDays(parseISO(warmupStart), parseISO(timelineStart))
     const endIdx = differenceInCalendarDays(parseISO(goLive), parseISO(timelineStart))
     const duration = endIdx - startIdx

     // Minimum 1-day width for visibility
     const width = Math.max(duration, 1) * dayWidth
     const left = startIdx * dayWidth

     return { left, width }
   }
   ```
3. **Clip bars to the visible range** for rendering, but keep the full geometry for click targets.
4. **Test with dates spanning: DST transitions, year boundaries, month boundaries, same start/end date.**

**Detection:** Visually inspect bars that span March 26-31 and October 25-31 (DST transition weeks in Netherlands). Check if bar widths match expected day counts.

**Phase:** Gantt Chart (Phase 2). Core to the Gantt's correctness.

**Confidence:** HIGH — fundamental date-to-pixel math.

---

### Pitfall 12: Dutch Date Formatting — Incorrect Locale Application

**What goes wrong:** Date formatting shows English month/day names instead of Dutch, or shows US date order (Month Day, Year) instead of European (Day Month Year). The `format` function from date-fns defaults to English.

**Why it happens:** `date-fns` requires passing the locale object explicitly to `format()`. There is no global locale setting. Every `format()` call site must include `{ locale: nl }`.

**Consequences:**
- Dashboard shows "Monday" instead of "Maandag"
- Months show as "February" instead of "februari"
- Dates show as "02/10/2025" instead of "10 februari 2025"
- Inconsistent language (some dates Dutch, some English)

**Prevention:**
1. **Create a wrapper function:**
   ```typescript
   import { format as fnsFormat } from 'date-fns'
   import { nl } from 'date-fns/locale'

   export function formatDate(date: Date | string, formatStr: string): string {
     const d = typeof date === 'string' ? parseISO(date) : date
     return fnsFormat(d, formatStr, { locale: nl })
   }
   ```
2. **Define format constants:**
   ```typescript
   export const DATE_FORMATS = {
     full: 'EEEE d MMMM yyyy',        // "maandag 10 februari 2025"
     short: 'd MMM yyyy',              // "10 feb 2025"
     dayMonth: 'd MMMM',               // "10 februari"
     ganttHeader: 'EEE d',             // "ma 10"
     iso: 'yyyy-MM-dd',                // "2025-02-10" (for Supabase)
   }
   ```
3. **Never import `format` directly from `date-fns`** in feature code. Always use the wrapper.
4. **Note:** Dutch `format` output uses lowercase for months and days ("februari", not "Februari"). If you need capitalization for headers, explicitly capitalize the first letter.

**Detection:** Grep the codebase for direct imports of `format` from `date-fns`. Each one is a potential locale bug.

**Phase:** Date Utilities (Phase 1). Define once, use everywhere.

**Confidence:** HIGH — standard date-fns locale pattern.

---

## Minor Pitfalls

Mistakes that cause annoyance or small amounts of rework.

---

### Pitfall 13: Supabase `.single()` vs `.maybeSingle()` — Unexpected Errors

**What goes wrong:** Using `.single()` when querying by ID. If the row does not exist (deleted, wrong ID), `.single()` throws an error instead of returning null. This crashes the page instead of showing a "not found" state.

**Prevention:**
- Use `.maybeSingle()` for queries that might return no rows (company detail page by ID)
- Use `.single()` only when zero results is genuinely an error condition
- Always handle the `error` property from Supabase responses

**Phase:** Any phase with data fetching.

**Confidence:** HIGH — documented Supabase behavior.

---

### Pitfall 14: Supabase Cascade Delete Not Set Up

**What goes wrong:** Deleting a company leaves orphaned tasks in the database. The tasks reference a company_id that no longer exists. Future queries may error or return incomplete data.

**Prevention:**
- Set `ON DELETE CASCADE` on the `tasks.company_id` foreign key in your migration:
  ```sql
  ALTER TABLE tasks
  ADD CONSTRAINT tasks_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(id)
  ON DELETE CASCADE;
  ```
- Test by creating a company with tasks, deleting the company, and verifying tasks are gone.

**Phase:** Database Schema (Phase 1).

**Confidence:** HIGH — standard relational database pattern.

---

### Pitfall 15: Auto-Save Indicator Not Visible During Save

**What goes wrong:** The save indicator shows "Opgeslagen" (saved) but the save actually failed silently. Supabase returns `{ error: { message: "..." } }` but the code only checks for thrown exceptions, not the error property.

**Prevention:**
- Always check Supabase response for both thrown errors and returned error objects:
  ```typescript
  const { error } = await supabase.from('companies').update(updates).eq('id', id)
  if (error) {
    setSaveStatus('error')
    console.error('Save failed:', error.message)
    return
  }
  setSaveStatus('saved')
  ```
- Show distinct visual states: idle, saving (spinner), saved (checkmark), error (red warning)
- On error, keep the dirty state so the user can retry

**Phase:** Company Detail (Phase 2-3).

**Confidence:** HIGH — common Supabase error handling pattern.

---

### Pitfall 16: Gantt Chart Overlay/Popover Z-Index Wars

**What goes wrong:** Task marker click opens an overlay/popover. But the overlay appears behind the next company row, behind the timeline header, or behind the horizontal scrollbar. Multiple z-index fixes lead to an escalating z-index war where values reach `z-[9999]`.

**Prevention:**
- Use a single popover/overlay system (shadcn/ui's `Popover` or `Dialog`)
- Render overlays in a portal (outside the scrolling container)
- Define a z-index scale in Tailwind config:
  ```typescript
  // tailwind.config.ts
  theme: {
    extend: {
      zIndex: {
        'gantt-bar': '10',
        'gantt-marker': '20',
        'gantt-header': '30',
        'popover': '40',
        'modal': '50',
      }
    }
  }
  ```
- Never use arbitrary z-index values in components

**Phase:** Gantt Chart (Phase 2).

**Confidence:** HIGH — universal UI layering issue.

---

### Pitfall 17: Vercel Deployment — Environment Variables Not Set

**What goes wrong:** App works locally but shows blank page on Vercel. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local` but not in Vercel's environment variables dashboard. The build succeeds (no build error for missing env vars), but runtime crashes silently.

**Prevention:**
- Set environment variables in Vercel dashboard BEFORE first deployment
- Add validation in your Supabase client initialization:
  ```typescript
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables. Check Vercel settings.')
  }
  ```
- Add `.env.local` to `.gitignore` (should be there by default)
- Create `.env.example` listing required variables (without values)

**Phase:** Deployment (Phase 1 or final phase).

**Confidence:** HIGH — standard Vercel deployment issue.

---

### Pitfall 18: Gantt Today Line Drift

**What goes wrong:** The "today" indicator line on the Gantt chart is calculated once on mount and never updates. If the user keeps the tab open past midnight, the line stays on yesterday. Combined with the overdue rolling pitfall (Pitfall 7), the Gantt shows yesterday's "today" line while the overdue calculations use today's date, creating visual contradiction.

**Prevention:**
- Use the same `TodayContext` from Pitfall 7 for the today line position
- When `today` updates at midnight, the today line automatically moves
- Also recalculate on tab focus (`visibilitychange` event) to handle laptop sleep/wake

**Phase:** Gantt Chart (Phase 2). Depends on the TodayContext from Phase 1.

**Confidence:** HIGH — straightforward but easy to forget.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Database Schema | Pitfall 14: Missing cascade deletes | Define foreign keys with `ON DELETE CASCADE` from the start |
| Database Schema | Pitfall 6: RLS misconfiguration | Enable RLS, add policies, test with anon key from external source |
| Date Utilities | Pitfall 3: Timezone-unaware date math | Use DATE columns, string comparison, `getTodayAmsterdam()` utility |
| Date Utilities | Pitfall 8: Week starts on Sunday | Wrapper functions with `weekStartsOn: 1` |
| Date Utilities | Pitfall 12: English date formatting | Wrapper with `locale: nl` baked in |
| Supabase Client | Pitfall 1: Multiple client instances | Singleton pattern for browser, request-scoped for server |
| Dark Mode | Pitfall 2: Hydration flash | Blocking script in `<head>` or `next-themes` |
| Dark Mode | Pitfall 9: Missing dark variants | Use semantic CSS variables, not raw colors |
| Gantt Chart | Pitfall 5: Scroll performance | Transform-based positioning, column virtualization |
| Gantt Chart | Pitfall 11: Date-to-pixel edge cases | Calendar-day-based positioning, DST-safe math |
| Gantt Chart | Pitfall 16: Z-index wars | Portal-based overlays, z-index scale |
| Gantt Chart | Pitfall 18: Today line drift | TodayContext shared with overdue logic |
| Overdue Logic | Pitfall 7: Inconsistent "today" | Single TodayContext, midnight refresh |
| Auto-Save | Pitfall 4: Race conditions | Debounced queue, optimistic local state |
| Auto-Save | Pitfall 15: Silent save failures | Check Supabase error property, visible status indicator |
| Data Fetching | Pitfall 13: `.single()` crashes | Use `.maybeSingle()` for lookups |
| Deployment | Pitfall 17: Missing env vars | Validate at initialization, `.env.example` file |
| Component Architecture | Pitfall 10: Client Component overuse | Push `'use client'` to leaves |

## Prioritized Prevention Strategy

**Phase 1 (Foundation) must address these pitfalls proactively:**
1. Supabase client singleton pattern (Pitfall 1)
2. Database schema with RLS and cascade deletes (Pitfalls 6, 14)
3. Date utility wrappers: timezone, locale, week start (Pitfalls 3, 8, 12)
4. Dark mode blocking script (Pitfall 2)
5. TodayContext for consistent "today" (Pitfall 7)
6. Component boundary strategy (Pitfall 10)
7. Environment variable validation (Pitfall 17)

**Phase 2 (Gantt Chart) must address:**
1. Transform-based bar positioning (Pitfall 5)
2. Calendar-day date-to-pixel mapping (Pitfall 11)
3. Z-index scale and portal overlays (Pitfall 16)
4. Today line using TodayContext (Pitfall 18)

**Phase 3 (Company Detail / Auto-Save) must address:**
1. Debounced save queue with race condition prevention (Pitfall 4)
2. Save error handling and status display (Pitfall 15)
3. Theme-aware custom colors for all components (Pitfall 9)

## Sources

- Supabase SSR documentation (createBrowserClient / createServerClient patterns) — HIGH confidence
- date-fns documentation (locale, weekStartsOn options) — HIGH confidence
- Next.js App Router documentation (Server vs Client Components) — HIGH confidence
- Tailwind CSS dark mode documentation (class strategy) — HIGH confidence
- Training data on common dashboard/Gantt implementation patterns — MEDIUM confidence (not verified against current docs due to unavailable web search)
- date-fns v4 TZDate API — LOW confidence (verify current API before using)

export type CategorySlug =
  | 'werk'
  | 'sport'
  | 'piano'
  | 'schaken'
  | 'peterson'
  | 'kamer'

export type Category = {
  slug: CategorySlug
  label: string
  weekly_minutes: number
  weekly_count: number | null
  default_block: number
  sort_order: number
}

export type Settings = {
  wake_minute: number
  sleep_minute: number
  daily_work_minutes: number
}

export type Block = {
  id: string
  day: string
  category: CategorySlug
  start_minute: number | null
  duration_minutes: number
  note: string | null
  done: boolean
  auto: boolean
}

export type DayRow = {
  day: string
  no_shorts: boolean | null
  no_youtube: boolean | null
  room_cleaned: boolean | null
  no_oversleep: boolean | null
  note: string | null
}

/**
 * Kleur per categorie. Bewust in code en niet in de database: dit is
 * vormgeving, geen data. Elke categorie heeft een neonkleur die zowel
 * als rand, vulling als gloed gebruikt wordt.
 */
export const CATEGORY_COLOR: Record<CategorySlug, string> = {
  werk: '#22d3ee', // cyaan
  sport: '#fb7185', // rood
  piano: '#a78bfa', // violet
  schaken: '#fbbf24', // amber
  peterson: '#34d399', // groen
  kamer: '#94a3b8', // grijsblauw
}

export const CATEGORY_GLYPH: Record<CategorySlug, string> = {
  werk: '◆',
  sport: '▲',
  piano: '♪',
  schaken: '♞',
  peterson: '✦',
  kamer: '◼',
}

/** De no-go's die je achteraf per dag afvinkt. */
export const NO_GOS = [
  { key: 'no_shorts', label: 'Geen shorts' },
  { key: 'no_youtube', label: "Geen YouTube-video's", hint: 'podcasts uitgezonderd' },
  { key: 'no_oversleep', label: 'Niet verslapen' },
  { key: 'room_cleaned', label: 'Kamer opgeruimd', onlyWhenScheduled: 'kamer' },
] as const

export type NoGoKey = (typeof NO_GOS)[number]['key']

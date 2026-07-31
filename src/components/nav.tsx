'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/', label: 'Vandaag', glyph: '◈' },
  { href: '/week', label: 'Week', glyph: '▤' },
  { href: '/instellingen', label: 'Instellingen', glyph: '⚙' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-bg/90 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-lg">
        {ITEMS.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' || pathname.startsWith('/dag') : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-1 py-3 active:scale-95"
              style={{ color: active ? 'var(--color-accent)' : 'var(--color-dim)' }}
            >
              {active && (
                <span className="absolute top-0 h-px w-10 bg-accent shadow-[0_0_10px_var(--color-accent)]" />
              )}
              <span className="text-base leading-none">{item.glyph}</span>
              <span className="text-[0.625rem] tracking-wide uppercase">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

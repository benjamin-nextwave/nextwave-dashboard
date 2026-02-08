'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/gantt', label: 'Gantt' },
  { href: '/bedrijven', label: 'Bedrijven' },
  { href: '/kalender', label: 'Kalender' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6 border-b border-border px-6 py-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors',
            pathname === item.href
              ? 'text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground/80'
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

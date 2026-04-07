'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Taken vandaag', icon: '🏰' },
  { href: '/alle-taken', label: 'Alle taken', icon: '📋' },
  { href: '/onboarding', label: 'Onboarding', icon: '🛡️' },
  { href: '/bedrijven', label: 'Bedrijven', icon: '⚔️' },
  { href: '/kalender', label: 'Kalender', icon: '📅' },
  { href: '/planning', label: 'Planning', icon: '🗺️' },
  { href: '/vragen', label: 'Vragen', icon: '❓' },
  { href: '/berichten', label: 'Berichten', icon: '📨' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      className="relative overflow-hidden px-6 py-0"
      style={{
        background: 'linear-gradient(180deg, rgba(139,109,56,0.15) 0%, rgba(139,109,56,0.05) 100%)',
        borderBottom: '2px solid rgba(139,109,56,0.25)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,109,56,0.4), transparent)' }}
      />

      <div className="flex items-center gap-1">
        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center gap-2 py-3">
          <span className="text-2xl">⚔️</span>
          <span
            className="text-lg font-bold tracking-wide hidden sm:inline"
            style={{ color: '#4a3a20', fontFamily: 'var(--font-fraktur)' }}
          >
            NextWave
          </span>
        </Link>

        {/* Separator */}
        <div className="h-8 w-px mr-2" style={{ background: 'rgba(139,109,56,0.25)' }} />

        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-3.5 text-sm transition-all duration-200',
              )}
              style={{
                fontFamily: 'var(--font-medieval)',
                color: isActive ? '#2a1f0e' : '#8b7d60',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
              {isActive && (
                <span
                  className="absolute inset-x-1 -bottom-px h-0.5 rounded-full"
                  style={{ background: '#8b6d38' }}
                />
              )}
            </Link>
          )
        })}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,109,56,0.3), transparent)' }}
      />
    </nav>
  )
}

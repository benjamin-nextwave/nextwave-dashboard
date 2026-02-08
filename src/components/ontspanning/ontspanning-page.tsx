'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useToday } from '@/lib/today-provider'
import {
  getTodayTasksWithCompany,
  filterTodayTasks,
} from '@/lib/homepage'

const ACTIVITIES = [
  {
    emoji: '\u{1F3B9}',
    title: 'Piano spelen',
    subtitle: 'Oefen een nieuw stuk of speel je favorieten',
    gradient: 'from-violet-500 to-purple-600',
    darkGradient: 'dark:from-violet-600 dark:to-purple-800',
  },
  {
    emoji: '\u{1F4AA}',
    title: 'Sporten',
    subtitle: 'Beweeg je lijf, verdien die endorfines',
    gradient: 'from-rose-500 to-pink-600',
    darkGradient: 'dark:from-rose-600 dark:to-pink-800',
  },
  {
    emoji: '\u{265F}\u{FE0F}',
    title: 'Schaken',
    subtitle: 'Train je brein met een potje schaak',
    gradient: 'from-amber-500 to-orange-600',
    darkGradient: 'dark:from-amber-600 dark:to-orange-800',
  },
  {
    emoji: '\u{1F3AC}',
    title: 'Documentaire',
    subtitle: 'Leer iets nieuws, ontspan je geest',
    gradient: 'from-cyan-500 to-blue-600',
    darkGradient: 'dark:from-cyan-600 dark:to-blue-800',
  },
  {
    emoji: '\u{1F393}',
    title: 'Peterson Academy',
    subtitle: 'Investeer in jezelf met een les',
    gradient: 'from-emerald-500 to-teal-600',
    darkGradient: 'dark:from-emerald-600 dark:to-teal-800',
  },
]

const QUOTES = [
  'Discipline is de brug tussen doelen en prestaties.',
  'Succes is de som van kleine inspanningen, dag in dag uit herhaald.',
  'Het geheim van vooruitgang is beginnen.',
  'Elke expert was ooit een beginner.',
  'De beste investering die je kunt doen, is in jezelf.',
  'Wie niet waagt, die niet wint.',
  'Groei begint waar je comfortzone eindigt.',
  'Vandaag is een goede dag om iets geweldigs te doen.',
  'Je hoeft niet perfect te zijn om geweldig te zijn.',
  'Kleine stappen leiden tot grote veranderingen.',
]

export function OntspanningPage() {
  const router = useRouter()
  const today = useToday()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [visible, setVisible] = useState(false)

  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    []
  )

  const checkAccess = useCallback(async () => {
    try {
      const raw = await getTodayTasksWithCompany(today)
      const filtered = filterTodayTasks(raw, today)
      if (filtered.length === 0) {
        router.replace('/')
        return
      }
      const allDone = filtered.every((t) => t.task.is_completed)
      if (!allDone) {
        router.replace('/')
        return
      }
      setAuthorized(true)
    } catch {
      router.replace('/')
    } finally {
      setChecking(false)
    }
  }, [today, router])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  // Trigger entrance animation after mount
  useEffect(() => {
    if (authorized) {
      const timer = setTimeout(() => setVisible(true), 50)
      return () => clearTimeout(timer)
    }
  }, [authorized])

  if (checking || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 via-50% to-orange-400 dark:from-purple-900 dark:via-pink-900 dark:via-50% dark:to-orange-900">
      {/* Confetti dots */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 animate-bounce"
            style={{
              width: `${6 + Math.random() * 10}px`,
              height: `${6 + Math.random() * 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399', '#fb923c', '#60a5fa'][i % 6],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="size-4" />
          Terug naar dashboard
        </Link>

        {/* Heading */}
        <div
          className={`text-center transition-all duration-700 ease-out ${
            visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Alle taken afgerond! {'\u{1F389}'}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 font-medium">
            Tijd voor iets leuks. Kies je avontuur:
          </p>
        </div>

        {/* Activity cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ACTIVITIES.map((activity, i) => (
            <div
              key={activity.title}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${activity.gradient} ${activity.darkGradient} p-6 shadow-lg cursor-default transition-all duration-500 ease-out hover:scale-[1.04] hover:shadow-2xl ${
                visible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{
                transitionDelay: visible ? `${200 + i * 100}ms` : '0ms',
              }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-2xl" />
              <div className="relative">
                <span className="text-4xl">{activity.emoji}</span>
                <h3 className="mt-3 text-xl font-bold text-white">
                  {activity.title}
                </h3>
                <p className="mt-1 text-sm text-white/80">
                  {activity.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div
          className={`mt-16 text-center transition-all duration-700 ease-out ${
            visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: visible ? '900ms' : '0ms' }}
        >
          <p className="text-white/60 italic text-sm leading-relaxed max-w-md mx-auto">
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {/* Bottom link */}
        <div
          className={`mt-8 text-center transition-all duration-700 ease-out ${
            visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: visible ? '1000ms' : '0ms' }}
        >
          <Link
            href="/"
            className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
          >
            Terug naar dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

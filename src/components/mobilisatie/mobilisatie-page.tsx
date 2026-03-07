'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Torches } from './torches'
import { VictoryBanner } from './victory-banner'
import { SealCheckbox } from './seal-checkbox'

interface Bevel {
  id: string
  generaal: string
  avatar: string
  taak: string
  quote: string
}

const BEVELEN: Bevel[] = [
  {
    id: 'napoleon',
    generaal: 'Napoleon',
    avatar: '📜',
    taak: 'Check de mailbox voor taken',
    quote: '"Onmogelijk is een woord dat alleen in het woordenboek van dwazen te vinden is."',
  },
  {
    id: 'caesar',
    generaal: 'Julius Caesar',
    avatar: '⚔️',
    taak: 'Check de onboarding bedrijven',
    quote: '"Veni, vidi, vici."',
  },
  {
    id: 'alexander',
    generaal: 'Alexander de Grote',
    avatar: '🗺️',
    taak: 'Check de planning pagina voor 2-weekse updates',
    quote: '"Er is niets onmogelijks voor hem die het probeert."',
  },
  {
    id: 'churchill',
    generaal: 'Churchill',
    avatar: '🎖️',
    taak: 'Check de lijst van Kix',
    quote: '"Succes is niet definitief, falen is niet fataal: het is de moed om door te gaan die telt."',
  },
]

const MARGIN_DECORATIONS = ['⚔️', '🛡️', '🦅', '🗺️', '⚜️', '🏰']

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getAnnoDomini(): string {
  const d = new Date()
  const months = [
    'Januarius', 'Februarius', 'Martius', 'Aprilis', 'Maius', 'Junius',
    'Julius', 'Augustus', 'September', 'October', 'November', 'December',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function MobilisatiePage() {
  const todayKey = getTodayKey()
  const storageKey = `mobilisatie-${todayKey}`

  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [showQuote, setShowQuote] = useState<string | null>(null)
  const [muted, setMuted] = useState(true)
  const [hasPlayedFanfare, setHasPlayedFanfare] = useState(false)

  // Load state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setCompleted(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [storageKey])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completed))
  }, [completed, storageKey])

  // Play fanfare when sound is turned on
  useEffect(() => {
    if (!muted && !hasPlayedFanfare) {
      playFanfare()
      setHasPlayedFanfare(true)
    }
  }, [muted, hasPlayedFanfare])

  function playFanfare() {
    try {
      const ctx = new AudioContext()
      // Heroic trumpet fanfare: C-E-G-C (rising)
      const notes = [261.63, 329.63, 392.00, 523.25]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.2
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t)
        osc.stop(t + 0.5)
      })
    } catch { /* audio not supported */ }
  }

  function playSealBreak() {
    if (muted) return
    try {
      const ctx = new AudioContext()
      // Short "crack" sound for breaking the seal
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(200, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)

      // Follow-up "ding" for satisfaction
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.value = 880
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.1)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.1)
      osc2.stop(ctx.currentTime + 0.6)
    } catch { /* audio not supported */ }
  }

  const toggleBevel = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      return next
    })
  }, [])

  const handleToggle = useCallback((bevel: Bevel) => {
    const wasCompleted = completed[bevel.id]
    toggleBevel(bevel.id)

    if (!wasCompleted) {
      playSealBreak()
      setShowQuote(bevel.id)
      setTimeout(() => setShowQuote(null), 3000)
    }
  }, [completed, toggleBevel])

  const completedCount = BEVELEN.filter((b) => completed[b.id]).length
  const progress = (completedCount / BEVELEN.length) * 100
  const allDone = completedCount === BEVELEN.length

  const marginIcons = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      icon: MARGIN_DECORATIONS[i % MARGIN_DECORATIONS.length],
      top: 8 + i * 8,
      side: i % 2 === 0 ? 'left' : 'right',
      rotation: Math.floor(Math.random() * 40) - 20,
    }))
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Torches */}
      <Torches />

      {/* Parchment page */}
      <div className="relative mx-auto my-8 max-w-3xl">
        {/* Parchment background */}
        <div
          className="relative rounded-sm px-10 py-12 md:px-16 md:py-16"
          style={{
            background: 'linear-gradient(145deg, #f4e4c1 0%, #e8d5a3 25%, #f0deb8 50%, #e2cfa0 75%, #f4e4c1 100%)',
            boxShadow: '0 0 40px rgba(0,0,0,0.3), inset 0 0 80px rgba(139,109,56,0.15)',
            border: '2px solid #c4a86b',
          }}
        >
          {/* Burn marks */}
          <div className="absolute top-3 right-8 w-16 h-16 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #4a3520 0%, transparent 70%)' }} />
          <div className="absolute bottom-12 left-6 w-12 h-12 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #3a2510 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 right-4 w-8 h-8 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #5a4530 0%, transparent 70%)' }} />

          {/* Coffee/ink stain */}
          <div className="absolute bottom-24 right-16 w-20 h-20 rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(ellipse 60% 80%, #2a1505 0%, transparent 70%)' }} />

          {/* Torn edge effect (top) */}
          <div className="absolute -top-1 inset-x-0 h-3 overflow-hidden">
            <svg viewBox="0 0 800 12" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,12 L0,4 Q20,8 40,3 Q60,0 80,5 Q100,8 120,2 Q140,6 160,4 Q180,1 200,6 Q220,9 240,3 Q260,0 280,5 Q300,7 320,2 Q340,5 360,4 Q380,1 400,6 Q420,9 440,3 Q460,0 480,5 Q500,8 520,3 Q540,6 560,2 Q580,5 600,4 Q620,1 640,6 Q660,8 680,3 Q700,0 720,5 Q740,7 760,3 Q780,6 800,4 L800,12 Z"
                fill="#f4e4c1" />
            </svg>
          </div>

          {/* Torn edge effect (bottom) */}
          <div className="absolute -bottom-1 inset-x-0 h-3 overflow-hidden rotate-180">
            <svg viewBox="0 0 800 12" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,12 L0,4 Q20,7 40,2 Q60,0 80,6 Q100,9 120,3 Q140,5 160,4 Q180,0 200,7 Q220,9 240,2 Q260,5 280,4 Q300,1 320,6 Q340,8 360,3 Q380,0 400,5 Q420,8 440,2 Q460,5 480,4 Q500,1 520,7 Q540,9 560,3 Q580,5 600,4 Q620,0 640,6 Q660,9 680,3 Q700,5 720,2 Q740,7 760,4 Q780,1 800,5 L800,12 Z"
                fill="#f4e4c1" />
            </svg>
          </div>

          {/* Margin decorations */}
          {marginIcons.map((dec, i) => (
            <div
              key={i}
              className="absolute text-xl opacity-15 select-none hidden md:block"
              style={{
                top: `${dec.top}%`,
                [dec.side as 'left' | 'right']: dec.side === 'left' ? '8px' : '8px',
                transform: `rotate(${dec.rotation}deg)`,
              }}
            >
              {dec.icon}
            </div>
          ))}

          {/* Mute button */}
          <button
            onClick={() => { setMuted(!muted); setHasPlayedFanfare(false) }}
            className="absolute top-4 right-4 text-lg opacity-50 hover:opacity-100 transition-opacity z-10"
            title={muted ? 'Geluid aan' : 'Geluid uit'}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* Header */}
          <div className="text-center mb-10 space-y-3">
            <p className="text-sm tracking-[0.3em] uppercase"
              style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}>
              Anno Domini {getAnnoDomini()}
            </p>
            <h1
              className="text-3xl md:text-4xl leading-tight"
              style={{ color: '#2a1f0e', fontFamily: 'var(--font-fraktur)' }}
            >
              Dagelijks Mobilisatiebevel
            </h1>
            <p
              className="text-xl"
              style={{ color: '#4a3a20', fontFamily: 'var(--font-medieval)' }}
            >
              — Veldmaarschalk —
            </p>
            <div className="flex justify-center">
              <div className="w-48 h-px mt-2" style={{ background: 'linear-gradient(90deg, transparent, #8b6d38, transparent)' }} />
            </div>
          </div>

          {/* Watermark map decoration */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
            <span className="text-[200px]">🗺️</span>
          </div>

          {/* Subtitle */}
          <p
            className="text-center text-base mb-8 italic"
            style={{ color: '#5a4a30', fontFamily: 'var(--font-medieval)' }}
          >
            De volgende bevelen dienen met de hoogste urgentie uitgevoerd te worden:
          </p>

          {/* Bevelen (Orders) */}
          <div className="space-y-6 relative z-10">
            {BEVELEN.map((bevel, index) => {
              const isDone = !!completed[bevel.id]
              const isShowingQuote = showQuote === bevel.id

              return (
                <div
                  key={bevel.id}
                  className={cn(
                    'relative rounded-lg p-5 transition-all duration-500',
                    isDone && 'opacity-60'
                  )}
                  style={{
                    background: isDone
                      ? 'linear-gradient(135deg, rgba(139,109,56,0.08), rgba(139,109,56,0.04))'
                      : 'linear-gradient(135deg, rgba(139,109,56,0.12), rgba(139,109,56,0.05))',
                    border: '1px solid rgba(139,109,56,0.2)',
                    cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 32 32'%3E%3Ctext x='0' y='26' font-size='26'%3E%F0%9F%AA%B6%3C/text%3E%3C/svg%3E\") 14 4, pointer",
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Order number */}
                    <div
                      className="flex-shrink-0 text-sm font-bold mt-1"
                      style={{ color: '#8b6d38', fontFamily: 'var(--font-medieval)' }}
                    >
                      {['I', 'II', 'III', 'IV'][index]}.
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0 text-3xl mt-0.5">
                      {bevel.avatar}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-sm font-bold tracking-wide uppercase"
                          style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
                        >
                          Generaal {bevel.generaal}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-base leading-relaxed transition-all',
                          isDone && 'line-through'
                        )}
                        style={{ color: '#2a1f0e', fontFamily: 'var(--font-medieval)' }}
                      >
                        {bevel.taak}
                      </p>

                      {/* Quote popup */}
                      {isShowingQuote && (
                        <div
                          className="mt-3 py-2 px-4 rounded text-sm italic animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{
                            background: 'rgba(139,109,56,0.1)',
                            color: '#5a4a30',
                            fontFamily: 'var(--font-medieval)',
                            borderLeft: '3px solid #8b6d38',
                          }}
                        >
                          {bevel.generaal}: {bevel.quote}
                        </div>
                      )}
                    </div>

                    {/* Wax Seal Checkbox */}
                    <SealCheckbox
                      checked={isDone}
                      onChange={() => handleToggle(bevel)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Signature section */}
          <div className="mt-12 text-right">
            <div className="w-32 h-px ml-auto mb-2" style={{ background: '#8b6d38' }} />
            <p
              className="text-sm italic"
              style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
            >
              Per decreet van het Hoofdkwartier
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-10 space-y-2">
            <div className="flex justify-between items-center">
              <span
                className="text-sm font-bold"
                style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
              >
                Voortgang Veldslag
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: '#6b5a3e', fontFamily: 'var(--font-medieval)' }}
              >
                {Math.round(progress)}% gewonnen
              </span>
            </div>
            <div
              className="h-4 rounded-full overflow-hidden"
              style={{ background: 'rgba(139,109,56,0.15)', border: '1px solid rgba(139,109,56,0.3)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: allDone
                    ? 'linear-gradient(90deg, #b8960c, #d4af37, #f0d060, #d4af37)'
                    : 'linear-gradient(90deg, #8b6d38, #a0853e, #8b6d38)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Victory overlay */}
      {allDone && <VictoryBanner />}
    </div>
  )
}

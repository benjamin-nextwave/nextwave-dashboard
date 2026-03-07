'use client'

import { useEffect, useState } from 'react'

const COINS = ['🪙', '💰', '👑', '⚜️', '💎']

interface Particle {
  id: number
  emoji: string
  x: number
  delay: number
  duration: number
}

export function VictoryBanner() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      emoji: COINS[i % COINS.length],
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
    }))
    setParticles(items)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Confetti particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="fixed text-2xl animate-coin-fall"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Banner */}
      <div
        className="relative px-12 py-8 text-center animate-in zoom-in duration-500 pointer-events-auto"
        style={{
          background: 'linear-gradient(135deg, #2a1f0e 0%, #3d2e15 50%, #2a1f0e 100%)',
          border: '3px solid #d4af37',
          borderRadius: '4px',
          boxShadow: '0 0 60px rgba(212,175,55,0.3), inset 0 0 30px rgba(212,175,55,0.1)',
        }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="text-4xl">👑</span>
        </div>
        <h2
          className="text-3xl md:text-4xl mb-3"
          style={{ color: '#d4af37', fontFamily: 'var(--font-fraktur)' }}
        >
          De dag is gewonnen!
        </h2>
        <p
          className="text-lg"
          style={{ color: '#c4a86b', fontFamily: 'var(--font-medieval)' }}
        >
          Alle bevelen zijn uitgevoerd, Veldmaarschalk!
        </p>
        <div className="flex justify-center gap-2 mt-4 text-2xl">
          <span>⚔️</span>
          <span>🛡️</span>
          <span>🏆</span>
          <span>🛡️</span>
          <span>⚔️</span>
        </div>
      </div>
    </div>
  )
}

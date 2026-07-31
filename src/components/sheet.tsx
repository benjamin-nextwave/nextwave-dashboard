'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

/**
 * Paneel dat vanaf de onderrand omhoog schuift — binnen duimbereik op
 * een telefoon. Sluit met de knop, een tik naast het paneel of Escape.
 */
export function Sheet({ open, onClose, title, subtitle, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Achtergrond vastzetten zodat alleen het paneel scrollt.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Sluiten"
        onClick={onClose}
        className="animate-fade absolute inset-0 bg-void/80 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-rise relative mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-3xl border border-line bg-surface shadow-[0_-8px_60px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-start gap-3 border-b border-line-soft px-5 pt-4 pb-3">
          <div className="min-w-0 flex-1">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <h2 className="truncate text-lg font-semibold">{title}</h2>
            {subtitle && <p className="label mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="mt-3 grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted active:scale-95"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

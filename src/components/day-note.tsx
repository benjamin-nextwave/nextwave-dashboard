'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { setDayNote } from '@/lib/actions'

/** Vrije notitie bij de dag. Slaat op zodra je een paar tellen stil bent. */
export function DayNote({ day, initial }: { day: string; initial: string | null }) {
  const [value, setValue] = useState(initial ?? '')
  const [saved, setSaved] = useState(false)
  const [, startTransition] = useTransition()
  const saving = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Bij het wisselen van dag de tekst opnieuw vullen.
  useEffect(() => {
    setValue(initial ?? '')
    setSaved(false)
  }, [day, initial])

  useEffect(() => () => {
    if (saving.current) clearTimeout(saving.current)
  }, [])

  function onChange(next: string) {
    setValue(next)
    setSaved(false)
    if (saving.current) clearTimeout(saving.current)
    saving.current = setTimeout(() => {
      startTransition(async () => {
        await setDayNote(day, next)
        setSaved(true)
      })
    }, 900)
  }

  return (
    <section className="mt-4">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="label">Notitie bij de dag</p>
        {saved && <span className="label normal-case tracking-normal text-good">opgeslagen</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Wat je verder nog wilt vasthouden…"
        className="field resize-none text-sm"
      />
    </section>
  )
}

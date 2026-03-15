'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format, subDays } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useToday } from '@/lib/today-provider'
import { getCompaniesForSelect } from '@/lib/meetings'
import { getMailTracking, toggleMailTracking } from '@/lib/mail-tracking'

type Company = { id: string; name: string }
type TrackingSet = Set<string> // "companyId:date" keys

function trackingKey(companyId: string, date: string) {
  return `${companyId}:${date}`
}

export function MailTrackingGantt() {
  const today = useToday()
  const [companies, setCompanies] = useState<Company[]>([])
  const [tracking, setTracking] = useState<TrackingSet>(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  // Generate 14 days ending with today
  const days = useMemo(() => {
    const result: string[] = []
    for (let i = 13; i >= 0; i--) {
      result.push(format(subDays(new Date(today + 'T12:00:00'), i), 'yyyy-MM-dd'))
    }
    return result
  }, [today])

  const startDate = days[0]
  const endDate = days[days.length - 1]

  const loadData = useCallback(async () => {
    try {
      const [companiesData, trackingData] = await Promise.all([
        getCompaniesForSelect(),
        getMailTracking(startDate, endDate),
      ])
      setCompanies(companiesData)
      const set = new Set<string>()
      for (const entry of trackingData) {
        set.add(trackingKey(entry.company_id, entry.contact_date))
      }
      setTracking(set)
    } catch (error) {
      console.error('Failed to load mail tracking data:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Scroll to the right on load so today is visible
  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [loading])

  async function handleToggle(companyId: string, date: string) {
    const key = trackingKey(companyId, date)
    if (toggling.has(key)) return

    // Optimistic update
    setTracking((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })

    setToggling((prev) => new Set(prev).add(key))
    try {
      await toggleMailTracking(companyId, date)
    } catch (error) {
      console.error('Failed to toggle mail tracking:', error)
      // Revert on error
      setTracking((prev) => {
        const next = new Set(prev)
        if (next.has(key)) {
          next.delete(key)
        } else {
          next.add(key)
        }
        return next
      })
    } finally {
      setToggling((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}>
          Veldslagkaart laden...
        </p>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}>
          Geen bedrijven gevonden.
        </p>
      </div>
    )
  }

  const isWeekend = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.getDay() === 0 || d.getDay() === 6
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto rounded-lg"
      style={{
        border: '2px solid rgba(139,109,56,0.3)',
        boxShadow: '0 4px 20px rgba(100,70,20,0.12)',
      }}
    >
      <table
        className="w-full border-collapse"
        style={{ minWidth: `${200 + days.length * 52}px` }}
      >
        <thead>
          <tr>
            <th
              className="sticky left-0 z-10 px-4 py-3 text-left text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, #e8dcc0, #ddd0b0)',
                color: '#4a3a20',
                fontFamily: 'var(--font-medieval)',
                borderBottom: '2px solid rgba(139,109,56,0.3)',
                borderRight: '2px solid rgba(139,109,56,0.3)',
                minWidth: 200,
              }}
            >
              Bedrijf
            </th>
            {days.map((day) => {
              const date = new Date(day + 'T12:00:00')
              const isToday = day === today
              const weekend = isWeekend(day)
              return (
                <th
                  key={day}
                  className="px-1 py-2 text-center"
                  style={{
                    background: isToday
                      ? 'linear-gradient(135deg, #d4af37, #c9a42e)'
                      : weekend
                        ? 'linear-gradient(135deg, #d5cab0, #cfc3a5)'
                        : 'linear-gradient(135deg, #e8dcc0, #ddd0b0)',
                    borderBottom: '2px solid rgba(139,109,56,0.3)',
                    borderRight: '1px solid rgba(139,109,56,0.15)',
                    minWidth: 48,
                  }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wide"
                    style={{
                      color: isToday ? '#2a1f0e' : '#8b7d60',
                      fontFamily: 'var(--font-medieval)',
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {format(date, 'EEE', { locale: nl })}
                  </div>
                  <div
                    className="text-xs font-medium"
                    style={{
                      color: isToday ? '#2a1f0e' : '#4a3a20',
                      fontFamily: 'var(--font-medieval)',
                    }}
                  >
                    {format(date, 'd MMM', { locale: nl })}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {companies.map((company, idx) => (
            <tr key={company.id}>
              <td
                className="sticky left-0 z-10 px-4 py-2.5 text-sm font-medium truncate"
                style={{
                  background: idx % 2 === 0
                    ? 'linear-gradient(135deg, #f5ebd4, #f0e4c8)'
                    : 'linear-gradient(135deg, #efe0be, #e8d8b0)',
                  color: '#2a1f0e',
                  fontFamily: 'var(--font-medieval)',
                  borderBottom: '1px solid rgba(139,109,56,0.15)',
                  borderRight: '2px solid rgba(139,109,56,0.3)',
                  maxWidth: 200,
                }}
                title={company.name}
              >
                {company.name}
              </td>
              {days.map((day) => {
                const key = trackingKey(company.id, day)
                const hasContact = tracking.has(key)
                const isToday = day === today
                const weekend = isWeekend(day)

                return (
                  <td
                    key={day}
                    className="relative p-0"
                    style={{
                      background: isToday
                        ? idx % 2 === 0
                          ? 'rgba(212,175,55,0.12)'
                          : 'rgba(212,175,55,0.18)'
                        : weekend
                          ? idx % 2 === 0
                            ? 'rgba(139,109,56,0.06)'
                            : 'rgba(139,109,56,0.1)'
                          : idx % 2 === 0
                            ? '#f8f2e0'
                            : '#f2ebd0',
                      borderBottom: '1px solid rgba(139,109,56,0.15)',
                      borderRight: '1px solid rgba(139,109,56,0.1)',
                    }}
                  >
                    <button
                      type="button"
                      className="w-full h-10 flex items-center justify-center transition-transform active:scale-90"
                      onClick={() => handleToggle(company.id, day)}
                      title={`${company.name} - ${format(new Date(day + 'T12:00:00'), 'd MMMM', { locale: nl })}`}
                    >
                      {hasContact && <BulletHole />}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BulletHole() {
  return (
    <div className="relative size-7 flex items-center justify-center">
      {/* Outer ring - cracked edge */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, transparent 35%, rgba(60,40,10,0.3) 40%, rgba(80,55,15,0.15) 55%, transparent 65%)',
        }}
      />
      {/* Inner dark hole */}
      <div
        className="size-3.5 rounded-full relative"
        style={{
          background: 'radial-gradient(circle at 40% 40%, #1a1008, #0a0804)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8), 0 0 4px rgba(40,25,5,0.4)',
        }}
      />
      {/* Subtle cracks */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(35deg, transparent 42%, rgba(80,55,15,0.2) 43%, transparent 44%),
            linear-gradient(155deg, transparent 42%, rgba(80,55,15,0.15) 43%, transparent 44%),
            linear-gradient(250deg, transparent 44%, rgba(80,55,15,0.12) 45%, transparent 46%)
          `,
        }}
      />
    </div>
  )
}

import { notFound } from 'next/navigation'
import { DayView } from '@/components/day-view'
import { isValidKey } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  if (!isValidKey(date)) notFound()
  return <DayView day={date} />
}

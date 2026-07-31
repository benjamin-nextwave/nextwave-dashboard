import { DayView } from '@/components/day-view'
import { logicalToday } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default function TodayPage() {
  return <DayView day={logicalToday()} />
}

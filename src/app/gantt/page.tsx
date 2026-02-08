import { GanttPage } from '@/components/gantt/gantt-page'

export const dynamic = 'force-dynamic'

export default function GanttRoute() {
  return (
    <main className="p-6">
      <GanttPage />
    </main>
  )
}

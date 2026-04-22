import { VandaagCheckenPage } from '@/components/vandaag-checken/vandaag-checken-page'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <main className="p-6">
      <VandaagCheckenPage />
    </main>
  )
}

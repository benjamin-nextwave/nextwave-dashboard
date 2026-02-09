import { WarmupOverview } from '@/components/warmup/warmup-overview'

export const dynamic = 'force-dynamic'

export default function WarmupRoute() {
  return (
    <main className="p-6">
      <WarmupOverview />
    </main>
  )
}

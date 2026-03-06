export const dynamic = 'force-dynamic'

import { OnboardingOverview } from '@/components/onboarding/onboarding-overview'

export default function OnboardingRoute() {
  return (
    <main className="p-6">
      <OnboardingOverview />
    </main>
  )
}

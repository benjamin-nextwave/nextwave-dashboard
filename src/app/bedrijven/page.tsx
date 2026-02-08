import { CompanyGrid } from '@/components/companies/company-grid'

export const dynamic = 'force-dynamic'

export default function BedrijvenPage() {
  return (
    <main className="p-6">
      <CompanyGrid />
    </main>
  )
}

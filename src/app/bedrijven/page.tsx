import { CompanyList } from '@/components/companies/company-list'

export const dynamic = 'force-dynamic'

export default function BedrijvenPage() {
  return (
    <main className="p-6">
      <CompanyList />
    </main>
  )
}

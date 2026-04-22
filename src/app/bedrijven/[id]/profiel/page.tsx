import { CompanyProfilePage } from '@/components/companies/company-detail/company-profile-page'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="p-6">
      <CompanyProfilePage companyId={id} />
    </main>
  )
}

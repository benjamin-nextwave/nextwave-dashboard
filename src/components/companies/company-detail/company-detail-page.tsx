'use client'

interface CompanyDetailPageProps {
  companyId: string
}

export function CompanyDetailPage({ companyId }: CompanyDetailPageProps) {
  return <div>Loading company {companyId}...</div>
}

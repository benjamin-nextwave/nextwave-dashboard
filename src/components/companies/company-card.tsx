import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatShortDate } from '@/lib/dates'

type CompanyCardProps = {
  id: string
  name: string
  goLiveDate: string | null
  openTaskCount: number
}

export function CompanyCard({ id, name, goLiveDate, openTaskCount }: CompanyCardProps) {
  return (
    <Link href={`/bedrijven/${id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {goLiveDate ? formatShortDate(goLiveDate) : 'Geen go-live datum'}
          </span>
          <Badge variant="secondary">{openTaskCount} open</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

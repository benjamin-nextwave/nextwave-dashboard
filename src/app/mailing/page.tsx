import { MailTrackingGantt } from '@/components/mailing/mail-tracking-gantt'

export const dynamic = 'force-dynamic'

export default function MailingRoute() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: '#2a1f0e', fontFamily: 'var(--font-fraktur)' }}
        >
          Mailing Overzicht
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: '#8b7d60', fontFamily: 'var(--font-medieval)' }}
        >
          Klik op een vakje om contact bij te houden. Kogelgaten markeren verstuurde mails.
        </p>
      </div>
      <MailTrackingGantt />
    </main>
  )
}

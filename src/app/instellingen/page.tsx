import { Nav } from '@/components/nav'
import { SettingsForm } from '@/components/settings-form'
import { getCategories, getSettings } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()])
  const pinConfigured = Boolean(process.env.APP_PIN)

  return (
    <main className="px-4 pb-32">
      <header
        className="sticky top-0 z-30 -mx-4 mb-5 border-b border-line-soft bg-bg/85 px-4 pb-3 backdrop-blur-xl"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <h1 className="text-lg font-semibold">Instellingen</h1>
        <p className="label">ritme en weekdoelen</p>
      </header>

      <SettingsForm settings={settings} categories={categories} />

      {!pinConfigured && (
        <section className="mt-6 rounded-xl border border-warn/40 bg-warn/10 p-4">
          <p className="text-sm font-semibold text-warn">Er staat geen pincode ingesteld</p>
          <p className="mt-1 text-xs text-muted">
            Iedereen met de link kan nu bij je schema. Zet <span className="numeric">APP_PIN</span> in je
            omgevingsvariabelen om dat af te sluiten.
          </p>
        </section>
      )}

      <Nav />
    </main>
  )
}

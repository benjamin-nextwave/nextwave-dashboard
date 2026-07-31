import { Suspense } from 'react'
import { UnifrakturMaguntia } from 'next/font/google'
import { LegacyLogin } from '@/components/legacy-login'
import './parchment.css'

const fraktur = UnifrakturMaguntia({ weight: '400', subsets: ['latin'], display: 'swap' })

export const dynamic = 'force-dynamic'

// De inlogpagina houdt bewust de uitstraling van het vorige dashboard —
// tot en met de titel in het tabblad en de kleur van de adresbalk.
export const metadata = {
  title: 'NextWave Dashboard',
  description: 'Client management dashboard',
  icons: { icon: [{ url: '/icons/legacy.svg', type: 'image/svg+xml' }] },
}

export const viewport = {
  themeColor: '#eddcb3',
}

export default function LoginPage() {
  return (
    <Suspense>
      <LegacyLogin frakturClassName={fraktur.className} />
    </Suspense>
  )
}

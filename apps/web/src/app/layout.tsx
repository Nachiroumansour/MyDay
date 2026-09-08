import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Entete } from '@/composants/entete'
import { PiedSite } from '@/composants/pied-site'
import './globals.css'

/** Playfair pour les titres, Inter pour le texte — la maquette Stitch. */
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
  variable: '--police-titre',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--police-texte',
})

/**
 * Base des URL absolues des métadonnées. WhatsApp et Facebook ne résolvent pas
 * une URL d'image relative : sans elle, aucun aperçu de partage ne s'affiche.
 */
const origine =
  process.env.NEXT_PUBLIC_ORIGINE ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(origine),
  title: 'MyDay — Vos cérémonies, prêtes à être partagées ce soir',
  description:
    'Créez votre invitation de mariage, de baptême ou d’anniversaire, partagez-la sur WhatsApp et suivez les réponses de vos invités.',
}

export default function RacineLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <Entete />
        {children}
        <PiedSite />
      </body>
    </html>
  )
}

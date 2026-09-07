import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

// Une seule famille pour toute l'interface (spec §9.5). `swap` garantit que le
// texte s'affiche avant la police sur un réseau lent.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  // Police variable : next/font refuse une liste de graisses, il expose la plage.
  variable: '--police-interface',
})

export const metadata: Metadata = {
  title: 'MyDay — Votre invitation, prête ce soir',
  description:
    'Créez votre invitation de mariage, de baptême ou d’anniversaire, partagez-la sur WhatsApp et suivez les réponses de vos invités.',
}

export default function RacineLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={bricolage.variable}>
      <body>{children}</body>
    </html>
  )
}

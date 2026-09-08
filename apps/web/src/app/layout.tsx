import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { Marque } from '@/composants/marque'
import './globals.css'

// Une seule famille pour toute l'interface (spec §9.5). `swap` garantit que le
// texte s'affiche avant la police sur un réseau lent.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  // Police variable : next/font refuse une liste de graisses, il expose la plage.
  variable: '--police-interface',
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
  title: 'MyDay — Votre invitation, prête ce soir',
  description:
    'Créez votre invitation de mariage, de baptême ou d’anniversaire, partagez-la sur WhatsApp et suivez les réponses de vos invités.',
}

export default function RacineLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={bricolage.variable}>
      <body>
        <header className="entete">
          <div className="contenu entete-interieur">
            <a href="/" aria-label="MyDay, accueil">
              <Marque />
            </a>
            <nav className="entete-nav">
              <a href="/modeles" className="lien-sobre">
                Les modèles
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="pied-site">
          <div className="contenu pied-interieur">
            <Marque taille={22} />
            <p className="legende">
              Cartes et invitations pour les mariages, baptêmes et anniversaires au Sénégal.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}

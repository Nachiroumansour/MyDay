'use client'

import { usePathname } from 'next/navigation'

const LIENS = [
  { chemin: '/', libelle: 'Accueil' },
  { chemin: '/modeles', libelle: 'Catalogue' },
  { chemin: '/guide', libelle: 'Trouver mon style' },
]

export function Entete() {
  const chemin = usePathname()

  // L'éditeur et l'administration ont leur propre navigation.
  if (chemin.startsWith('/brouillon') || chemin.startsWith('/admin')) {
    return (
      <header className="entete">
        <div className="contenu entete-interieur">
          <a className="entete-marque" href="/">
            MyDay
          </a>
        </div>
      </header>
    )
  }

  return (
    <header className="entete">
      <div className="contenu entete-interieur">
        <a className="entete-marque" href="/">
          MyDay
        </a>

        <nav className="entete-nav" aria-label="Navigation principale">
          {LIENS.map((lien) => {
            const actif = lien.chemin === '/' ? chemin === '/' : chemin.startsWith(lien.chemin)
            return (
              <a
                key={lien.chemin}
                className={`entete-lien ${actif ? 'entete-lien-actif' : ''}`}
                href={lien.chemin}
                {...(actif ? { 'aria-current': 'page' as const } : {})}
              >
                {lien.libelle}
              </a>
            )
          })}
        </nav>

        <span className="entete-region">Sénégal · Français</span>
      </div>
    </header>
  )
}

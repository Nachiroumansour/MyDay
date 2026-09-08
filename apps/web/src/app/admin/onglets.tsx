'use client'

import { usePathname } from 'next/navigation'
import styles from './admin.module.css'

const ONGLETS = [
  { lien: '/admin', libelle: 'Les modèles' },
  { lien: '/admin/gabarits/nouveau', libelle: 'Déposer un modèle' },
  { lien: '/admin/createurs', libelle: 'Les créateurs' },
  { lien: '/admin/commandes', libelle: 'Les commandes' },
]

export function Onglets() {
  const chemin = usePathname()
  return (
    <nav className={styles.onglets} aria-label="Administration">
      {ONGLETS.map((onglet) => (
        <a
          key={onglet.lien}
          className={chemin === onglet.lien ? styles.ongletActif : styles.onglet}
          href={onglet.lien}
        >
          {onglet.libelle}
        </a>
      ))}
    </nav>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import styles from './editeur.module.css'

const ETAPES = [
  { suffixe: '', libelle: 'La carte' },
  { suffixe: '/programme', libelle: 'Programme' },
  { suffixe: '/details', libelle: 'Détails' },
  { suffixe: '/invites', libelle: 'Invités' },
  { suffixe: '/publier', libelle: 'Publication' },
  { suffixe: '/reponses', libelle: 'Réponses' },
]

export function Etapes({ secret }: { secret: string }) {
  const chemin = usePathname()
  const base = `/brouillon/${secret}`

  return (
    <nav aria-label="Étapes de création">
      <ol className={styles.etapes}>
        {ETAPES.map((etape, rang) => {
          const lien = `${base}${etape.suffixe}`
          const actif = chemin === lien || (etape.suffixe === '/reponses' && chemin.startsWith(lien))
          return (
            <li key={etape.libelle} style={{ display: 'flex' }}>
              <a
                className={actif ? styles.etapeActive : styles.etape}
                href={lien}
                style={{ flex: 1 }}
                {...(actif ? { 'aria-current': 'step' as const } : {})}
              >
                <span className={styles.etapeNumero}>{String(rang + 1).padStart(2, '0')}</span>
                <span className={styles.etapeLibelle}>{etape.libelle}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import styles from './editeur.module.css'

const ETAPES = [
  { suffixe: '', libelle: 'La carte' },
  { suffixe: '/programme', libelle: 'Le programme' },
  { suffixe: '/details', libelle: 'Les détails' },
  { suffixe: '/invites', libelle: 'Vos invités' },
  { suffixe: '/publier', libelle: 'Publier' },
  { suffixe: '/reponses', libelle: 'Les réponses' },
  { suffixe: '/moderation', libelle: 'Livre d’or & photos' },
]

export function Etapes({ secret }: { secret: string }) {
  const chemin = usePathname()
  const base = `/brouillon/${secret}`

  return (
    <nav aria-label="Étapes de création">
      <ol className={styles.etapes}>
        {ETAPES.map((etape) => {
          const lien = `${base}${etape.suffixe}`
          return (
            <li key={etape.libelle}>
              <a className={chemin === lien ? styles.etapeActive : styles.etape} href={lien}>
                {etape.libelle}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

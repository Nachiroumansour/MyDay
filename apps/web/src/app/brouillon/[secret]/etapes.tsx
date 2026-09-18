'use client'

import { usePathname } from 'next/navigation'
import styles from './editeur.module.css'

/**
 * La navigation de l'éditeur, qui change avec l'état de l'invitation.
 *
 * Six étapes au même niveau — carte, programme, détails, invités, publication,
 * réponses — mettaient sur le même plan ce qui se fait avant d'envoyer et ce
 * qui se fait après. Le benchmark l'a montré : InviteMoi tient en trois temps,
 * Luma en un écran ; nous étions le parcours le plus long.
 *
 * Avant la publication, il n'y a donc que deux temps, dans l'ordre :
 * composer, puis partager. Le programme et les détails font partie de la
 * composition — on y accède depuis elle. Après la publication, la navigation
 * bascule sur ce qui compte alors : qui répond, et à qui l'on envoie.
 */
interface Onglet {
  suffixes: string[]
  libelle: string
}

const AVANT: Onglet[] = [
  { suffixes: ['', '/programme', '/details'], libelle: 'Composer' },
  { suffixes: ['/publier', '/payer'], libelle: 'Partager' },
]

const APRES: Onglet[] = [
  { suffixes: ['/reponses', '/moderation'], libelle: 'Réponses' },
  { suffixes: ['/invites'], libelle: 'Invités' },
  { suffixes: ['/publier'], libelle: 'Partager' },
  { suffixes: ['', '/programme', '/details'], libelle: 'Modifier' },
]

export function Etapes({ secret, publie }: { secret: string; publie: boolean }) {
  const chemin = usePathname()
  const base = `/brouillon/${secret}`
  const onglets = publie ? APRES : AVANT

  return (
    <nav aria-label={publie ? 'Suivi de l’invitation' : 'Étapes de création'}>
      <ol className={styles.etapes}>
        {onglets.map((onglet, rang) => {
          const lien = `${base}${onglet.suffixes[0]}`
          const actif = onglet.suffixes.some((suffixe) => {
            const cible = `${base}${suffixe}`
            return suffixe === '' ? chemin === cible : chemin.startsWith(cible)
          })
          return (
            <li key={onglet.libelle} style={{ display: 'flex' }}>
              <a
                className={actif ? styles.etapeActive : styles.etape}
                href={lien}
                style={{ flex: 1 }}
                {...(actif ? { 'aria-current': (publie ? 'page' : 'step') as 'page' | 'step' } : {})}
              >
                {/* Numéroter n'a de sens que pour une suite ordonnée : avant la
                    publication. Après, ce sont des rubriques. */}
                {!publie && (
                  <span className={styles.etapeNumero}>{String(rang + 1).padStart(2, '0')}</span>
                )}
                <span className={styles.etapeLibelle}>{onglet.libelle}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

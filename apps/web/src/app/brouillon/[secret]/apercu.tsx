'use client'

import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import type { Zone } from '@/lib/zones'
import { useCarte } from './carte-vivante'
import styles from './editeur.module.css'

/**
 * La carte, toujours sous les yeux.
 *
 * À l'étape « carte », elle est l'écran lui-même : grande, et chaque texte se
 * touche pour être édité là où il est — c'est ainsi que Paperless Post et Canva
 * font, et c'est ce qui manquait le plus. Aux autres étapes, on n'y édite rien :
 * sur un téléphone elle se réduit à une vignette collée en haut, qu'une
 * pression ouvre en grand.
 *
 * Elle se redemande à chaque version, c'est-à-dire après chaque enregistrement
 * réel — et non à chaque frappe, qui coûterait un rendu de carte par lettre.
 */
const MOTS = {
  repos: '',
  frappe: 'Modification en cours…',
  envoi: 'Enregistrement…',
  enregistre: 'Enregistré',
  echec: 'Non enregistré — vérifiez votre connexion',
} as const

export function Apercu({ secret, zones }: { secret: string; zones: Zone[] }) {
  const { version, statut, champs, ouvrir, actif } = useCarte()
  const chemin = usePathname()
  const etapeCarte = chemin === `/brouillon/${secret}`
  // `<dialog>` plutôt qu'un voile à nous : la barre collante porte un
  // `backdrop-filter`, qui fait d'elle un bloc conteneur — un élément en
  // `position: fixed` y resterait prisonnier.
  const fenetre = useRef<HTMLDialogElement>(null)
  const source = `/brouillon/${secret}/apercu.webp?l=480&v=${version}`
  const libelle = new Map(champs.map((champ) => [champ.id, champ.libelle]))

  if (etapeCarte) {
    return (
      <div className={styles.colonneApercuGrand}>
        <p className={styles.apercuTitre}>
          <span
            className={statut === 'echec' ? styles.apercuPointEchec : styles.apercuPoint}
            aria-hidden="true"
          />
          Touchez un texte pour le modifier
          <span className={styles.apercuStatut} role="status">
            {MOTS[statut]}
          </span>
        </p>

        <div className={styles.carteEditable}>
          <img
            className={styles.apercuPlein}
            src={source}
            width={1500}
            height={2250}
            alt="Aperçu de votre carte"
          />
          {zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={zone.id === actif ? `${styles.zone} ${styles.zoneActive}` : styles.zone}
              style={{
                left: `${zone.gauche}%`,
                top: `${zone.haut}%`,
                width: `${zone.largeur}%`,
                height: `${zone.hauteur}%`,
              }}
              onClick={() => ouvrir(zone.id)}
              data-zone={zone.id}
              aria-label={`Modifier : ${libelle.get(zone.id) ?? zone.id}`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.colonneApercu}>
      <p className={styles.apercuTitre}>
        <span
          className={statut === 'echec' ? styles.apercuPointEchec : styles.apercuPoint}
          aria-hidden="true"
        />
        Votre carte
        <span className={styles.apercuStatut} role="status">
          {MOTS[statut]}
        </span>
      </p>

      <button
        type="button"
        className={styles.apercuCadre}
        onClick={() => fenetre.current?.showModal()}
        aria-label="Voir la carte en grand"
      >
        <img
          className={styles.apercu}
          src={source}
          width={1500}
          height={2250}
          alt="Aperçu de votre carte"
        />
        <span className={styles.apercuLoupe} aria-hidden="true">
          Agrandir
        </span>
      </button>

      <dialog
        ref={fenetre}
        className={styles.fenetreApercu}
        onClick={() => fenetre.current?.close()}
      >
        <img className={styles.apercuGrand} src={source} alt="Votre carte en grand" />
        <button
          type="button"
          className={styles.fermerApercu}
          onClick={() => fenetre.current?.close()}
        >
          Fermer
        </button>
      </dialog>
    </div>
  )
}

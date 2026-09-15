'use client'

import { useRef } from 'react'
import { useCarte } from './carte-vivante'
import styles from './editeur.module.css'

/**
 * L'aperçu de la carte, toujours sous les yeux.
 *
 * Sur un téléphone il se réduit à une bande collée en haut de l'écran : à
 * pleine taille il occupait tout le premier écran et repoussait le formulaire
 * hors de vue, si bien qu'on ne voyait jamais ensemble ce que l'on écrit et ce
 * que ça donne. Une pression l'ouvre en grand.
 *
 * Il se redemande à chaque version, c'est-à-dire après chaque enregistrement
 * réel — et non à chaque frappe, qui coûterait un rendu de carte par lettre.
 */
const MOTS = {
  repos: '',
  frappe: 'Modification en cours…',
  envoi: 'Enregistrement…',
  enregistre: 'Enregistré',
  echec: 'Non enregistré — vérifiez votre connexion',
} as const

export function Apercu({ secret }: { secret: string }) {
  const { version, statut } = useCarte()
  // `<dialog>` plutôt qu'un voile à nous : la barre collante porte un
  // `backdrop-filter`, qui fait d'elle un bloc conteneur — un élément en
  // `position: fixed` y resterait prisonnier. La couche supérieure du
  // navigateur échappe à cette règle, et apporte l'échappement par Échap et
  // le piège à focus sans une ligne de plus.
  const fenetre = useRef<HTMLDialogElement>(null)
  const source = `/brouillon/${secret}/apercu.webp?l=480&v=${version}`

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

      <dialog ref={fenetre} className={styles.fenetreApercu} onClick={() => fenetre.current?.close()}>
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

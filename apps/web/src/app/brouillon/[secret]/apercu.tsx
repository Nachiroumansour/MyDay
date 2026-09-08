'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import styles from './editeur.module.css'

/**
 * L'aperçu de la carte, toujours visible.
 *
 * Il se recharge à chaque enregistrement : le chemin et la requête changent
 * après une action serveur, ce qui suffit à forcer le navigateur à redemander
 * l'image plutôt que de servir la précédente.
 */
export function Apercu({ secret }: { secret: string }) {
  const chemin = usePathname()
  const requete = useSearchParams().toString()
  const version = `${chemin}?${requete}`

  return (
    <div className={styles.colonneApercu}>
      <p className={styles.apercuTitre}>
        <span className={styles.apercuPoint} aria-hidden="true" />
        Aperçu en temps réel
      </p>
      <div className={styles.apercuCadre}>
        <img
          className={styles.apercu}
          src={`/brouillon/${secret}/apercu.png?l=480&v=${encodeURIComponent(version)}`}
          width={1500}
          height={2250}
          alt="Aperçu de votre carte"
        />
      </div>
    </div>
  )
}

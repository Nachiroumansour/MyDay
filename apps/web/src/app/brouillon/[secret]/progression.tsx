import styles from './editeur.module.css'

/**
 * Où en est-on.
 *
 * Remplace la phrase qui énumérait en toutes lettres les huit champs restants,
 * juste au-dessus des huit étiquettes qui les nomment déjà. Elle se lisait en
 * premier et annonçait du travail ; un compte et une barre disent la même
 * chose sans décourager.
 */
export function Progression({ faits, total }: { faits: number; total: number }) {
  if (total === 0) return null
  const fini = faits >= total
  const part = Math.round((faits / total) * 100)

  return (
    <div className={styles.progression}>
      <p className={fini ? styles.progressionFinie : styles.progressionCompte}>
        {fini ? 'Tout est rempli' : `${faits} sur ${total} rempli${faits > 1 ? 's' : ''}`}
      </p>
      <div
        className={styles.jauge}
        role="progressbar"
        aria-valuenow={faits}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Champs remplis"
      >
        <span className={styles.jaugeRemplie} style={{ width: `${part}%` }} />
      </div>
    </div>
  )
}

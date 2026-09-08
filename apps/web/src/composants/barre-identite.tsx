import type { Identite } from '@/lib/identite'
import styles from './barre-identite.module.css'

/**
 * La barre d'identité : « Vos prénoms » et « Date ».
 *
 * Renseignée une fois, tout le catalogue se réaffiche avec ces informations.
 * C'est un formulaire GET ordinaire : la galerie personnalisée est donc
 * partageable par son adresse et fonctionne sans JavaScript.
 */
export function BarreIdentite({
  identite,
  action,
  compact = false,
}: {
  identite: Identite
  action: string
  compact?: boolean
}) {
  return (
    <form method="get" action={action} className={compact ? styles.compacte : styles.barre}>
      <div className={styles.champ}>
        <label className="etiquette-champ" htmlFor="id-n1">
          Prénom
        </label>
        <input
          id="id-n1"
          name="n1"
          className="saisie"
          defaultValue={identite.nom1 ?? ''}
          placeholder="Awa"
          maxLength={32}
          autoComplete="off"
        />
      </div>

      <div className={styles.champ}>
        <label className="etiquette-champ" htmlFor="id-n2">
          Et
        </label>
        <input
          id="id-n2"
          name="n2"
          className="saisie"
          defaultValue={identite.nom2 ?? ''}
          placeholder="Moussa"
          maxLength={32}
          autoComplete="off"
        />
      </div>

      <div className={styles.champ}>
        <label className="etiquette-champ" htmlFor="id-d">
          Date
        </label>
        <input
          id="id-d"
          name="d"
          type="date"
          className="saisie"
          defaultValue={identite.date ?? ''}
        />
      </div>

      <button type="submit" className="bouton">
        Voir avec nos noms
      </button>
    </form>
  )
}

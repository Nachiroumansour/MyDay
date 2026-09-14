import { notFound } from 'next/navigation'
import { formaterDateLongue, formaterPlage } from '@/lib/dates'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { sauverCeremonie, supprimerCeremonie } from '../actions'
import { formaterPoint } from '@/lib/localisation'
import { PointCarte } from '../point-carte'
import styles from '../editeur.module.css'

/** Suggestions de cérémonies, propres à chaque type de fête. */
const SUGGESTIONS: Record<string, string[]> = {
  mariage: ['Ngénte', 'Takk', 'Réception', 'Soirée'],
  bapteme: ['Ngénte', 'Réception'],
  anniversaire: ['Réception', 'Soirée'],
}

function pourChamp(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function heurePourChamp(date: Date): string {
  return date.toISOString().slice(11, 16)
}

export default async function EtapeProgramme({
  params,
  searchParams,
}: {
  params: Promise<{ secret: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { secret } = await params
  const requete = await searchParams
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  const modifieId = typeof requete.modifier === 'string' ? requete.modifier : undefined
  const enCours = brouillon.ceremonies.find((c) => c.id === modifieId)

  return (
    <div className={styles.formulaire}>
      <div>
        <h1 className={styles.titre}>Le programme</h1>
        <p className={styles.introduction}>
          Une fête tient rarement en une seule date. Ajoutez chaque cérémonie : vos invités
          diront à laquelle ils viennent.
        </p>
      </div>

      {requete.erreur === 'incomplet' && (
        <p className={styles.avertissement}>
          Il manque le nom, la date ou le lieu. Complétez-les pour ajouter la cérémonie.
        </p>
      )}
      {requete.erreur === 'sans-ceremonie' && (
        <p className={styles.avertissement}>
          Ajoutez au moins une cérémonie avant de publier : sans elle, vos invités ne
          sauraient ni quand ni où venir.
        </p>
      )}

      {brouillon.ceremonies.length > 0 && (
        <ul className={styles.liste}>
          {brouillon.ceremonies.map((ceremonie) => (
            <li key={ceremonie.id} className={styles.carteCeremonie}>
              <div className={styles.carteCeremonieTete}>
                <span className={styles.carteCeremonieNom}>{ceremonie.nom}</span>
                <a
                  className="lien-sobre"
                  href={`/brouillon/${secret}/programme?modifier=${ceremonie.id}`}
                  style={{ fontSize: 14 }}
                >
                  Modifier
                </a>
              </div>
              <p className={styles.carteCeremonieQuand}>
                {formaterDateLongue(ceremonie.debuteLe)} ·{' '}
                {formaterPlage(ceremonie.debuteLe, ceremonie.termineLe)}
              </p>
              <p>{ceremonie.lieu}</p>
              {ceremonie.repere && (
                <p className={styles.carteCeremonieQuand}>Pour trouver : {ceremonie.repere}</p>
              )}
              <form action={supprimerCeremonie}>
                <input type="hidden" name="secret" value={secret} />
                <input type="hidden" name="ceremonieId" value={ceremonie.id} />
                <button type="submit" className={styles.lienDanger}>
                  Retirer cette cérémonie
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={sauverCeremonie} className={styles.formulaire} key={enCours?.id ?? 'nouvelle'}>
        <input type="hidden" name="secret" value={secret} />
        {enCours && <input type="hidden" name="ceremonieId" value={enCours.id} />}

        <h2 className={styles.titre} style={{ fontSize: 20 }}>
          {enCours ? `Modifier ${enCours.nom}` : 'Ajouter une cérémonie'}
        </h2>

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="nom">
            Nom de la cérémonie
          </label>
          <input
            id="nom"
            name="nom"
            className="saisie"
            list="suggestions-ceremonie"
            defaultValue={enCours?.nom ?? ''}
            required
          />
          <datalist id="suggestions-ceremonie">
            {(SUGGESTIONS[brouillon.typeEvenement] ?? []).map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <div className={styles.rangee}>
          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="debuteLe">
              Date
            </label>
            <input
              id="debuteLe"
              name="debuteLe"
              type="date"
              className="saisie"
              defaultValue={enCours ? pourChamp(enCours.debuteLe) : ''}
              required
            />
          </div>
          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="heureDebut">
              De
            </label>
            <input
              id="heureDebut"
              name="heureDebut"
              type="time"
              className="saisie"
              defaultValue={enCours ? heurePourChamp(enCours.debuteLe) : ''}
            />
          </div>
          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="heureFin">
              À
            </label>
            <input
              id="heureFin"
              name="heureFin"
              type="time"
              className="saisie"
              defaultValue={enCours?.termineLe ? heurePourChamp(enCours.termineLe) : ''}
            />
          </div>
        </div>

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="lieu">
            Lieu
          </label>
          <input
            id="lieu"
            name="lieu"
            className="saisie"
            defaultValue={enCours?.lieu ?? ''}
            placeholder="Grand Théâtre National"
            required
          />
        </div>

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="adresse">
            Adresse
          </label>
          <input
            id="adresse"
            name="adresse"
            className="saisie"
            defaultValue={enCours?.adresse ?? ''}
            placeholder="Boulevard Martin Luther King, Dakar"
          />
        </div>

        <PointCarte
          valeurInitiale={
            enCours?.latitude != null && enCours?.longitude != null
              ? formaterPoint({ latitude: enCours.latitude, longitude: enCours.longitude })
              : ''
          }
        />

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="repere">
            Pour trouver
          </label>
          <input
            id="repere"
            name="repere"
            className="saisie"
            defaultValue={enCours?.repere ?? ''}
            placeholder="en face de la station Total de Sacré-Cœur 3"
          />
          <p className={styles.compteur}>
            C’est ce repère que vos invités utiliseront vraiment — bien plus que l’adresse.
          </p>
        </div>

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="codeVestimentaire">
            Tenue pour cette cérémonie
          </label>
          <input
            id="codeVestimentaire"
            name="codeVestimentaire"
            className="saisie"
            defaultValue={enCours?.codeVestimentaire ?? ''}
            placeholder="Blanc"
          />
        </div>

        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="note">
            Un mot sur cette cérémonie
          </label>
          <textarea
            id="note"
            name="note"
            className="saisie"
            rows={2}
            defaultValue={enCours?.note ?? ''}
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className="bouton">
            {enCours ? 'Enregistrer les modifications' : 'Ajouter cette cérémonie'}
          </button>
          {enCours && (
            <a className="bouton-contour" href={`/brouillon/${secret}/programme`}>
              Annuler
            </a>
          )}
        </div>
      </form>

      <div className={styles.actions}>
        <a className="bouton" href={`/brouillon/${secret}/details`}>
          Passer aux détails
        </a>
      </div>
    </div>
  )
}

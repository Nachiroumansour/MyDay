import { notFound } from 'next/navigation'
import { formaterDateLongue } from '@/lib/dates'
import { manquants } from '@/lib/redaction'
import { libelleChamp } from '@/lib/redaction'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { publier } from '../actions'
import styles from '../editeur.module.css'

function formaterPrix(montant: number): string {
  return `${montant.toLocaleString('fr-FR')} F CFA`
}

export default async function EtapePublier({
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

  const publie = brouillon.statut === 'publie' || requete.publie === '1'
  const aRemplir = manquants(brouillon.champs, brouillon.valeursChamps)
  const sansCeremonie = brouillon.ceremonies.length === 0
  const lien = `/e/${brouillon.slug}`

  if (publie) {
    return (
      <div className={styles.formulaire}>
        <h1 className={styles.titre}>C’est en ligne.</h1>
        <p className={styles.introduction}>
          Votre invitation est publiée. Partagez ce lien dans vos groupes WhatsApp : vos
          invités l’ouvriront sans rien installer.
        </p>

        <p className={styles.rappel}>{lien}</p>

        <div className={styles.actions}>
          <a
            className="bouton"
            href={`https://wa.me/?text=${encodeURIComponent(
              `Une invitation pour vous — ${brouillon.titre}`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Partager sur WhatsApp
          </a>
          <a className="bouton-contour" href={lien}>
            Voir la page de mes invités
          </a>
        </div>

        <p className={styles.compteur}>
          Gardez cette adresse pour revenir modifier votre invitation :{' '}
          <code>/brouillon/{secret}</code>
        </p>
      </div>
    )
  }

  const pret = aRemplir.length === 0 && !sansCeremonie

  return (
    <div className={styles.formulaire}>
      <div>
        <h1 className={styles.titre}>Publier</h1>
        <p className={styles.introduction}>
          Une dernière vérification avant que vos invités ne la reçoivent.
        </p>
      </div>

      <ul className={styles.liste}>
        <li className={styles.carteCeremonie}>
          <span className={styles.carteCeremonieNom}>{brouillon.titre}</span>
          <span className={styles.carteCeremonieQuand}>
            Modèle {brouillon.gabarit.nom}, par {brouillon.gabarit.graphisteNom}
          </span>
        </li>
        {brouillon.ceremonies.map((ceremonie) => (
          <li key={ceremonie.id} className={styles.carteCeremonie}>
            <span className={styles.carteCeremonieNom}>{ceremonie.nom}</span>
            <span className={styles.carteCeremonieQuand}>
              {formaterDateLongue(ceremonie.debuteLe)} · {ceremonie.lieu}
            </span>
          </li>
        ))}
      </ul>

      {aRemplir.length > 0 && (
        <p className={styles.avertissement}>
          Il manque encore :{' '}
          {aRemplir.map((id) => libelleChamp(id, brouillon.typeEvenement).toLowerCase()).join(', ')}.{' '}
          <a className="lien-sobre" href={`/brouillon/${secret}`}>
            Compléter la carte
          </a>
        </p>
      )}

      {sansCeremonie && (
        <p className={styles.avertissement}>
          Aucune cérémonie n’est renseignée : vos invités ne sauraient ni quand ni où venir.{' '}
          <a className="lien-sobre" href={`/brouillon/${secret}/programme`}>
            Ajouter une cérémonie
          </a>
        </p>
      )}

      <p className={styles.rappel}>
        {formaterPrix(brouillon.gabarit.prix)} — le lien d’invitation, le suivi des réponses,
        et vos fichiers en haute définition.
      </p>

      <form action={publier}>
        <input type="hidden" name="secret" value={secret} />
        <button type="submit" className="bouton" disabled={!pret}>
          Publier mon invitation
        </button>
      </form>

      <p className={styles.compteur}>
        Le paiement Wave et Orange Money n’est pas encore branché : la publication est
        ouverte le temps du développement.
      </p>
    </div>
  )
}

import { notFound } from 'next/navigation'
import { formaterDateLongue } from '@/lib/dates'
import { libelleChamp, manquants } from '@/lib/redaction'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { dernierPaiement, paiementReussiPour } from '@/serveur/bdd/paiements'
import { bdd } from '@/serveur/bdd/client'
import { evenements } from '@/serveur/bdd/schema'
import { fournisseursDisponibles, montantAffichable } from '@/serveur/paiement'
import { eq } from 'drizzle-orm'
import styles from '../editeur.module.css'

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

  const paye = await paiementReussiPour(brouillon.id)
  const enLigne = brouillon.statut === 'publie' && paye

  if (enLigne) {
    const [fichiers] = await bdd
      .select({ png: evenements.fichierPng, pdf: evenements.fichierPdf })
      .from(evenements)
      .where(eq(evenements.id, brouillon.id))
      .limit(1)

    const lien = `/e/${brouillon.slug}`

    return (
      <div className={styles.formulaire}>
        <h1 className={styles.titre}>C’est en ligne.</h1>
        <p className={styles.introduction}>
          Partagez ce lien dans vos groupes WhatsApp : vos invités l’ouvriront sans rien
          installer.
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

        {(fichiers?.png || fichiers?.pdf) && (
          <>
            <h2 className={styles.titre} style={{ fontSize: 20 }}>
              Vos fichiers
            </h2>
            <div className={styles.actions}>
              {fichiers.png && (
                <a className="bouton-contour" href={fichiers.png} download>
                  Carte en haute définition
                </a>
              )}
              {fichiers.pdf && (
                <a className="bouton-contour" href={fichiers.pdf} download>
                  PDF imprimable
                </a>
              )}
            </div>
          </>
        )}

        <p className={styles.compteur}>
          Gardez cette adresse pour revenir modifier votre invitation :{' '}
          <code>/brouillon/{secret}</code>
        </p>
      </div>
    )
  }

  const aRemplir = manquants(brouillon.champs, brouillon.valeursChamps)
  const sansCeremonie = brouillon.ceremonies.length === 0
  const pret = aRemplir.length === 0 && !sansCeremonie
  const moyens = fournisseursDisponibles()
  const attente = await dernierPaiement(brouillon.id)
  const erreur = typeof requete.erreur === 'string' ? requete.erreur : undefined

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

      {requete.retour === 'echec' && (
        <p className={styles.avertissement}>
          Le paiement n’a pas abouti. Rien ne vous a été débité — vous pouvez réessayer.
        </p>
      )}
      {erreur && <p className={styles.avertissement}>{erreur}</p>}
      {requete.retour === 'succes' && !paye && (
        <p className={styles.rappel}>
          Votre paiement est en cours de confirmation. Rechargez cette page dans un instant.
        </p>
      )}

      <p className={styles.rappel}>
        {montantAffichable(brouillon.gabarit.prix)} — le lien d’invitation, le suivi des
        réponses, et vos fichiers en haute définition. Vous n’avez rien payé jusqu’ici.
      </p>

      {pret ? (
        <div className={styles.formulaire}>
          <h2 className={styles.titre} style={{ fontSize: 20 }}>
            Comment souhaitez-vous payer ?
          </h2>
          {moyens.length === 0 ? (
            <p className={styles.avertissement}>
              Aucun moyen de paiement n’est disponible pour le moment.
            </p>
          ) : (
            <div className={styles.actions}>
              {moyens.map((moyen) => (
                <form key={moyen.nom} method="post" action={`/brouillon/${secret}/payer`}>
                  <input type="hidden" name="fournisseur" value={moyen.nom} />
                  <button type="submit" className="bouton">
                    Payer avec {moyen.libelle}
                  </button>
                </form>
              ))}
            </div>
          )}
          {attente?.statut === 'en_attente' && attente.urlPaiement && (
            <p className={styles.compteur}>
              Un paiement est déjà ouvert.{' '}
              <a className="lien-sobre" href={attente.urlPaiement}>
                Le reprendre
              </a>
            </p>
          )}
        </div>
      ) : (
        <p className={styles.compteur}>
          Complétez ce qui manque ci-dessus pour pouvoir publier.
        </p>
      )}
    </div>
  )
}

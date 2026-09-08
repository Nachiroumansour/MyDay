import { notFound } from 'next/navigation'
import { formaterDateCourte } from '@/lib/dates'
import { compterParCeremonie, resumeReponses } from '@/lib/statistiques'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { reponsesPour } from '@/serveur/bdd/evenements'
import editeur from '../editeur.module.css'
import styles from './page.module.css'

/** Les réponses arrivent en continu : jamais de cache. */
export const dynamic = 'force-dynamic'

export default async function Reponses({
  params,
}: {
  params: Promise<{ secret: string }>
}) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  const reponses = await reponsesPour(brouillon.id)
  const resume = resumeReponses(reponses)
  const parCeremonie = compterParCeremonie(reponses, brouillon.ceremonies)

  const lien = `/e/${brouillon.slug}`
  const relance = `Petit rappel : notre invitation vous attend. Merci de répondre ici — ${lien}`

  return (
    <div className={editeur.formulaire} style={{ maxWidth: 'none' }}>
      <div>
        <h1 className={editeur.titre}>Les réponses</h1>
        <p className={editeur.introduction}>
          {brouillon.statut === 'publie'
            ? 'Mises à jour en direct, au fil des réponses de vos invités.'
            : 'Votre invitation n’est pas encore publiée : personne ne peut encore répondre.'}
        </p>
      </div>

      <div className={styles.chiffres}>
        <div className={styles.chiffre}>
          <span className={styles.valeurAccent}>{resume.personnes}</span>
          <span className={styles.intitule}>personnes attendues</span>
        </div>
        <div className={styles.chiffre}>
          <span className={styles.valeur}>{resume.presents}</span>
          <span className={styles.intitule}>réponses positives</span>
        </div>
        <div className={styles.chiffre}>
          <span className={styles.valeur}>{resume.absents}</span>
          <span className={styles.intitule}>ne peuvent pas venir</span>
        </div>
        <div className={styles.chiffre}>
          <span className={styles.valeur}>{resume.reponses}</span>
          <span className={styles.intitule}>réponses au total</span>
        </div>
      </div>

      {parCeremonie.length > 0 && (
        <section>
          <h2 className={editeur.titre} style={{ fontSize: 20, marginBottom: 8 }}>
            Cérémonie par cérémonie
          </h2>
          <ul className={styles.parCeremonie}>
            {parCeremonie.map((ceremonie) => (
              <li key={ceremonie.id} className={styles.ligneCeremonie}>
                <span className={styles.nomCeremonie}>{ceremonie.nom}</span>
                <span className={styles.detailCeremonie}>
                  {ceremonie.personnes} personne{ceremonie.personnes > 1 ? 's' : ''} ·{' '}
                  {ceremonie.foyers} réponse{ceremonie.foyers > 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={editeur.actions}>
        <a
          className="bouton"
          href={`https://wa.me/?text=${encodeURIComponent(relance)}`}
          target="_blank"
          rel="noreferrer"
        >
          Relancer sur WhatsApp
        </a>
        <a className="bouton-contour" href={`/brouillon/${secret}/reponses/export.csv`} download>
          Exporter en CSV
        </a>
      </div>

      {reponses.length === 0 ? (
        <p className={styles.vide}>
          Personne n’a encore répondu. Partagez votre lien : les réponses apparaîtront ici.
        </p>
      ) : (
        <div className={styles.tableau}>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Vient</th>
                <th>Personnes</th>
                <th>Cérémonies</th>
                <th>Mot</th>
                <th>Répondu</th>
              </tr>
            </thead>
            <tbody>
              {reponses.map((reponse) => (
                <tr key={reponse.id}>
                  <td>
                    {reponse.nom}
                    <br />
                    <a
                      className="lien-sobre"
                      href={`https://wa.me/${reponse.telephone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 13 }}
                    >
                      {reponse.telephone}
                    </a>
                  </td>
                  <td className={reponse.present ? styles.oui : styles.non}>
                    {reponse.present ? 'Oui' : 'Non'}
                  </td>
                  <td className={styles.nombre}>{reponse.present ? reponse.nbPersonnes : '—'}</td>
                  <td>
                    {reponse.ceremonieIds
                      .map((id) => brouillon.ceremonies.find((c) => c.id === id)?.nom)
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </td>
                  <td>{reponse.message ?? '—'}</td>
                  <td className={styles.nombre}>{formaterDateCourte(reponse.creeLe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { notFound } from 'next/navigation'
import { formaterDateCourte, formaterHeure } from '@/lib/dates'
import { compterParCeremonie, resumeReponses } from '@/lib/statistiques'
import { ChiffreAnime } from '@/composants/chiffre-anime'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { reponsesPour } from '@/serveur/bdd/evenements'
import editeur from '../editeur.module.css'
import styles from './page.module.css'

/** Les réponses arrivent en continu : jamais de cache. */
export const dynamic = 'force-dynamic'

const PASTILLES = [
  { teinte: '#FFDBCF', encre: '#822801', signe: '☺' },
  { teinte: '#DDF3E4', encre: '#14663A', signe: '✓' },
  { teinte: '#FFD9DD', encre: '#7C2A3B', signe: '✕' },
  { teinte: '#FED65B', encre: '#574500', signe: '✉' },
]

const TEINTES_INITIALES = [
  { teinte: '#FFDBCF', encre: '#822801' },
  { teinte: '#FED65B', encre: '#574500' },
  { teinte: '#FFD9DD', encre: '#7C2A3B' },
]

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .map((mot) => mot[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default async function Reponses({ params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  const reponses = await reponsesPour(brouillon.id)
  const resume = resumeReponses(reponses)
  const parCeremonie = compterParCeremonie(reponses, brouillon.ceremonies)
  const maximum = Math.max(1, ...parCeremonie.map((c) => c.personnes))

  const lien = `/e/${brouillon.slug}`
  const relance = `Petit rappel : notre invitation vous attend. Merci de répondre ici — ${lien}`

  const chiffres = [
    { valeur: resume.personnes, intitule: 'personnes attendues', detail: 'accompagnants compris', accent: true },
    { valeur: resume.presents, intitule: 'réponses positives', detail: 'foyers qui viennent' },
    { valeur: resume.absents, intitule: 'ne peuvent pas venir', detail: 'excusés' },
    { valeur: resume.reponses, intitule: 'réponses au total', detail: brouillon.statut === 'publie' ? 'mises à jour en direct' : 'invitation non publiée' },
  ]

  return (
    <div className={editeur.formulaire} style={{ maxWidth: 'none', gap: 28 }}>
      <div className={styles.entete}>
        <p className="sur-titre">Espace organisateur</p>
        <h1 className={styles.titre}>{brouillon.titre}</h1>
        <p className={styles.intro}>
          {brouillon.statut === 'publie'
            ? 'Suivi des réponses de vos invités, cérémonie par cérémonie.'
            : 'Votre invitation n’est pas encore publiée : personne ne peut encore répondre.'}
        </p>
      </div>

      <div className={styles.chiffres}>
        {chiffres.map((chiffre, rang) => {
          const pastille = PASTILLES[rang]!
          return (
            <div
              key={chiffre.intitule}
              className={styles.chiffre}
              style={{
                ['--teinte-pastille' as string]: pastille.teinte,
                ['--sur-pastille' as string]: pastille.encre,
              }}
            >
              <span className={styles.chiffreTete}>
                <span className={styles.intitule}>{chiffre.intitule}</span>
                <span className={styles.pastille} aria-hidden="true">
                  {pastille.signe}
                </span>
              </span>
              <span className={chiffre.accent ? styles.valeurAccent : styles.valeur}>
                <ChiffreAnime valeur={chiffre.valeur} />
              </span>
              <span className={styles.detail}>{chiffre.detail}</span>
            </div>
          )
        })}
      </div>

      {parCeremonie.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 className={styles.panneauTitre}>Suivi par cérémonie</h2>
          <ul className={styles.parCeremonie}>
            {parCeremonie.map((compte) => {
              const ceremonie = brouillon.ceremonies.find((c) => c.id === compte.id)
              const part = Math.round((compte.personnes / maximum) * 100)
              return (
                <li key={compte.id} className={styles.ligneCeremonie}>
                  {ceremonie && (
                    <span className={styles.quandCeremonie}>
                      {formaterDateCourte(ceremonie.debuteLe)} · {formaterHeure(ceremonie.debuteLe)}
                    </span>
                  )}
                  <span className={styles.nomCeremonie}>{compte.nom}</span>

                  <span className={styles.mesure}>
                    <span className={styles.mesureValeur}>{compte.personnes} pers.</span>
                    <span className={styles.mesureLibelle}>
                      {compte.foyers} réponse{compte.foyers > 1 ? 's' : ''}
                    </span>
                  </span>

                  <span className={styles.jauge}>
                    <span className={styles.jaugeRemplie} style={{ width: `${part}%` }} />
                  </span>

                  {ceremonie && <span className={styles.lieuCeremonie}>{ceremonie.lieu}</span>}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className={styles.panneau}>
        <div className={styles.panneauTete}>
          <div>
            <h2 className={styles.panneauTitre}>Liste des réponses</h2>
            <p className={styles.intro}>Contactez vos invités d’un clic, ou exportez la liste.</p>
          </div>
          <div className={editeur.actions} style={{ paddingTop: 0 }}>
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
                  <th>Invité</th>
                  <th>Statut</th>
                  <th>Cérémonies</th>
                  <th>Personnes</th>
                  <th>Mot</th>
                  <th>Répondu</th>
                </tr>
              </thead>
              <tbody>
                {reponses.map((reponse, rang) => {
                  const couleur = TEINTES_INITIALES[rang % TEINTES_INITIALES.length]!
                  return (
                    <tr key={reponse.id}>
                      <td>
                        <span className={styles.invite}>
                          <span
                            className={styles.initiales}
                            style={{
                              ['--teinte-initiales' as string]: couleur.teinte,
                              ['--sur-initiales' as string]: couleur.encre,
                            }}
                            aria-hidden="true"
                          >
                            {initiales(reponse.nom)}
                          </span>
                          <span>
                            <span className={styles.inviteNom}>{reponse.nom}</span>
                            <a
                              className={styles.inviteTel}
                              href={`https://wa.me/${reponse.telephone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {reponse.telephone}
                            </a>
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className={reponse.present ? styles.present : styles.absent}>
                          {reponse.present ? 'Présent' : 'Absent'}
                        </span>
                      </td>
                      <td>
                        <span className={styles.jetons}>
                          {reponse.ceremonieIds
                            .map((id) => brouillon.ceremonies.find((c) => c.id === id)?.nom)
                            .filter(Boolean)
                            .map((nom) => (
                              <span key={nom} className={styles.jeton}>
                                {nom}
                              </span>
                            ))}
                          {reponse.ceremonieIds.length === 0 && <span className={styles.jeton}>—</span>}
                        </span>
                      </td>
                      <td className={styles.nombre}>{reponse.present ? reponse.nbPersonnes : '—'}</td>
                      <td className={styles.mot}>{reponse.message ? `« ${reponse.message} »` : '—'}</td>
                      <td className={styles.nombre}>{formaterDateCourte(reponse.creeLe)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

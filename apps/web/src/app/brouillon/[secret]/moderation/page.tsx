import { notFound } from 'next/navigation'
import { formaterDateCourte } from '@/lib/dates'
import { montantAffichable } from '@/serveur/paiement'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { livreOrComplet, participationsReussies, photosCompletes } from '@/serveur/bdd/modules'
import { trancherMessage, trancherPhoto } from '../modules-actions'
import styles from '../editeur.module.css'

export const dynamic = 'force-dynamic'

export default async function Moderation({
  params,
}: {
  params: Promise<{ secret: string }>
}) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  const [messages, photos, participations] = await Promise.all([
    livreOrComplet(brouillon.id),
    photosCompletes(brouillon.id),
    participationsReussies(brouillon.id),
  ])

  const total = participations.reduce((somme, p) => somme + p.montant, 0)
  const riennOuvert =
    !brouillon.livreOrOuvert && !brouillon.galerieOuverte && !brouillon.cagnotteOuverte

  return (
    <div className={styles.formulaire} style={{ maxWidth: 'none' }}>
      <div style={{ maxWidth: 560 }}>
        <h1 className={styles.titre}>Ce que déposent vos invités</h1>
        <p className={styles.introduction}>
          Vous décidez de ce qui reste visible. Rien n’est définitif : un mot ou une photo
          masqués peuvent être remis en ligne.
        </p>
      </div>

      {riennOuvert && (
        <p className={styles.rappel}>
          Le livre d’or, la galerie et la cagnotte sont fermés.{' '}
          <a className="lien-sobre" href={`/brouillon/${secret}/details`}>
            Les ouvrir dans les détails
          </a>
        </p>
      )}

      {brouillon.cagnotteOuverte && (
        <section>
          <h2 className={styles.titre} style={{ fontSize: 20 }}>
            La cagnotte
          </h2>
          <p className={styles.rappel} style={{ marginTop: 12 }}>
            {montantAffichable(total)} reçus, {participations.length} participation
            {participations.length > 1 ? 's' : ''}.
          </p>
          <ul className={styles.liste} style={{ marginTop: 16 }}>
            {participations.map((participation) => (
              <li key={participation.id} className={styles.carteCeremonie}>
                <div className={styles.carteCeremonieTete}>
                  <span className={styles.carteCeremonieNom}>{participation.contributeur}</span>
                  <span className={styles.carteCeremonieQuand}>
                    {montantAffichable(participation.montant)}
                  </span>
                </div>
                {participation.message && <p>{participation.message}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {brouillon.livreOrOuvert && (
        <section>
          <h2 className={styles.titre} style={{ fontSize: 20 }}>
            Le livre d’or
          </h2>
          {messages.length === 0 ? (
            <p className={styles.compteur} style={{ marginTop: 12 }}>
              Aucun mot pour l’instant.
            </p>
          ) : (
            <ul className={styles.liste} style={{ marginTop: 16 }}>
              {messages.map((mot) => (
                <li key={mot.id} className={styles.carteCeremonie}>
                  <div className={styles.carteCeremonieTete}>
                    <span className={styles.carteCeremonieNom}>{mot.auteur}</span>
                    <span className={styles.carteCeremonieQuand}>
                      {formaterDateCourte(mot.creeLe)}
                      {mot.statut === 'masque' ? ' · masqué' : ''}
                    </span>
                  </div>
                  <p>{mot.message}</p>
                  <form action={trancherMessage}>
                    <input type="hidden" name="secret" value={secret} />
                    <input type="hidden" name="messageId" value={mot.id} />
                    <input
                      type="hidden"
                      name="statut"
                      value={mot.statut === 'masque' ? 'publie' : 'masque'}
                    />
                    <button type="submit" className={styles.lienDanger}>
                      {mot.statut === 'masque' ? 'Remettre en ligne' : 'Masquer ce mot'}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {brouillon.galerieOuverte && (
        <section>
          <h2 className={styles.titre} style={{ fontSize: 20 }}>
            Les photos
          </h2>
          {photos.length === 0 ? (
            <p className={styles.compteur} style={{ marginTop: 12 }}>
              Aucune photo pour l’instant.
            </p>
          ) : (
            <ul className={styles.liste} style={{ marginTop: 16 }}>
              {photos.map((photo) => (
                <li key={photo.id} className={styles.carteCeremonie}>
                  <div className={styles.carteCeremonieTete}>
                    <span className={styles.carteCeremonieNom}>
                      {photo.deposantNom ?? 'Anonyme'}
                    </span>
                    <span className={styles.carteCeremonieQuand}>
                      {photo.statut === 'masque' ? 'masquée' : 'en ligne'}
                    </span>
                  </div>
                  <img
                    src={photo.url}
                    alt=""
                    style={{ width: 160, height: 160, objectFit: 'cover', border: '1px solid var(--trait)' }}
                  />
                  <form action={trancherPhoto}>
                    <input type="hidden" name="secret" value={secret} />
                    <input type="hidden" name="photoId" value={photo.id} />
                    <input
                      type="hidden"
                      name="statut"
                      value={photo.statut === 'masque' ? 'publie' : 'masque'}
                    />
                    <button type="submit" className={styles.lienDanger}>
                      {photo.statut === 'masque' ? 'Remettre en ligne' : 'Masquer cette photo'}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

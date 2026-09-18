import { origineDePage } from '@/serveur/origine'
import { notFound } from 'next/navigation'
import { messageInvitation } from '@/lib/invites'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { invitesPour } from '@/serveur/bdd/modules'
import { importerInvites, supprimerInvite } from '../modules-actions'
import styles from '../editeur.module.css'

export const dynamic = 'force-dynamic'

export default async function Invites({
  params,
}: {
  params: Promise<{ secret: string }>
}) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  const liste = await invitesPour(brouillon.id)
  const base = await origineDePage()

  return (
    <div className={styles.formulaire} style={{ maxWidth: 'none' }}>
      <div style={{ maxWidth: 560 }}>
        <h1 className={styles.titre}>Vos invités</h1>
        <p className={styles.introduction}>
          Facultatif, mais c’est ce qui fait le plus d’effet : chacun reçoit un lien à son
          nom, l’enveloppe l’accueille par son prénom, et sa réponse est déjà pré-remplie.
        </p>
      </div>

      <form action={importerInvites} className={styles.formulaire}>
        <input type="hidden" name="secret" value={secret} />
        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="liste">
            Collez votre liste — un invité par ligne
          </label>
          <textarea
            id="liste"
            name="liste"
            className="saisie"
            rows={6}
            placeholder={'Aminata Diallo, 77 123 45 67\nMoussa Fall\nFatou Sarr, 76 555 44 33'}
          />
          <p className={styles.compteur}>
            Le numéro après la virgule est facultatif ; il sert à pré-remplir la réponse.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="submit" className="bouton">
            Ajouter à la liste
          </button>
        </div>
      </form>

      {liste.length === 0 ? (
        <p className={styles.compteur}>
          Aucun invité nommé pour l’instant. Votre lien général fonctionne quand même.
        </p>
      ) : (
        <ul className={styles.liste}>
          {liste.map((invite) => {
            const lien = `/e/${brouillon.slug}/i/${invite.jeton}`
            const message = messageInvitation(invite.nomComplet, brouillon.titre, `${base}${lien}`)
            return (
              <li key={invite.id} className={styles.carteCeremonie}>
                <div className={styles.carteCeremonieTete}>
                  <span className={styles.carteCeremonieNom}>{invite.nomComplet}</span>
                  <form action={supprimerInvite}>
                    <input type="hidden" name="secret" value={secret} />
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <button type="submit" className={styles.lienDanger}>
                      Retirer
                    </button>
                  </form>
                </div>
                <p className={styles.carteCeremonieQuand}>{lien}</p>
                <div className={styles.actions}>
                  <a
                    className="bouton-contour"
                    href={
                      invite.telephone
                        ? `https://wa.me/${invite.telephone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
                        : `https://wa.me/?text=${encodeURIComponent(message)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Envoyer sur WhatsApp
                  </a>
                  <a className="bouton-contour" href={lien}>
                    Voir son invitation
                  </a>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

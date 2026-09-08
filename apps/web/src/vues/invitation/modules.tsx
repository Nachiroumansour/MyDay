/** @jsxImportSource preact */

import { formaterDateCourte } from '@/lib/dates'
import { IconeCoche } from './icones'
import type { MessageVue, ParticipationVue, PhotoVue } from '@/serveur/bdd/modules'

function Recu({ titre, texte }: { titre: string; texte?: string }) {
  return (
    <div className="merci">
      <span className="merci-pastille">
        <IconeCoche />
      </span>
      <p className="merci-titre">{titre}</p>
      {texte && <p className="aide">{texte}</p>}
    </div>
  )
}

export function LivreOr({
  slug,
  messages,
  depose,
}: {
  slug: string
  messages: MessageVue[]
  depose: boolean
}) {
  return (
    <section className="section" id="livre-or">
      <h2 className="titre-section">Le livre d’or</h2>

      <div className="rsvp-carte">
        {depose ? (
          <Recu titre="Merci pour votre mot." texte="Il apparaîtra ici une fois relu par les hôtes." />
        ) : (
          <form method="post" action={`/e/${slug}/livre-or`} className="rsvp">
            <div className="champ">
              <label className="etiquette" htmlFor="or-auteur">Signez votre mot</label>
              <input id="or-auteur" name="auteur" className="saisie" required maxLength={80} />
            </div>
            <div className="champ">
              <label className="etiquette" htmlFor="or-message">Votre mot pour les hôtes</label>
              <textarea id="or-message" name="message" className="zone" required maxLength={600} />
            </div>
            <button type="submit" className="envoyer">Laisser mon mot</button>
          </form>
        )}
      </div>

      {messages.length > 0 && (
        <ul className="mots">
          {messages.map((mot) => (
            <li key={mot.id} className="mot-invite">
              <p>{mot.message}</p>
              <p className="mot-invite-signature">
                {mot.auteur} — {formaterDateCourte(mot.creeLe)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function Galerie({
  slug,
  photos,
  depose,
}: {
  slug: string
  photos: PhotoVue[]
  depose: boolean
}) {
  return (
    <section className="section" id="galerie">
      <h2 className="titre-section">Vos photos</h2>
      <p className="aide">
        Déposez ici les photos que vous avez prises. Les hôtes les retrouveront toutes au
        même endroit.
      </p>

      <div className="rsvp-carte">
        {depose ? (
          <Recu titre="Photo reçue, merci." />
        ) : (
          <form method="post" action={`/e/${slug}/photo`} encType="multipart/form-data" className="rsvp">
            <div className="champ">
              <label className="etiquette" htmlFor="ga-nom">Qui dépose cette photo ?</label>
              <input id="ga-nom" name="nom" className="saisie" maxLength={80} />
            </div>
            <div className="champ">
              <label className="etiquette" htmlFor="ga-photo">Votre photo</label>
              <input id="ga-photo" name="photo" type="file"
                     accept="image/png,image/jpeg,image/webp" className="saisie" required />
              <p className="aide">JPEG, PNG ou WebP, 8 Mo maximum.</p>
            </div>
            <button type="submit" className="envoyer">Déposer ma photo</button>
          </form>
        )}
      </div>

      {photos.length > 0 && (
        <ul className="grille-photos">
          {photos.map((photo) => (
            <li key={photo.id}>
              <img
                src={photo.url}
                alt={photo.deposantNom ? `Photo de ${photo.deposantNom}` : 'Photo'}
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function Cagnotte({
  slug,
  mot,
  participations,
  envoyee,
}: {
  slug: string
  mot: string | null
  participations: ParticipationVue[]
  envoyee: boolean
}) {
  return (
    <section className="section" id="participer">
      <h2 className="titre-section">Participer</h2>
      {mot && <p className="mot">{mot}</p>}

      <div className="rsvp-carte">
        {envoyee ? (
          <Recu titre="Merci pour votre participation." />
        ) : (
          <form method="post" action={`/e/${slug}/participer`} className="rsvp">
            <div className="champ">
              <label className="etiquette" htmlFor="ca-nom">De la part de</label>
              <input id="ca-nom" name="contributeur" className="saisie" required maxLength={80} />
            </div>
            <div className="champ">
              <label className="etiquette" htmlFor="ca-montant">Montant</label>
              <input id="ca-montant" name="montant" type="number" inputMode="numeric"
                     min={500} step={500} className="saisie" required />
              <p className="aide">En francs CFA.</p>
            </div>
            <div className="champ">
              <label className="etiquette" htmlFor="ca-message">
                Un mot <span className="aide">(facultatif)</span>
              </label>
              <textarea id="ca-message" name="message" className="zone" maxLength={300} />
            </div>
            <button type="submit" className="envoyer">Participer</button>
          </form>
        )}
      </div>

      {participations.length > 0 && (
        <ul className="mots">
          {participations.map((participation) => (
            <li key={participation.id} className="mot-invite">
              {participation.message && <p>{participation.message}</p>}
              {/* Les montants ne sont jamais montrés aux autres invités. */}
              <p className="mot-invite-signature">{participation.contributeur}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

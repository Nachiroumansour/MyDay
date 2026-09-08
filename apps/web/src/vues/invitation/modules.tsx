/** @jsxImportSource preact */

import { formaterDateCourte } from '@/lib/dates'
import { montantAffichable } from '@/serveur/paiement/montant'
import type { MessageVue, ParticipationVue, PhotoVue } from '@/serveur/bdd/modules'

/* ---------- Livre d'or ---------- */

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
      <h2 className="titre-section"><span className="titre-emoji">✍️</span>Le livre d’or</h2>

      {depose ? (
        <div className="merci">
          <p className="merci-titre">Merci pour votre mot.</p>
          <p className="aide">Il apparaîtra ici une fois relu par les hôtes.</p>
        </div>
      ) : (
        <form method="post" action={`/e/${slug}/livre-or`} className="rsvp">
          <div className="champ">
            <label className="etiquette" htmlFor="or-auteur">
              Signez votre mot
            </label>
            <input id="or-auteur" name="auteur" className="saisie" required maxLength={80} />
          </div>
          <div className="champ">
            <label className="etiquette" htmlFor="or-message">
              Votre mot pour les hôtes
            </label>
            <textarea
              id="or-message"
              name="message"
              className="zone"
              required
              maxLength={600}
            />
          </div>
          <button type="submit" className="envoyer">
            Laisser mon mot
          </button>
        </form>
      )}

      {messages.length > 0 && (
        <ul className="mots">
          {messages.map((mot) => (
            <li key={mot.id} className="mot-invite">
              <p>{mot.message}</p>
              <p className="mot-signature">
                {mot.auteur} · {formaterDateCourte(mot.creeLe)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ---------- Galerie partagée ---------- */

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
      <h2 className="titre-section"><span className="titre-emoji">📸</span>Vos photos</h2>
      <p className="aide">
        Déposez ici les photos que vous avez prises. Les hôtes les retrouveront toutes au
        même endroit.
      </p>

      {depose ? (
        <div className="merci">
          <p className="merci-titre">Photo reçue, merci.</p>
        </div>
      ) : (
        <form
          method="post"
          action={`/e/${slug}/photo`}
          encType="multipart/form-data"
          className="rsvp"
        >
          <div className="champ">
            <label className="etiquette" htmlFor="ga-nom">
              Qui dépose cette photo ?
            </label>
            <input id="ga-nom" name="nom" className="saisie" maxLength={80} />
          </div>
          <div className="champ">
            <label className="etiquette" htmlFor="ga-photo">
              Votre photo
            </label>
            <input
              id="ga-photo"
              name="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="saisie"
              required
            />
            <p className="aide">JPEG, PNG ou WebP, 8 Mo maximum.</p>
          </div>
          <button type="submit" className="envoyer">
            Déposer ma photo
          </button>
        </form>
      )}

      {photos.length > 0 && (
        <ul className="grille-photos">
          {photos.map((photo) => (
            <li key={photo.id}>
              <img src={photo.url} alt={photo.deposantNom ? `Photo de ${photo.deposantNom}` : 'Photo'} loading="lazy" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ---------- Cagnotte ---------- */

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
      <h2 className="titre-section"><span className="titre-emoji">🎁</span>Participer</h2>
      {mot && <p className="mot">{mot}</p>}

      {envoyee ? (
        <div className="merci">
          <p className="merci-titre">Merci pour votre participation.</p>
        </div>
      ) : (
        <form method="post" action={`/e/${slug}/participer`} className="rsvp">
          <div className="champ">
            <label className="etiquette" htmlFor="ca-nom">
              De la part de
            </label>
            <input id="ca-nom" name="contributeur" className="saisie" required maxLength={80} />
          </div>
          <div className="champ">
            <label className="etiquette" htmlFor="ca-montant">
              Montant
            </label>
            <input
              id="ca-montant"
              name="montant"
              type="number"
              inputMode="numeric"
              min={500}
              step={500}
              className="saisie"
              required
            />
            <p className="aide">En francs CFA.</p>
          </div>
          <div className="champ">
            <label className="etiquette" htmlFor="ca-message">
              Un mot <span className="aide">(facultatif)</span>
            </label>
            <textarea id="ca-message" name="message" className="zone" maxLength={300} />
          </div>
          <button type="submit" className="envoyer">
            Participer
          </button>
        </form>
      )}

      {participations.length > 0 && (
        <ul className="mots">
          {participations.map((participation) => (
            <li key={participation.id} className="mot-invite">
              {participation.message && <p>{participation.message}</p>}
              <p className="mot-signature">
                {participation.contributeur}
                {/* Les montants ne sont jamais montrés aux autres invités. */}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function totalCagnotte(participations: ParticipationVue[]): string {
  return montantAffichable(participations.reduce((somme, p) => somme + p.montant, 0))
}

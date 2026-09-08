/** @jsxImportSource preact */

import { IconeCoche } from './icones'

interface CeremonieChoisissable {
  id: string
  nom: string
  quand: string
}

interface Props {
  slug: string
  ceremonies: CeremonieChoisissable[]
  /** Champs signalés fautifs par la route de réception. */
  champsFautifs: string[]
  /** Choix précédent, renvoyé après une erreur, pour rouvrir le formulaire. */
  choixPrecedent?: 'oui' | 'non'
  /** L'invité nommé : son nom et son numéro sont déjà connus. */
  invite?: { nomComplet: string; telephone: string | null }
}

const MESSAGES: Record<string, string> = {
  nom: 'Indiquez votre nom.',
  telephone: 'Ce numéro ne semble pas valide. Exemple : 77 123 45 67.',
  nbPersonnes: 'Indiquez combien vous serez.',
  ceremonieIds: 'Choisissez au moins une cérémonie.',
}

export function Merci() {
  return (
    <div className="merci">
      <span className="merci-pastille">
        <IconeCoche />
      </span>
      <p className="merci-titre">C’est noté, merci.</p>
      <p className="aide">
        Les hôtes ont reçu votre réponse. Revenez quand vous voulez pour retrouver le
        programme et les adresses.
      </p>
    </div>
  )
}

/**
 * Un formulaire HTML ordinaire, sans une ligne de JavaScript.
 * La révélation progressive se fait en CSS ; le choix « présent ou non » passe
 * par deux boutons radio déguisés en boutons, ce qui préserve le clavier et
 * les lecteurs d'écran.
 */
export default function Rsvp({
  slug,
  ceremonies,
  champsFautifs,
  choixPrecedent,
  invite,
}: Props) {
  const erreur = (champ: string) =>
    champsFautifs.includes(champ) ? MESSAGES[champ] : undefined

  return (
    <form method="post" action={`/e/${slug}/repondre`} className="rsvp">
      <div>
        <p className="pli-sur-titre">Confirmation de présence</p>
        <h2 className="rsvp-titre">S’inscrire en dix secondes</h2>
        <p className="rsvp-intro">Sans créer de compte. Vos hôtes reçoivent votre réponse aussitôt.</p>
      </div>

      <div className="choix">
        <input type="radio" id="rsvp-oui" name="present" value="oui" className="radio"
               defaultChecked={choixPrecedent === 'oui'} required />
        <label htmlFor="rsvp-oui" className="bouton-choix">Je serai là</label>

        <input type="radio" id="rsvp-non" name="present" value="non" className="radio radio-absent"
               defaultChecked={choixPrecedent === 'non'} />
        <label htmlFor="rsvp-non" className="bouton-choix">Je ne peux pas</label>
      </div>

      <div className="details">
        <div className="champ">
          <label className="etiquette" htmlFor="rsvp-nom">Votre nom et prénom</label>
          <input id="rsvp-nom" name="nom" className="saisie" autoComplete="name"
                 placeholder="Aminata Diallo" defaultValue={invite?.nomComplet ?? ''} required />
          {erreur('nom') && <p className="erreur">{erreur('nom')}</p>}
        </div>

        <div className="champ">
          <label className="etiquette" htmlFor="rsvp-telephone">Votre numéro WhatsApp</label>
          <input id="rsvp-telephone" name="telephone" className="saisie" type="tel"
                 inputMode="tel" autoComplete="tel" placeholder="77 123 45 67"
                 defaultValue={invite?.telephone ?? ''} required />
          {erreur('telephone')
            ? <p className="erreur">{erreur('telephone')}</p>
            : <p className="aide">Seuls les hôtes le voient.</p>}
        </div>

        {ceremonies.length > 1 ? (
          <fieldset className="ceremonies si-present">
            <legend>À quelles cérémonies serez-vous ?</legend>
            {ceremonies.map((ceremonie) => (
              <label key={ceremonie.id} className="coche" title={ceremonie.quand}>
                <input type="checkbox" name="ceremonies" value={ceremonie.id} />
                {ceremonie.nom}
              </label>
            ))}
            {erreur('ceremonieIds') && <p className="erreur">{erreur('ceremonieIds')}</p>}
          </fieldset>
        ) : (
          ceremonies[0] && <input type="hidden" name="ceremonies" value={ceremonies[0].id} />
        )}

        <div className="champ si-present">
          <label className="etiquette" htmlFor="rsvp-nb">Vous serez combien ?</label>
          <select id="rsvp-nb" name="nbPersonnes" className="liste" defaultValue="1">
            {Array.from({ length: 10 }, (_, rang) => rang + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? '1 personne (moi seul)' : `${n} personnes`}
              </option>
            ))}
          </select>
          {erreur('nbPersonnes') && <p className="erreur">{erreur('nbPersonnes')}</p>}
        </div>

        <div className="champ">
          <label className="etiquette" htmlFor="rsvp-message">
            Un mot pour les hôtes <span className="aide">(facultatif)</span>
          </label>
          <textarea id="rsvp-message" name="message" className="zone" maxLength={500} />
        </div>

        <button type="submit" className="envoyer">Envoyer ma réponse</button>
      </div>
    </form>
  )
}

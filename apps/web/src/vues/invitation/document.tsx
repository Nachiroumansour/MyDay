/** @jsxImportSource preact */

import { render } from 'preact-render-to-string'
import Enveloppe, { SCRIPT_ENVELOPPE, scriptMemoire } from './enveloppe'
import { Ambiance } from './ambiance'
import CompteARebours, { SCRIPT_COMPTEUR } from './compteur'
import Rsvp, { Merci } from './rsvp'
import { Cagnotte, Galerie, LivreOr } from './modules'
import { IconeAnneau, IconeColombe, IconeCoupe, IconeLieu, IconeTenue } from './icones'
import { STYLES } from './styles'
import { detaillerRestant, formaterDateLongue, formaterPlage } from '@/lib/dates'
import { lienGoogleMaps } from '@/lib/itineraire'
import type { CeremonieVue, EvenementVue } from '@/serveur/bdd/evenements'
import type { MessageVue, ParticipationVue, PhotoVue } from '@/serveur/bdd/modules'

export interface ContexteInvitation {
  evenement: EvenementVue
  couleur: string
  origine: string
  /** Proportions de la carte, pour réserver sa place avant qu'elle ne charge. */
  proportions: { largeur: number; hauteur: number }
  reponseEnvoyee: boolean
  champsFautifs: string[]
  choixPrecedent?: 'oui' | 'non'
  /** L'invité qui ouvre son lien nominatif. */
  invite?: { nomComplet: string; telephone: string | null; jeton: string }
  messages: MessageVue[]
  photos: PhotoVue[]
  participations: ParticipationVue[]
  /** Modules dont le formulaire vient d'être envoyé. */
  deposes: { livreOr: boolean; photo: boolean; participation: boolean }
}

/** Chaque type de fête a sa teinte de badge et son icône. */
const HABILLAGE = {
  mariage: { teinte: '#FFDBCF', encre: '#822801', badge: 'Takk & réception', Icone: IconeAnneau },
  bapteme: { teinte: '#FED65B', encre: '#574500', badge: 'Ngénte', Icone: IconeColombe },
  anniversaire: { teinte: '#FFD9DD', encre: '#7C2A3B', badge: 'Réception', Icone: IconeCoupe },
} as const

function BlocCeremonie({
  ceremonie,
  slug,
  type,
  tenueGenerale,
}: {
  ceremonie: CeremonieVue
  slug: string
  type: keyof typeof HABILLAGE
  tenueGenerale: string | null
}) {
  const { teinte, encre, badge, Icone } = HABILLAGE[type]

  // Ne pas répéter la tenue générale sur chaque cérémonie : seule une tenue
  // qui s'en écarte mérite d'être signalée ici.
  const tenuePropre =
    ceremonie.codeVestimentaire && ceremonie.codeVestimentaire !== tenueGenerale
      ? ceremonie.codeVestimentaire
      : undefined

  return (
    <li
      className="ceremonie"
      style={{ ['--teinte-ceremonie' as string]: teinte, ['--sur-ceremonie' as string]: encre }}
    >
      <span className="ceremonie-pastille">
        <Icone />
      </span>

      <div className="ceremonie-corps">
        <span className="ceremonie-badge">{ceremonie.nom || badge}</span>
        <p className="ceremonie-quand">
          {formaterDateLongue(ceremonie.debuteLe)}
          {ceremonie.termineLe ? ', ' : ' à '}
          {formaterPlage(ceremonie.debuteLe, ceremonie.termineLe)}
        </p>
        <p className="ceremonie-lieu">{ceremonie.lieu}</p>
        {ceremonie.adresse && <p className="aide">{ceremonie.adresse}</p>}

        {ceremonie.repere && (
          <p className="repere">
            <IconeLieu />
            {ceremonie.repere}
          </p>
        )}

        {ceremonie.note && <p className="note">{ceremonie.note}</p>}
        {tenuePropre && <p className="note">Tenue : {tenuePropre}</p>}

        <div className="actions">
          <a className="action" href={lienGoogleMaps(ceremonie)} target="_blank" rel="noreferrer">
            Itinéraire
          </a>
          <a className="action action-pleine" href={`/e/${slug}/agenda/${ceremonie.id}`}>
            Agenda
          </a>
        </div>
      </div>
    </li>
  )
}

function Corps({
  evenement,
  proportions,
  reponseEnvoyee,
  champsFautifs,
  choixPrecedent,
  invite,
  messages,
  photos,
  participations,
  deposes,
}: ContexteInvitation) {
  const slug = evenement.slug
  const premiere = evenement.ceremonies[0]
  const restant = premiere ? detaillerRestant(premiere.debuteLe) : null
  const partage = `Une invitation pour vous — ${evenement.titre}`
  const type = evenement.typeEvenement

  return (
    <>
      <Enveloppe
        slug={slug}
        titre={evenement.titre}
        intitule={evenement.titre}
        type={type}
        {...(invite ? { invite: invite.nomComplet } : {})}
      />

      <main>
        <header className="hero">
          <Ambiance type={type} />

          <p className="hero-sur-titre">
            {invite ? `Pour ${invite.nomComplet}` : 'Invitation officielle'}
          </p>
          <p className="hero-noms">{evenement.titre}</p>

          <span className="carte-cadre">
            <img
              className="carte"
              src={`/e/${slug}/carte.webp?l=900`}
              width={proportions.largeur}
              height={proportions.hauteur}
              alt={`Invitation de ${evenement.titre}`}
              fetchPriority="high"
            />
          </span>

          {restant && premiere && (
            <CompteARebours
              restant={restant}
              cible={premiere.debuteLe}
              legende={formaterDateLongue(premiere.debuteLe)}
            />
          )}
        </header>

        {evenement.motDesHotes && (
          <section className="section">
            <div className="mot-carte">
              <span className="mot-pastille" aria-hidden="true">
                “
              </span>
              <div>
                <p className="mot-titre">Un mot de la famille</p>
                <p className="mot">{evenement.motDesHotes}</p>
              </div>
            </div>
          </section>
        )}

        {evenement.ceremonies.length > 0 && (
          <section className="section">
            <div className="titre-section-rangee">
              <h2 className="titre-section">Programme des cérémonies</h2>
              <span className="compte-section">
                {evenement.ceremonies.length} événement
                {evenement.ceremonies.length > 1 ? 's' : ''}
              </span>
            </div>
            <ol className="programme">
              {evenement.ceremonies.map((ceremonie) => (
                <BlocCeremonie
                  key={ceremonie.id}
                  ceremonie={ceremonie}
                  slug={slug}
                  type={type}
                  tenueGenerale={evenement.codeVestimentaire}
                />
              ))}
            </ol>
          </section>
        )}

        {evenement.codeVestimentaire && (
          <section className="section">
            <div className="tenue-carte">
              <div className="tenue-corps">
                <span className="tenue-sur-titre">Recommandation vestimentaire</span>
                <span className="tenue-valeur">{evenement.codeVestimentaire}</span>
                <span className="tenue-texte">
                  Pour honorer cette journée, nous vous prions de porter ces couleurs.
                </span>
              </div>
              <span className="tenue-pastille">
                <IconeTenue />
              </span>
            </div>
          </section>
        )}

        <section className="section" id="repondre">
          <div className="rsvp-carte">
            {reponseEnvoyee ? (
              <Merci />
            ) : (
              <Rsvp
                slug={slug}
                champsFautifs={champsFautifs}
                {...(choixPrecedent ? { choixPrecedent } : {})}
                {...(invite ? { invite } : {})}
                ceremonies={evenement.ceremonies.map((c) => ({
                  id: c.id,
                  nom: c.nom,
                  quand: `${formaterDateLongue(c.debuteLe)} · ${formaterPlage(c.debuteLe, c.termineLe)}`,
                }))}
              />
            )}
          </div>
        </section>

        {evenement.livreOrOuvert && (
          <LivreOr slug={slug} messages={messages} depose={deposes.livreOr} />
        )}

        {evenement.galerieOuverte && (
          <Galerie slug={slug} photos={photos} depose={deposes.photo} />
        )}

        {evenement.cagnotteOuverte && (
          <Cagnotte
            slug={slug}
            mot={evenement.cagnotteMot}
            participations={participations}
            envoyee={deposes.participation}
          />
        )}

        <footer className="pied">
          {evenement.telephoneHote && (
            <a
              className="whatsapp"
              href={`https://wa.me/${evenement.telephoneHote.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              Contacter les hôtes sur WhatsApp
            </a>
          )}
          <a
            className="partage"
            href={`https://wa.me/?text=${encodeURIComponent(partage)}`}
            target="_blank"
            rel="noreferrer"
          >
            Partager l’invitation
          </a>
          <p className="signature">
            Créé avec <a href="/">MyDay</a> — créez la vôtre.
          </p>
        </footer>
      </main>
    </>
  )
}

/**
 * Produit le document complet de la page invitation.
 *
 * Rendu en HTML statique, hors du routeur de Next : celui-ci embarque plus de
 * 400 Ko de socle React quoi qu'on fasse, ce qui est intenable sur la page que
 * tous les invités ouvrent, souvent en 3G (spec §4.5). Ici le seul script est
 * l'ouverture de l'enveloppe, et il pèse quelques centaines d'octets.
 */
export function documentInvitation(contexte: ContexteInvitation): string {
  const { evenement, couleur, origine } = contexte
  const premiere = evenement.ceremonies[0]
  const description = premiere
    ? `${formaterDateLongue(premiere.debuteLe)} — ${premiere.lieu}`
    : 'Vous êtes attendu'

  const url = `${origine}/e/${evenement.slug}`
  const apercu = `${origine}/e/${evenement.slug}/apercu.png`

  const document = render(
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`${evenement.titre} — Invitation`}</title>
        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={evenement.titre} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={apercu} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content={couleur} />

        <link rel="preload" href="/polices/playfair-display.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/polices/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <script dangerouslySetInnerHTML={{ __html: scriptMemoire(evenement.slug) }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: '#enveloppe{display:none!important}' }} />
        </noscript>
      </head>
      <body>
        <Corps {...contexte} />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ENVELOPPE }} />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_COMPTEUR }} />
      </body>
    </html>,
  )

  return `<!doctype html>${document}`
}

/** @jsxImportSource preact */
import { render } from 'preact-render-to-string'
import Enveloppe, { SCRIPT_ENVELOPPE, scriptMemoire } from './enveloppe'
import Rsvp, { Merci } from './rsvp'
import { STYLES } from './styles'
import {
  formaterDateLongue,
  formaterPlage,
  joursRestants,
  libelleCompteARebours,
} from '@/lib/dates'
import { lienGoogleMaps, lienWaze } from '@/lib/itineraire'
import type { CeremonieVue, EvenementVue } from '@/serveur/bdd/evenements'

export interface ContexteInvitation {
  evenement: EvenementVue
  couleur: string
  origine: string
  /** Proportions de la carte, pour réserver sa place avant qu'elle ne charge. */
  proportions: { largeur: number; hauteur: number }
  reponseEnvoyee: boolean
  champsFautifs: string[]
  choixPrecedent?: 'oui' | 'non'
}

function initialesDe(titre: string): string {
  return titre
    .split(/\s*&\s*|\s+et\s+/i)
    .map((part) => part.trim()[0] ?? '')
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function BlocCeremonie({
  ceremonie,
  slug,
  tenueGenerale,
}: {
  ceremonie: CeremonieVue
  slug: string
  tenueGenerale: string | null
}) {
  // Ne pas répéter la tenue générale sur chaque cérémonie : seule une tenue
  // qui s'en écarte mérite d'être signalée ici.
  const tenuePropre =
    ceremonie.codeVestimentaire && ceremonie.codeVestimentaire !== tenueGenerale
      ? ceremonie.codeVestimentaire
      : undefined

  return (
    <li className="ceremonie">
      <p className="quand">
        <b>{formaterDateLongue(ceremonie.debuteLe)}</b>
        <span>{formaterPlage(ceremonie.debuteLe, ceremonie.termineLe)}</span>
      </p>
      <h3 className="nom-ceremonie">{ceremonie.nom}</h3>
      <p className="lieu">{ceremonie.lieu}</p>
      {ceremonie.adresse && <p className="adresse">{ceremonie.adresse}</p>}

      {ceremonie.repere && (
        <p className="repere">
          <span className="repere-etiquette">Pour trouver</span>
          {ceremonie.repere}
        </p>
      )}

      {ceremonie.note && <p className="note">{ceremonie.note}</p>}
      {tenuePropre && <p className="note">Tenue : {tenuePropre}</p>}

      <div className="actions">
        <a className="action" href={lienGoogleMaps(ceremonie)} target="_blank" rel="noreferrer">
          Itinéraire
        </a>
        <a className="action" href={lienWaze(ceremonie)} target="_blank" rel="noreferrer">
          Waze
        </a>
        <a className="action" href={`/e/${slug}/agenda/${ceremonie.id}`}>
          Ajouter à mon agenda
        </a>
      </div>
    </li>
  )
}

function Corps({
  evenement,
  couleur,
  proportions,
  reponseEnvoyee,
  champsFautifs,
  choixPrecedent,
}: ContexteInvitation) {
  const slug = evenement.slug
  const premiere = evenement.ceremonies[0]
  const compteur = premiere ? libelleCompteARebours(joursRestants(premiere.debuteLe)) : ''
  const partage = `Une invitation pour vous — ${evenement.titre}`

  return (
    <>
      <Enveloppe
        slug={slug}
        titre={evenement.titre}
        initiales={initialesDe(evenement.titre)}
        couleur={couleur}
      />

      <main>
        <header className="hero">
          <img
            className="carte"
            src={`/e/${slug}/carte.png?l=900`}
            width={proportions.largeur}
            height={proportions.hauteur}
            alt={`Invitation de ${evenement.titre}`}
            fetchPriority="high"
          />

          {compteur && (
            <p className="compteur">
              <span className="compteur-valeur">{compteur}</span>
              {premiere && (
                <span className="compteur-legende">{formaterDateLongue(premiere.debuteLe)}</span>
              )}
            </p>
          )}
        </header>

        {evenement.ceremonies.length > 0 && (
          <section className="section">
            <h2 className="titre-section">Le programme</h2>
            <ol className="programme">
              {evenement.ceremonies.map((ceremonie) => (
                <BlocCeremonie
                  key={ceremonie.id}
                  ceremonie={ceremonie}
                  slug={slug}
                  tenueGenerale={evenement.codeVestimentaire}
                />
              ))}
            </ol>
          </section>
        )}

        {evenement.codeVestimentaire && (
          <section className="section">
            <h2 className="titre-section">La tenue</h2>
            <span className="pastille-tenue">{evenement.codeVestimentaire}</span>
          </section>
        )}

        {evenement.motDesHotes && (
          <section className="section">
            <h2 className="titre-section">Le mot des hôtes</h2>
            <p className="mot">{evenement.motDesHotes}</p>
          </section>
        )}

        <section className="section" id="repondre">
          <h2 className="titre-section">Serez-vous des nôtres ?</h2>
          {reponseEnvoyee ? (
            <Merci />
          ) : (
            <Rsvp
              slug={slug}
              champsFautifs={champsFautifs}
              choixPrecedent={choixPrecedent}
              ceremonies={evenement.ceremonies.map((c) => ({
                id: c.id,
                nom: c.nom,
                quand: `${formaterDateLongue(c.debuteLe)} · ${formaterPlage(c.debuteLe, c.termineLe)}`,
              }))}
            />
          )}
        </section>

        {evenement.telephoneHote && (
          <section className="section">
            <h2 className="titre-section">Une question ?</h2>
            <p className="contact">Écrivez directement aux hôtes sur WhatsApp.</p>
            <a
              className="action"
              style={{ alignSelf: 'flex-start' }}
              href={`https://wa.me/${evenement.telephoneHote.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir WhatsApp
            </a>
          </section>
        )}

        <footer className="pied">
          <a
            className="partage"
            href={`https://wa.me/?text=${encodeURIComponent(partage)}`}
            target="_blank"
            rel="noreferrer"
          >
            Partager sur WhatsApp
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
    <html lang="fr" style={{ ['--evenement' as string]: couleur }}>
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

        <link
          rel="preload"
          href="/polices/bricolage-grotesque.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <script dangerouslySetInnerHTML={{ __html: scriptMemoire(evenement.slug) }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: '#enveloppe{display:none!important}' }} />
        </noscript>
      </head>
      <body>
        <Corps {...contexte} />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ENVELOPPE }} />
      </body>
    </html>,
  )

  return `<!doctype html>${document}`
}

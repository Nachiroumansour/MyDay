import { BarreIdentite } from '@/composants/barre-identite'
import { Vignette } from '@/composants/vignette'
import { libelleEvenement, TYPES_EVENEMENT, type TypeEvenement } from '@/lib/evenements'
import { lireIdentite, versParametres } from '@/lib/identite'
import { catalogue, createurs, vitrine } from '@/serveur/bdd/catalogue'
import styles from './page.module.css'

/** Le catalogue bouge rarement ; la page se garde en cache une heure. */
export const revalidate = 3600

const CELEBRATIONS: Record<
  TypeEvenement,
  { badge: string; nom: string; texte: string; photo: string }
> = {
  mariage: {
    badge: 'Takk & réception',
    nom: 'Mariages',
    texte:
      'Des faire-part à la hauteur de votre union, du ngénte à la réception, avec le programme complet de vos cérémonies.',
    photo: '/photos/photo-10.jpg',
  },
  bapteme: {
    badge: 'Ngénte',
    nom: 'Baptêmes',
    texte:
      'Annoncez l’arrivée et le nom de votre enfant. Teintes douces, sable doré et terre cuite chaleureuse.',
    photo: '/photos/photo-06.jpg',
  },
  anniversaire: {
    badge: 'Réception & soirée',
    nom: 'Anniversaires',
    texte:
      'Des invitations franches et joyeuses pour marquer les grandes dates de votre vie.',
    photo: '/photos/photo-12.jpg',
  },
}

const ETAPES = [
  {
    nom: 'Choisissez',
    texte: 'Écrivez vos prénoms : tous les modèles s’affichent aussitôt avec.',
    note: 'Plus de 50 modèles',
    teinte: '#9F3C16',
  },
  {
    nom: 'Personnalisez',
    texte: 'Le programme de vos cérémonies, les lieux, les repères, la tenue.',
    note: 'Aperçu en direct',
    teinte: '#735C00',
  },
  {
    nom: 'Partagez',
    texte: 'Un lien pour vos groupes WhatsApp, et vos fichiers en haute définition.',
    note: 'Diffusion illimitée',
    teinte: '#973F50',
  },
]

export default async function Accueil({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const identite = lireIdentite(await searchParams)
  const parametres = versParametres(identite)
  const [modeles, equipe, tout] = await Promise.all([vitrine(), createurs(), catalogue()])

  const compteParType = new Map<TypeEvenement, number>()
  for (const gabarit of tout) {
    compteParType.set(gabarit.typeEvenement, (compteParType.get(gabarit.typeEvenement) ?? 0) + 1)
  }

  const vedette = modeles.find((m) => m.typeEvenement === 'mariage') ?? modeles[0]
  const noms = [identite.nom1, identite.nom2].filter(Boolean).join(' & ') || 'Amina & Lamine'

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`contenu ${styles.heroGrille}`}>
          <div className={styles.heroTexte}>
            <span className={styles.badge}>Invitations d’exception · Sénégal &amp; diaspora</span>

            <h1 className={styles.titre}>Vos cérémonies, prêtes à être partagées ce soir.</h1>

            <p className={styles.chapeau}>
              Créez un faire-part numérique pour votre mariage, votre baptême ou votre
              anniversaire. Partagez le lien sur WhatsApp, et suivez les réponses de vos
              invités.
            </p>

            <BarreIdentite identite={identite} action="/modeles" />

            <div className={styles.actionsHero}>
              <a className="bouton" href={`/modeles${parametres ? `?${parametres}` : ''}`}>
                Explorer le catalogue
              </a>
              <a className="bouton-contour" href="/guide">
                Trouver mon style
              </a>
            </div>
          </div>

          {vedette && (
            <div className={styles.apercuHero}>
              <div
                className={styles.apercuPhoto}
                style={{ backgroundImage: 'url(/photos/photo-21.jpg)' }}
              >
                <span className={styles.apercuVoile} />
                <span className={styles.apercuEtiquette}>Takk &amp; réception</span>
                <span className={styles.apercuCarte}>
                  <Vignette gabarit={vedette} identite={identite} largeur={480} priorite />
                </span>
                <span className={styles.apercuLegende}>
                  <span className={styles.apercuSurTitre}>Invitation officielle</span>
                  <span className={styles.apercuNoms}>{noms}</span>
                </span>
              </div>
              <p className={styles.apercuPied}>
                <span>16h00 · Grand Théâtre, Dakar</span>
                <span className={styles.apercuPret}>Prêt pour WhatsApp</span>
              </p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.sectionTeintee}>
        <div className="contenu">
          <div className={styles.enTeteSection}>
            <div>
              <p className="sur-titre">Célébrations d’exception</p>
              <h2 className={styles.titreSection}>Trois grands types de fêtes, sublimées</h2>
            </div>
            <p className={styles.introSection}>
              Chaque cérémonie a son code, son rythme et son émotion. Nos collections
              respectent les traditions sénégalaises tout en offrant un dessin moderne.
            </p>
          </div>

          <ul className={styles.celebrations}>
            {TYPES_EVENEMENT.map((type) => {
              const fete = CELEBRATIONS[type]
              const compte = compteParType.get(type) ?? 0
              return (
                <li key={type}>
                  <a
                    className={styles.celebration}
                    href={`/modeles?type=${type}${parametres ? `&${parametres}` : ''}`}
                  >
                    <span
                      className={styles.celebrationPhoto}
                      style={{ backgroundImage: `url(${fete.photo})` }}
                    >
                      <span className={styles.celebrationBadge}>{fete.badge}</span>
                    </span>
                    <span className={styles.celebrationCorps}>
                      <span className={styles.celebrationNom}>{fete.nom}</span>
                      <span className={styles.celebrationTexte}>{fete.texte}</span>
                      <span className={styles.celebrationLien}>
                        Voir les {compte} modèles →
                      </span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`contenu ${styles.savoir}`}>
          <div className={styles.savoirTexte}>
            <span className={styles.badge}>Savoir-faire local</span>
            <h2 className={styles.titreSection}>La collection des créateurs dakarois</h2>
            <p className={styles.introSection}>
              Chaque modèle est dessiné à Dakar, en collaboration avec des graphistes d’ici.
              Motifs inspirés du bazin, dorures discrètes et calligraphies soignées. Nos
              créateurs sont rémunérés sur chaque carte vendue.
            </p>

            <div className={styles.chiffres}>
              <p className={styles.chiffre}>
                <span className={styles.chiffreValeur}>{tout.length}</span>
                <span className={styles.chiffreLibelle}>modèles au catalogue</span>
              </p>
              <p className={styles.chiffre}>
                <span className={styles.chiffreValeur}>{equipe.length}</span>
                <span className={styles.chiffreLibelle}>
                  créateur{equipe.length > 1 ? 's' : ''} à Dakar
                </span>
              </p>
            </div>
          </div>

          <div className={styles.grillePhotos}>
            <span className={styles.photo} style={{ backgroundImage: 'url(/photos/photo-17.jpg)' }} />
            <span className={styles.photo} style={{ backgroundImage: 'url(/photos/photo-04.jpg)' }} />
            <span className={styles.photo} style={{ backgroundImage: 'url(/photos/photo-19.jpg)' }} />
            <span className={styles.photo} style={{ backgroundImage: 'url(/photos/photo-05.jpg)' }} />
          </div>
        </div>
      </section>

      <section className={styles.sectionTeintee}>
        <div className="contenu">
          <div className={styles.etapesEnTete}>
            <p className="sur-titre">Simplicité &amp; rapidité</p>
            <h2 className={styles.titreSection}>Votre faire-part en trois étapes</h2>
            <p className={styles.introSection}>
              Pensé pour les habitudes de communication au Sénégal et dans la diaspora.
            </p>
          </div>

          <ol className={styles.etapes}>
            {ETAPES.map((etape, rang) => (
              <li
                key={etape.nom}
                className={styles.etape}
                style={{ ['--teinte-etape' as string]: etape.teinte }}
              >
                <span className={styles.etapeNumero}>{rang + 1}</span>
                <span className={styles.etapeNom}>{etape.nom}</span>
                <span className={styles.etapeTexte}>{etape.texte}</span>
                <span className={styles.etapeNote}>{etape.note}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.appel}>
        <p className={styles.appelSurTitre}>Commencez dès maintenant</p>
        <h2 className={styles.appelTitre}>Prêt à éblouir vos invités&nbsp;?</h2>
        <p className={styles.appelTexte}>
          Créez et regardez gratuitement. Vous ne payez qu’au moment de publier votre
          invitation.
        </p>
        <div className={styles.appelActions}>
          <a className={styles.appelPrincipal} href={`/modeles${parametres ? `?${parametres}` : ''}`}>
            Créer mon invitation
          </a>
          <a className={styles.appelSecondaire} href="/guide">
            Trouver mon style
          </a>
        </div>
      </section>
    </main>
  )
}

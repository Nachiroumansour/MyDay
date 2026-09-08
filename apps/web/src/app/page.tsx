import { Ambiance } from '@/composants/ambiance'
import { BarreIdentite } from '@/composants/barre-identite'
import { IconeCarte, IconeEnvoi, IconePlume } from '@/composants/icones'
import { Vignette } from '@/composants/vignette'
import { libelleEvenement, TYPES_EVENEMENT, type TypeEvenement } from '@/lib/evenements'
import { festivite } from '@/lib/festivite'
import { lireIdentite, versParametres } from '@/lib/identite'
import { catalogue, createurs, vitrine } from '@/serveur/bdd/catalogue'
import styles from './page.module.css'

/** Le catalogue bouge rarement ; la page se garde en cache une heure. */
export const revalidate = 3600

const ENVIES = [
  { titre: 'Mariage moderne', detail: 'Lignes nettes, peu d’ornement', type: 'mariage' as const, emoji: '💍', tag: 'moderne' },
  { titre: 'Traditionnel revisité', detail: 'Les codes d’ici, en plus sobre', type: 'mariage' as const, emoji: '✨', tag: 'traditionnel' },
  { titre: 'Baptême tout en douceur', detail: 'Teintes claires, motifs légers', type: 'bapteme' as const, emoji: '🕊️', tag: 'clair' },
  { titre: 'Anniversaire festif', detail: 'Couleurs franches, esprit fête', type: 'anniversaire' as const, emoji: '🎈', tag: 'festif' },
]

const INCLINAISONS = ['-2.4deg', '1.6deg', '3deg']

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .map((mot) => mot[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

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

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        {/* Des pétales dérivent derrière le titre, jamais devant. */}
        <Ambiance type="mariage" nombre={18} intensite={1.1} zone="bords" />

        <div className={styles.heroInterieur}>
          <h1 className={styles.titre}>Votre invitation, prête ce soir.</h1>
          <p className={styles.chapeau}>
            Écrivez vos prénoms : tous les modèles s’affichent aussitôt avec. Partagez le lien
            sur WhatsApp, vos invités répondent en dix secondes.
          </p>
          <BarreIdentite identite={identite} action="/modeles" />
        </div>
      </section>

      <ul className={styles.fetes}>
        {TYPES_EVENEMENT.map((type, rang) => {
          const fete = festivite(type)
          const modele = modeles.find((m) => m.typeEvenement === type)
          const compte = compteParType.get(type) ?? 0

          return (
            <li key={type}>
              <a
                className={styles.fete}
                href={`/modeles?type=${type}${parametres ? `&${parametres}` : ''}`}
                style={{
                  ['--fond-fete' as string]: fete.couleurProfonde,
                  ['--inclinaison' as string]: INCLINAISONS[rang],
                }}
              >
                {/* Chaque fête a sa propre pluie, sur son propre fond. */}
                <Ambiance type={type} nombre={14} intensite={2.2} teinte="#ffffff" />

                <span className={styles.feteInterieur}>
                  <span className={styles.feteEmoji}>{fete.emoji}</span>
                  <span className={styles.feteNom}>{libelleEvenement(type)}</span>
                  {modele && (
                    <span className={styles.feteCarte}>
                      <Vignette
                        gabarit={modele}
                        identite={identite}
                        largeur={480}
                        priorite={rang === 0}
                      />
                    </span>
                  )}
                  <span className={styles.feteCompte}>
                    {compte} modèle{compte > 1 ? 's' : ''}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>

      <section className={styles.section}>
        <h2 className={styles.sectionTitre}>Par envie</h2>
        <ul className={styles.envies}>
          {ENVIES.map((envie) => {
            const fete = festivite(envie.type)
            return (
              <li key={envie.titre}>
                <a
                  className={styles.envie}
                  href={`/modeles?type=${envie.type}&t=${envie.tag}${parametres ? `&${parametres}` : ''}`}
                  style={{
                    ['--teinte' as string]: fete.couleurClaire,
                    ['--accent' as string]: fete.couleur,
                  }}
                >
                  <span className={styles.envieEmoji}>{envie.emoji}</span>
                  <span className={styles.envieNom}>{envie.titre}</span>
                  <span className={styles.envieDetail}>{envie.detail}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitre}>Comment ça marche</h2>
        <ul className={styles.etapes}>
          <li className={styles.etape} style={{ ['--evenement' as string]: '#2C3A80' }}>
            <span className={styles.etapeIcone}>
              <IconeCarte />
            </span>
            <span className={styles.etapeNom}>Choisissez</span>
            <span className={styles.etapeTexte}>
              Écrivez vos prénoms : tous les modèles s’affichent aussitôt avec.
            </span>
          </li>
          <li className={styles.etape} style={{ ['--evenement' as string]: '#1F6B4A' }}>
            <span className={styles.etapeIcone}>
              <IconePlume />
            </span>
            <span className={styles.etapeNom}>Personnalisez</span>
            <span className={styles.etapeTexte}>
              Le programme, les lieux, la tenue. Quelques minutes suffisent.
            </span>
          </li>
          <li className={styles.etape} style={{ ['--evenement' as string]: '#C9700F' }}>
            <span className={styles.etapeIcone}>
              <IconeEnvoi />
            </span>
            <span className={styles.etapeNom}>Partagez</span>
            <span className={styles.etapeTexte}>
              Un lien pour vos groupes WhatsApp, et vos fichiers en haute définition.
            </span>
          </li>
        </ul>
      </section>

      {equipe.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitre}>Nos créateurs</h2>
          <p className={styles.sectionTexte}>
            Chaque modèle est dessiné à Dakar. Nos créateurs sont rémunérés sur chaque carte
            vendue.
          </p>
          <ul className={styles.createurs}>
            {equipe.map((createur, rang) => (
              <li
                key={createur.id}
                className={styles.createur}
                style={{
                  ['--evenement' as string]: festivite(TYPES_EVENEMENT[rang % 3]!).couleur,
                }}
              >
                <span className={styles.createurPastille}>{initiales(createur.nom)}</span>
                <span>
                  <span className={styles.createurNom}>{createur.nom}</span>
                  {createur.bio && <p className={styles.createurBio}>{createur.bio}</p>}
                  <span className={styles.createurCompte}>
                    {createur.nbModeles} modèle{createur.nbModeles > 1 ? 's' : ''} au catalogue
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

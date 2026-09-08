import { BarreIdentite } from '@/composants/barre-identite'
import { Vignette } from '@/composants/vignette'
import { couleurEvenement, libelleEvenement } from '@/lib/evenements'
import { lireIdentite, versParametres } from '@/lib/identite'
import { createurs, vitrine } from '@/serveur/bdd/catalogue'
import styles from './page.module.css'

/** Le catalogue bouge rarement ; la page se garde en cache une heure. */
export const revalidate = 3600

const COLLECTIONS = [
  { titre: 'Mariage moderne', detail: 'Lignes nettes, peu d’ornement', lien: '/modeles?type=mariage&t=moderne' },
  { titre: 'Traditionnel revisité', detail: 'Les codes d’ici, en plus sobre', lien: '/modeles?type=mariage&t=traditionnel' },
  { titre: 'Baptême tout en douceur', detail: 'Teintes claires, motifs légers', lien: '/modeles?type=bapteme&t=clair' },
  { titre: 'Anniversaire festif', detail: 'Couleurs franches, esprit fête', lien: '/modeles?type=anniversaire&t=festif' },
]

const ETAPES = [
  { titre: 'Choisissez', detail: 'Écrivez vos prénoms : tous les modèles s’affichent aussitôt avec.' },
  { titre: 'Personnalisez', detail: 'Le programme, les lieux, la tenue. Tout se remplit en quelques minutes.' },
  { titre: 'Partagez', detail: 'Un lien à envoyer dans vos groupes WhatsApp, et vos fichiers en haute définition.' },
]

export default async function Accueil({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const identite = lireIdentite(await searchParams)
  const [modeles, equipe] = await Promise.all([vitrine(), createurs()])
  const parametres = versParametres(identite)

  return (
    <main className="contenu">
      <section className={styles.hero}>
        <h1 className={styles.titre}>
          Votre invitation,
          <br />
          prête ce soir.
        </h1>
        <p className={styles['sous-titre']}>
          Choisissez un modèle, écrivez vos noms, partagez le lien sur WhatsApp. Vos invités
          répondent en dix secondes.
        </p>

        <ul className={styles.cartes}>
          {modeles.map((gabarit, rang) => (
            <li key={gabarit.id}>
              <a
                className={styles.carte}
                href={`/modeles?type=${gabarit.typeEvenement}${parametres ? `&${parametres}` : ''}`}
                style={{ ['--evenement' as string]: couleurEvenement(gabarit.typeEvenement) }}
              >
                <Vignette gabarit={gabarit} identite={identite} largeur={480} priorite={rang === 0} />
                <span className={styles['nom-type']}>{libelleEvenement(gabarit.typeEvenement)}</span>
              </a>
            </li>
          ))}
        </ul>

        <BarreIdentite identite={identite} action="/modeles" />
      </section>

      <section className={styles.section}>
        <h2 className={styles['titre-section']}>Par envie</h2>
        <ul className={styles.collections}>
          {COLLECTIONS.map((collection) => (
            <li key={collection.titre}>
              <a
                className={styles.collection}
                href={`${collection.lien}${parametres ? `&${parametres}` : ''}`}
              >
                <strong>{collection.titre}</strong>
                <span>{collection.detail}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles['titre-section']}>Comment ça marche</h2>
        <ul className={styles.etapes}>
          {ETAPES.map((etape) => (
            <li key={etape.titre} className={styles.etape}>
              <strong>{etape.titre}</strong>
              <p>{etape.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {equipe.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles['titre-section']}>Nos créateurs</h2>
          <p className={styles.introduction}>
            Chaque modèle est dessiné à Dakar. Nos créateurs sont rémunérés sur chaque carte
            vendue.
          </p>
          <ul className={styles.createurs}>
            {equipe.map((createur) => (
              <li key={createur.id} className={styles.createur}>
                <strong>{createur.nom}</strong>
                {createur.bio && <p>{createur.bio}</p>}
                <span>
                  {createur.nbModeles} modèle{createur.nbModeles > 1 ? 's' : ''} au catalogue
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

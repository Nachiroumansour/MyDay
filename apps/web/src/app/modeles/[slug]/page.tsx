import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Vignette } from '@/composants/vignette'
import { IconeCachet, IconeEnvoi, IconeLieu, IconeReponses } from '@/composants/icones'
import { libelleEvenement } from '@/lib/evenements'

/** Le libellé et la teinte du badge de chaque type de fête. */
const BADGES = {
  mariage: { libelle: 'Mariage (takk)', teinte: '#FFDBCF', encre: '#822801' },
  bapteme: { libelle: 'Baptême (ngénte)', teinte: '#FED65B', encre: '#574500' },
  anniversaire: { libelle: 'Réception & gala', teinte: '#FFD9DD', encre: '#7C2A3B' },
} as const
import { lireIdentite, versParametres } from '@/lib/identite'
import { libelleEtiquette, scoreGabarit } from '@/lib/guidage'
import { catalogue, gabaritParSlug } from '@/serveur/bdd/catalogue'
import { evenementVitrine } from '@/serveur/bdd/evenements'
import styles from './page.module.css'

export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params
  const gabarit = await gabaritParSlug(slug)
  if (!gabarit) return { title: 'Modèle introuvable' }
  return {
    title: `${gabarit.nom} — Modèle de ${libelleEvenement(gabarit.typeEvenement).toLowerCase()}`,
    description: `Personnalisez ce modèle à vos noms, partagez-le sur WhatsApp et suivez les réponses de vos invités.`,
  }
}

function formaterPrix(centimes: number): string {
  return `${centimes.toLocaleString('fr-FR')} F CFA`
}

export default async function FicheModele({ params, searchParams }: Props) {
  const { slug } = await params
  const identite = lireIdentite(await searchParams)
  const parametres = versParametres(identite)

  const gabarit = await gabaritParSlug(slug)
  if (!gabarit) notFound()

  const [memeType, exemple] = await Promise.all([
    catalogue({ type: gabarit.typeEvenement }),
    evenementVitrine(),
  ])

  // « Vous aimerez aussi » : les modèles du même type qui partagent le plus
  // d'étiquettes avec celui-ci.
  const similaires = memeType
    .filter((autre) => autre.id !== gabarit.id)
    .sort(
      (a, b) =>
        scoreGabarit(b.etiquettes, gabarit.etiquettes) -
        scoreGabarit(a.etiquettes, gabarit.etiquettes),
    )
    .slice(0, 3)

  const badge = BADGES[gabarit.typeEvenement]

  return (
    <main
      className="contenu"
      style={{
        ['--teinte-badge' as string]: badge.teinte,
        ['--sur-badge' as string]: badge.encre,
      }}
    >
      <p className={`${styles.bandeau} ${styles.filAriane}`}>
        <a href="/modeles">Catalogue</a> · {libelleEvenement(gabarit.typeEvenement)}
      </p>

      <div className={styles.fiche}>
        <div className={styles.apercu}>
          <Vignette gabarit={gabarit} identite={identite} largeur={900} priorite />
        </div>

        <div className={styles.infos}>
          <span className={styles.badge}>{badge.libelle}</span>
          <div>
            <h1 className={styles.nom}>{gabarit.nom}</h1>
            <p className={styles.auteur}>Dessiné par {gabarit.graphisteNom}, à Dakar</p>
          </div>

          {gabarit.etiquettes.length > 0 && (
            <ul className={styles.pastilles}>
              {gabarit.etiquettes.map((etiquette) => (
                <li key={etiquette} className="pilule">
                  {libelleEtiquette(etiquette)}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.prixBloc}>
            <span className={styles.prixLibelle}>À partir de</span>
            <span className={styles.prix}>{formaterPrix(gabarit.prix)}</span>
            <p className={styles.prixDetail}>
              Créez et regardez gratuitement. Vous ne payez qu’au moment de publier.
            </p>
          </div>

          <ul className={styles.inclus}>
            <li>
              <span className={styles.inclusIcone}>
                <IconeEnvoi />
              </span>
              Un lien d’invitation à partager sur WhatsApp
            </li>
            <li>
              <span className={styles.inclusIcone}>
                <IconeLieu />
              </span>
              Le programme de vos cérémonies, avec les repères pour trouver
            </li>
            <li>
              <span className={styles.inclusIcone}>
                <IconeReponses />
              </span>
              Les réponses de vos invités, cérémonie par cérémonie
            </li>
            <li>
              <span className={styles.inclusIcone}>
                <IconeCachet />
              </span>
              Votre carte en haute définition, et son PDF imprimable
            </li>
          </ul>

          <div className={styles.actions}>
            <a className="bouton" href={`/creer/${gabarit.slug}${parametres ? `?${parametres}` : ''}`}>
              Personnaliser ce modèle
            </a>
            {exemple && (
              <a className="bouton-contour" href={`/e/${exemple.slug}`}>
                Voir ce que reçoivent vos invités
              </a>
            )}
          </div>
        </div>
      </div>

      {similaires.length > 0 && (
        <section className={styles.similaires}>
          <h2 className={styles.titreSection}>Vous aimerez aussi</h2>
          <ul className={styles.grille}>
            {similaires.map((autre) => (
              <li key={autre.id}>
                <a
                  className={styles.modele}
                  href={`/modeles/${autre.slug}${parametres ? `?${parametres}` : ''}`}
                >
                  <Vignette gabarit={autre} identite={identite} largeur={480} />
                  <span className={styles.modeleNom}>{autre.nom}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

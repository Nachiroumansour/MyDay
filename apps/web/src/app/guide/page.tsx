import { Vignette } from '@/composants/vignette'
import {
  estTypeEvenement,
  libelleEvenement,
  TYPES_EVENEMENT,
  type TypeEvenement,
} from '@/lib/evenements'
import { etapesGuidage, nommerStyle, scoreGabarit, tagsDepuisChoix } from '@/lib/guidage'
import { lireIdentite, versParametres } from '@/lib/identite'
import { catalogue, vitrine } from '@/serveur/bdd/catalogue'
import styles from './page.module.css'

export const revalidate = 3600

type Requete = Record<string, string | string[] | undefined>

function premier(requete: Requete, cle: string): string | undefined {
  const valeur = requete[cle]
  return Array.isArray(valeur) ? valeur[0] : valeur
}

/** Reconduit tous les paramètres déjà répondus, plus le nouveau. */
function lienEtape(requete: Requete, ajout: Record<string, string>): string {
  const params = new URLSearchParams()
  for (const [cle, valeur] of Object.entries(requete)) {
    const seul = Array.isArray(valeur) ? valeur[0] : valeur
    if (seul) params.set(cle, seul)
  }
  for (const [cle, valeur] of Object.entries(ajout)) params.set(cle, valeur)
  return `/guide?${params.toString()}`
}

export default async function Guide({ searchParams }: { searchParams: Promise<Requete> }) {
  const requete = await searchParams
  const identite = lireIdentite(requete)
  const parametres = versParametres(identite)

  const typeBrut = premier(requete, 'type')
  const type = typeBrut && estTypeEvenement(typeBrut) ? typeBrut : undefined

  // Première question : de quelle fête s'agit-il ?
  if (!type) {
    const modeles = await vitrine()
    return (
      <main className="contenu">
        <div className={styles.guide}>
          <p className={styles.progression}>Étape 1 sur 4</p>
          <h1 className={styles.question}>Quelle fête préparez-vous ?</h1>
          <ul className={styles.types}>
            {TYPES_EVENEMENT.map((candidat) => {
              const apercu = modeles.find((m) => m.typeEvenement === candidat)
              return (
                <li key={candidat}>
                  <a
                    className={styles.type}
                    href={lienEtape(requete, { type: candidat })}
                  >
                    {apercu && <Vignette gabarit={apercu} identite={identite} largeur={300} />}
                    <span className={styles.typeNom}>{libelleEvenement(candidat)}</span>
                  </a>
                </li>
              )
            })}
          </ul>
          <p className={styles.echapper}>
            <a className="lien-sobre" href={`/modeles${parametres ? `?${parametres}` : ''}`}>
              Je préfère regarder tous les modèles
            </a>
          </p>
        </div>
      </main>
    )
  }

  const etapes = etapesGuidage(type)
  const choix: Record<string, string> = {}
  for (const etape of etapes) {
    const valeur = premier(requete, etape.id)
    if (valeur) choix[etape.id] = valeur
  }

  const prochaine = etapes.find((etape) => !choix[etape.id])
  const modeles = await catalogue({ type })

  // Une étape reste : on montre deux modèles qui incarnent chaque option.
  if (prochaine) {
    const rang = etapes.indexOf(prochaine) + 2
    const illustrer = (tags: string[]) =>
      [...modeles].sort(
        (a, b) => scoreGabarit(b.etiquettes, tags) - scoreGabarit(a.etiquettes, tags),
      )[0]

    return (
    <main className="contenu">
        <div className={styles.guide}>
          <p className={styles.progression}>Étape {rang} sur 4</p>
          <h1 className={styles.question}>{prochaine.question}</h1>
          <ul className={styles.options}>
            {prochaine.options.map((option) => {
              const apercu = illustrer(option.tags)
              return (
                <li key={option.id}>
                  <a
                    className={styles.option}
                    href={lienEtape(requete, { [prochaine.id]: option.id })}
                  >
                    {apercu && <Vignette gabarit={apercu} identite={identite} largeur={480} />}
                    <span className={styles.optionNom}>{option.intitule}</span>
                  </a>
                </li>
              )
            })}
          </ul>
          <p className={styles.echapper}>
            <a
              className="lien-sobre"
              href={`/modeles?type=${type}${parametres ? `&${parametres}` : ''}`}
            >
              Passer et voir tous les modèles
            </a>
          </p>
        </div>
      </main>
    )
  }

  // Le résultat : un style nommé, et les modèles qui lui correspondent.
  const tags = tagsDepuisChoix(type, choix)
  const classes = [...modeles]
    .map((gabarit) => ({ gabarit, score: scoreGabarit(gabarit.etiquettes, tags) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  const lienGalerie = `/modeles?type=${type}${tags.map((t) => `&t=${t}`).join('')}${
    parametres ? `&${parametres}` : ''
  }`

  return (
    <main className="contenu">
      <div className={styles.guide}>
        <div className={styles.resultat}>
          <p className={styles.progression}>Votre style</p>
          <h1 className={styles.styleNom}>{nommerStyle(tags)}</h1>
          <p className={styles.introduction}>
            Voici les modèles qui s’en rapprochent le plus. Rien n’est figé : vous pouvez
            regarder tout le catalogue quand vous voulez.
          </p>
        </div>

        <ul className={styles.grille}>
          {classes.map(({ gabarit }) => (
            <li key={gabarit.id}>
              <a
                className={styles.modele}
                href={`/modeles/${gabarit.slug}${parametres ? `?${parametres}` : ''}`}
              >
                <Vignette gabarit={gabarit} identite={identite} largeur={480} />
                <span className={styles.modeleNom}>{gabarit.nom}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.suite}>
          <a className="bouton-contour" href={lienGalerie}>
            Voir tous les modèles de ce style
          </a>
          <a className="bouton-contour" href={`/guide${parametres ? `?${parametres}` : ''}`}>
            Recommencer
          </a>
        </div>
      </div>
    </main>
  )
}

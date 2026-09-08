import type { TypeEvenement } from './evenements'

/**
 * Le guidage est visuel, jamais textuel : on montre deux images et on demande
 * laquelle attire. Personne ne sait nommer son style, tout le monde sait le
 * reconnaître. Trois étapes, six images, dix secondes.
 *
 * Il reste facultatif : la galerie s'affiche d'abord, et « Aidez-moi à
 * choisir » est accessible partout, y compris après cinq minutes d'hésitation.
 */
export interface OptionGuidage {
  id: string
  intitule: string
  tags: string[]
}

export interface EtapeGuidage {
  id: string
  question: string
  options: [OptionGuidage, OptionGuidage]
}

const COMMUNES: EtapeGuidage[] = [
  {
    id: 'esprit',
    question: 'Laquelle vous attire ?',
    options: [
      { id: 'epure', intitule: 'Épuré', tags: ['moderne', 'sobre'] },
      { id: 'orne', intitule: 'Orné', tags: ['traditionnel', 'ornemente'] },
    ],
  },
  {
    id: 'couleur',
    question: 'Et celle-ci ?',
    options: [
      { id: 'clair', intitule: 'Clair et doux', tags: ['clair', 'pastel'] },
      { id: 'profond', intitule: 'Profond et contrasté', tags: ['profond', 'contraste'] },
    ],
  },
]

const DERNIERE: Record<TypeEvenement, EtapeGuidage> = {
  mariage: {
    id: 'accent',
    question: 'Dernière : laquelle vous ressemble ?',
    options: [
      { id: 'dore', intitule: 'Une touche dorée', tags: ['dore'] },
      { id: 'floral', intitule: 'Un motif floral', tags: ['floral'] },
    ],
  },
  bapteme: {
    id: 'accent',
    question: 'Dernière : laquelle vous ressemble ?',
    options: [
      { id: 'naturel', intitule: 'Naturel et végétal', tags: ['naturel'] },
      { id: 'enfantin', intitule: 'Tendre et enfantin', tags: ['enfantin'] },
    ],
  },
  anniversaire: {
    id: 'accent',
    question: 'Dernière : laquelle vous ressemble ?',
    options: [
      { id: 'festif', intitule: 'Franchement festif', tags: ['festif'] },
      { id: 'chic', intitule: 'Plutôt chic', tags: ['chic'] },
    ],
  },
}

export function etapesGuidage(type: TypeEvenement): EtapeGuidage[] {
  return [...COMMUNES, DERNIERE[type]]
}

/** Rassemble les étiquettes des options choisies, sans doublon. */
export function tagsDepuisChoix(
  type: TypeEvenement,
  choix: Record<string, string>,
): string[] {
  const tags = new Set<string>()
  for (const etape of etapesGuidage(type)) {
    const option = etape.options.find((o) => o.id === choix[etape.id])
    for (const tag of option?.tags ?? []) tags.add(tag)
  }
  return [...tags]
}

/**
 * Simple intersection : combien des étiquettes recherchées le gabarit porte-t-il.
 * Un gabarit riche en étiquettes n'est pas pénalisé — on ne divise pas par son
 * nombre d'étiquettes, sinon les modèles les mieux décrits sortiraient perdants.
 */
export function scoreGabarit(tagsGabarit: string[], tagsVoulus: string[]): number {
  return tagsVoulus.filter((tag) => tagsGabarit.includes(tag)).length
}

/** Le catalogue est rangé par intention, pas par jargon technique. */
export function libelleEtiquette(tag: string): string {
  return ETIQUETTES[tag] ?? tag
}

const ETIQUETTES: Record<string, string> = {
  moderne: 'Moderne',
  sobre: 'Sobre',
  traditionnel: 'Traditionnel',
  ornemente: 'Ornementé',
  clair: 'Clair',
  pastel: 'Pastel',
  profond: 'Profond',
  contraste: 'Contrasté',
  dore: 'Doré',
  floral: 'Floral',
  naturel: 'Naturel',
  enfantin: 'Tendre',
  festif: 'Festif',
  chic: 'Chic',
}

const LISIBLES: Record<string, string> = {
  moderne: 'Moderne',
  sobre: 'Sobre',
  traditionnel: 'Traditionnel',
  ornemente: 'Ornementé',
  clair: 'Clair',
  pastel: 'Pastel',
  profond: 'Profond',
  contraste: 'Contrasté',
  dore: 'doré',
  floral: 'floral',
  naturel: 'naturel',
  enfantin: 'tendre',
  festif: 'festif',
  chic: 'chic',
}

/** « Moderne & doré » — un nom à retenir, pas une liste d'étiquettes. */
export function nommerStyle(tags: string[]): string {
  const mots = tags.map((tag) => LISIBLES[tag] ?? tag).filter(Boolean)
  if (mots.length === 0) return 'Votre style'
  if (mots.length === 1) return mots[0]!.charAt(0).toUpperCase() + mots[0]!.slice(1)

  const [premier, second] = mots
  return `${premier!.charAt(0).toUpperCase()}${premier!.slice(1)} & ${second!.toLowerCase()}`
}

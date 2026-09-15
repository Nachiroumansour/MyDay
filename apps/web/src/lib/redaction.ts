import type { ChampGabarit, ValeursChamps } from '@myday/moteur'
import type { TypeEvenement } from './evenements'

/**
 * Le guidage ne s'arrête pas à la galerie : c'est dans l'éditeur que les gens
 * galèrent vraiment, parce qu'ils ne savent pas quoi écrire. On propose donc
 * des formulations toutes prêtes, on signale ce qui manque, et on empêche un
 * texte de déborder du cadre.
 */
export interface Formule {
  texte: string
  langue: 'francais' | 'wolof'
}

const FORMULES: Record<TypeEvenement, Formule[]> = {
  mariage: [
    { texte: 'Ont l’honneur de vous convier à leur mariage', langue: 'francais' },
    { texte: 'Vous font l’amitié de vous inviter à célébrer leur union', langue: 'francais' },
    { texte: 'Avec leurs familles, vous invitent à partager leur bonheur', langue: 'francais' },
    { texte: 'Nu ngi leen di woo ci seen takk', langue: 'wolof' },
  ],
  bapteme: [
    { texte: 'Ont la joie de vous convier au baptême de leur enfant', langue: 'francais' },
    { texte: 'Vous invitent à célébrer l’arrivée de leur petite merveille', langue: 'francais' },
    { texte: 'Avec leurs familles, vous convient au ngénte', langue: 'francais' },
    { texte: 'Nu ngi leen di woo ci ngénte gi', langue: 'wolof' },
  ],
  anniversaire: [
    { texte: 'A le plaisir de vous convier à son anniversaire', langue: 'francais' },
    { texte: 'Vous invite à souffler ses bougies avec elle', langue: 'francais' },
    { texte: 'Compte sur vous pour fêter ce jour comme il se doit', langue: 'francais' },
    { texte: 'Nu ngi leen di woo ci ay bésu juddu', langue: 'wolof' },
  ],
}

export function formulesIntro(type: TypeEvenement): Formule[] {
  return FORMULES[type]
}

const LIBELLES: Record<string, Partial<Record<TypeEvenement, string>> & { defaut: string }> = {
  nom_1: {
    mariage: 'Prénom de la mariée',
    bapteme: 'Prénom de l’enfant',
    anniversaire: 'Prénom de la personne fêtée',
    defaut: 'Premier prénom',
  },
  nom_2: { mariage: 'Prénom du marié', defaut: 'Second prénom' },
  ceremonie: {
    mariage: 'Nom de la cérémonie (Takk, Tak Diacka…)',
    bapteme: 'Nom de la cérémonie (Ngénte…)',
    anniversaire: 'Nom de la fête (Bésu juddu…)',
    defaut: 'Nom de la cérémonie',
  },
  famille_1: {
    mariage: 'Nom de famille de la mariée',
    bapteme: 'Nom de famille de l’enfant',
    defaut: 'Nom de famille',
  },
  famille_2: { mariage: 'Nom de famille du marié', defaut: 'Second nom de famille' },
  parents: { defaut: 'Les parents' },
  age: { defaut: 'Âge fêté' },
  mot_final: { defaut: 'Petite phrase de fin' },
  date: { defaut: 'Date de l’événement' },
  lieu: { defaut: 'Lieu' },
  texte_intro: { defaut: 'Formule d’invitation' },
  zone_photo: { defaut: 'Votre photo' },
}

/** Les champs se nomment par ce qu'ils sont, jamais par leur identifiant. */
export function libelleChamp(id: string, type: TypeEvenement): string {
  const entree = LIBELLES[id]
  if (!entree) return id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ')
  return entree[type] ?? entree.defaut
}

export type EtatLongueur = 'bon' | 'proche' | 'trop-long'

/** Prévient avant que le moteur n'ait à réduire la taille du texte. */
export function longueurConseillee(texte: string, maximum?: number): EtatLongueur {
  if (!maximum) return 'bon'
  if (texte.length > maximum) return 'trop-long'
  if (texte.length >= maximum - 2) return 'proche'
  return 'bon'
}

/**
 * Ce qui reste à remplir. La photo n'est jamais exigée, ni les champs que le
 * gabarit déclare facultatifs — une devise ou un âge se laissent volontiers
 * de côté, et rien ne justifie de bloquer la publication pour eux.
 */
export function manquants(
  champs: Pick<ChampGabarit, 'id' | 'type' | 'facultatif'>[],
  valeurs: ValeursChamps,
): string[] {
  return champs
    .filter((champ) => champ.type !== 'image' && !champ.facultatif)
    .filter((champ) => (valeurs[champ.id] ?? '').trim() === '')
    .map((champ) => champ.id)
}

/**
 * Les champs, rangés pour être remplis plutôt que subis.
 *
 * Un modèle orné en compte huit. Présentés en une colonne, ils forment un mur
 * de cases vides qu'on parcourt sans savoir où l'on en est. Groupés par sujet,
 * et les paires évidentes mises côte à côte, ils tiennent en trois blocs
 * courts — et sur un téléphone, ça change tout.
 *
 * L'ordre du gabarit reste la référence : un champ qu'aucun groupe ne nomme
 * finit dans « Le reste », jamais oublié.
 */
export interface RangeeChamps<T> {
  champs: T[]
}

export interface GroupeChamps<T> {
  titre: string
  rangees: RangeeChamps<T>[]
}

const GROUPES: { titre: string; champs: string[] }[] = [
  { titre: 'La célébration', champs: ['ceremonie', 'texte_intro'] },
  { titre: 'Les noms', champs: ['nom_1', 'famille_1', 'nom_2', 'famille_2', 'parents', 'age'] },
  { titre: 'Quand et où', champs: ['date', 'lieu'] },
  { titre: 'La touche finale', champs: ['mot_final'] },
]

/** Les couples qui se lisent d'un seul tenant et méritent une seule ligne. */
const PAIRES: [string, string][] = [
  ['nom_1', 'famille_1'],
  ['nom_2', 'famille_2'],
]

export function grouperChamps<T extends { id: string; type: string }>(
  champs: T[],
): GroupeChamps<T>[] {
  const restants = new Map(champs.filter((c) => c.type !== 'image').map((c) => [c.id, c]))
  const groupes: GroupeChamps<T>[] = []

  const enRangees = (pris: T[]): RangeeChamps<T>[] => {
    const rangees: RangeeChamps<T>[] = []
    const vus = new Set<string>()
    for (const champ of pris) {
      if (vus.has(champ.id)) continue
      const paire = PAIRES.find(([a]) => a === champ.id)
      const second = paire && pris.find((c) => c.id === paire[1])
      if (second) {
        rangees.push({ champs: [champ, second] })
        vus.add(champ.id)
        vus.add(second.id)
      } else {
        rangees.push({ champs: [champ] })
        vus.add(champ.id)
      }
    }
    return rangees
  }

  for (const groupe of GROUPES) {
    const pris = groupe.champs.map((id) => restants.get(id)).filter((c): c is T => Boolean(c))
    if (pris.length === 0) continue
    for (const champ of pris) restants.delete(champ.id)
    groupes.push({ titre: groupe.titre, rangees: enRangees(pris) })
  }

  if (restants.size > 0) {
    groupes.push({ titre: 'Le reste', rangees: enRangees([...restants.values()]) })
  }

  return groupes
}

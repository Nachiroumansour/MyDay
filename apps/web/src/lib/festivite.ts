import type { TypeEvenement } from './evenements'

/**
 * Le vocabulaire festif de chaque célébration.
 *
 * La direction de design pose déjà qu'une couleur suit l'utilisateur du choix
 * de la fête jusqu'à sa page publiée. On étend le même principe à la joie :
 * chaque fête a ses symboles et sa façon de tomber à l'écran.
 *
 * Ce qui tombe est dessiné plutôt qu'emoji : un emoji change de forme et de
 * couleur d'un téléphone à l'autre, et ne peut pas prendre la couleur de
 * l'événement. Les emoji, eux, servent là où on les regarde vraiment — les
 * tuiles de fête, les titres de section, les confirmations.
 */
export type FormeAmbiance = 'petale' | 'bulle' | 'confetti'

export interface Festivite {
  type: TypeEvenement
  /** L'emoji qui représente la fête, en grand. */
  emoji: string
  /** La palette, pour les titres de section et les messages. */
  emojis: string[]
  forme: FormeAmbiance
  couleur: string
  /** Pour les aplats profonds sur lesquels on écrit en blanc. */
  couleurProfonde: string
  /** Pour les fonds teintés, sur lesquels on écrit à l'encre. */
  couleurClaire: string
  /** Comment on nomme la fête dans une phrase. */
  invitation: string
}

export const TOUTES_FESTIVITES: Festivite[] = [
  {
    type: 'mariage',
    emoji: '💍',
    emojis: ['💍', '💐', '🤍', '✨'],
    forme: 'petale',
    couleur: '#2C3A80',
    couleurProfonde: '#1B2454',
    couleurClaire: '#EDF0FA',
    invitation: 'votre mariage',
  },
  {
    type: 'bapteme',
    emoji: '🕊️',
    emojis: ['🕊️', '⭐', '🌿', '🤍'],
    forme: 'bulle',
    couleur: '#1F6B4A',
    couleurProfonde: '#14452F',
    couleurClaire: '#E7F2EC',
    invitation: 'le baptême de votre enfant',
  },
  {
    type: 'anniversaire',
    emoji: '🎉',
    emojis: ['🎉', '🎂', '🎈', '🎊'],
    forme: 'confetti',
    couleur: '#C9700F',
    couleurProfonde: '#8F4E08',
    couleurClaire: '#FBF0E2',
    invitation: 'votre anniversaire',
  },
]

const PAR_TYPE = new Map(TOUTES_FESTIVITES.map((f) => [f.type, f]))

export function festivite(type: TypeEvenement): Festivite {
  return PAR_TYPE.get(type)!
}

export interface Grain {
  /** Position horizontale, en pourcentage de la largeur. */
  gauche: number
  /** Départ décalé, en secondes. */
  delai: number
  /** Durée de la traversée, en secondes. */
  duree: number
  taille: number
  rotation: number
  opacite: number
}

/**
 * Un générateur pseudo-aléatoire déterministe.
 *
 * Les grains sont calculés côté serveur : sans déterminisme, le navigateur en
 * calculerait d'autres et React signalerait une divergence d'hydratation.
 */
function suite(graine: number): () => number {
  let etat = graine >>> 0
  return () => {
    etat = (etat * 1664525 + 1013904223) >>> 0
    return etat / 0xffffffff
  }
}

/** Répartit un grain, en le tenant éventuellement à l'écart du centre. */
function placer(zone: 'partout' | 'bords', rang: number, nombre: number, hasard: number): number {
  const regulier = (rang / nombre) * 100 + hasard * 8 - 4
  if (zone === 'partout') return Math.min(100, Math.max(0, regulier))

  // Deux bandes : 0-26 % et 74-100 %.
  const bande = rang % 2 === 0 ? regulier * 0.26 : 74 + (regulier / 100) * 26
  return Math.min(100, Math.max(0, bande))
}

const GRAINE: Record<FormeAmbiance, number> = {
  petale: 7,
  bulle: 23,
  confetti: 41,
}

/**
 * Les grains d'ambiance : peu nombreux, lents, discrets.
 * Vingt pétales qui dérivent sur douze secondes — pas deux cents qui pleuvent.
 */
export type ZoneAmbiance = 'partout' | 'bords'

export function grainsAmbiance(
  type: TypeEvenement,
  nombre: number,
  zone: ZoneAmbiance = 'partout',
): Grain[] {
  const tirer = suite(GRAINE[festivite(type).forme] * 1000 + nombre)

  return Array.from({ length: nombre }, (_, rang) => ({
    // Une répartition régulière, décalée au hasard : sans elle, les grains
    // s'agglutinent et laissent des colonnes vides. En mode « bords », ils
    // se tiennent hors de la colonne de texte.
    gauche: placer(zone, rang, nombre, tirer()),
    delai: Math.round(tirer() * 140) / 10,
    duree: Math.round((9 + tirer() * 11) * 10) / 10,
    taille: Math.round(10 + tirer() * 16),
    rotation: Math.round(tirer() * 360),
    opacite: Math.round((0.16 + tirer() * 0.28) * 100) / 100,
  }))
}

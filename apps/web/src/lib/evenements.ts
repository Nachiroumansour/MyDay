export type TypeEvenement = 'mariage' | 'bapteme' | 'anniversaire'

export const TYPES_EVENEMENT: readonly TypeEvenement[] = [
  'mariage',
  'bapteme',
  'anniversaire',
] as const

/**
 * Une couleur par célébration, qui suit l'utilisateur de l'accueil jusqu'à sa
 * page publiée (spec §9.3). Empruntées à la tradition textile ouest-africaine.
 */
const COULEURS: Record<TypeEvenement, string> = {
  mariage: '#2C3A80',
  bapteme: '#1F6B4A',
  anniversaire: '#C9700F',
}

const LIBELLES: Record<TypeEvenement, string> = {
  mariage: 'Mariage',
  bapteme: 'Baptême',
  anniversaire: 'Anniversaire',
}

export function couleurEvenement(type: TypeEvenement): string {
  return COULEURS[type]
}

export function libelleEvenement(type: TypeEvenement): string {
  return LIBELLES[type]
}

export function estTypeEvenement(valeur: string): valeur is TypeEvenement {
  return (TYPES_EVENEMENT as readonly string[]).includes(valeur)
}

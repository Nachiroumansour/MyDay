export type TypeChamp = 'texte' | 'texte_long' | 'date' | 'image'

export interface Cadre {
  x: number
  y: number
  largeur: number
  hauteur: number
}

export interface ChampGabarit {
  id: string
  type: TypeChamp
  cadre: Cadre
  maxLongueur?: number
  police?: string
  tailleNominale?: number
  /**
   * Un champ que l'on peut laisser vide. C'est l'auteur du gabarit qui le
   * décide, avec `data-facultatif="1"` : lui seul sait si sa composition
   * tient sans cette ligne.
   */
  facultatif?: boolean
}

export type ValeursChamps = Record<string, string>

export interface Recadrage {
  /** Facteur d'agrandissement, 1 = la photo couvre tout juste le cadre. */
  zoom: number
  /** Point focal horizontal dans la photo, de 0 (gauche) à 1 (droite). */
  focaleX: number
  /** Point focal vertical dans la photo, de 0 (haut) à 1 (bas). */
  focaleY: number
}

export const RECADRAGE_NEUTRE: Recadrage = { zoom: 1, focaleX: 0.5, focaleY: 0.5 }

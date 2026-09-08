import { formaterDateCourte } from './dates'
import type { ValeursChamps } from '@myday/moteur'

/**
 * L'identité que le visiteur saisit une fois, en haut de la galerie, et qui
 * personnalise tout le catalogue. C'est la signature du produit : on ne compare
 * plus des modèles abstraits mais des versions de son propre événement.
 *
 * Elle voyage dans l'URL, ce qui rend la galerie personnalisée partageable et
 * fonctionnelle sans JavaScript. Seuls des prénoms et une date y figurent —
 * jamais un numéro ni une adresse.
 */
export interface Identite {
  nom1?: string
  nom2?: string
  date?: string
}

const LONGUEUR_MAX = 32

/** Caractères de contrôle : ils n'ont rien à faire dans un SVG. */
const CONTROLE = /[\u0000-\u001f\u007f]/g

type Parametres = Record<string, string | string[] | undefined> | URLSearchParams

function premier(source: Parametres, cle: string): string | undefined {
  if (source instanceof URLSearchParams) return source.get(cle) ?? undefined
  const valeur = source[cle]
  return Array.isArray(valeur) ? valeur[0] : valeur
}

function prenom(brut: string | undefined): string | undefined {
  if (!brut) return undefined
  const propre = brut.replace(CONTROLE, '').trim()
  if (propre === '' || propre.length > LONGUEUR_MAX) return undefined
  return propre
}

function dateValide(brut: string | undefined): string | undefined {
  if (!brut || !/^\d{4}-\d{2}-\d{2}$/.test(brut)) return undefined
  const horodatage = Date.parse(`${brut}T00:00:00Z`)
  if (Number.isNaN(horodatage)) return undefined
  // Rejette le 31 février et consorts, que Date.parse ramène au mois suivant.
  return new Date(horodatage).toISOString().slice(0, 10) === brut ? brut : undefined
}

export function lireIdentite(source: Parametres): Identite {
  const identite: Identite = {}
  const nom1 = prenom(premier(source, 'n1'))
  const nom2 = prenom(premier(source, 'n2'))
  const date = dateValide(premier(source, 'd'))
  if (nom1) identite.nom1 = nom1
  if (nom2) identite.nom2 = nom2
  if (date) identite.date = date
  return identite
}

export function versParametres(identite: Identite): string {
  const params = new URLSearchParams()
  if (identite.nom1) params.set('n1', identite.nom1)
  if (identite.nom2) params.set('n2', identite.nom2)
  if (identite.date) params.set('d', identite.date)
  // URLSearchParams encode l'espace en « + » ; nos URL sont plus lisibles avec
  // %20, et les deux se décodent pareil.
  return params.toString().replace(/\+/g, '%20')
}

export function estRenseignee(identite: Identite): boolean {
  return Boolean(identite.nom1 || identite.nom2 || identite.date)
}

/** Traduit l'identité en valeurs de champs pour le moteur de rendu. */
export function valeursDepuisIdentite(identite: Identite): ValeursChamps {
  const valeurs: ValeursChamps = {}
  if (identite.nom1) valeurs.nom_1 = identite.nom1
  if (identite.nom2) valeurs.nom_2 = identite.nom2
  if (identite.date) {
    valeurs.date = formaterDateCourte(new Date(`${identite.date}T12:00:00Z`))
  }
  return valeurs
}

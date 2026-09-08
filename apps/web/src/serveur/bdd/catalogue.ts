import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { bdd } from './client'
import { gabarits, graphistes } from './schema'
import type { TypeEvenement } from '@/lib/evenements'

export interface GabaritVue {
  id: string
  slug: string
  nom: string
  typeEvenement: TypeEvenement
  etiquettes: string[]
  prix: number
  graphisteNom: string
  sourceSvg: string
}

const COLONNES = {
  id: gabarits.id,
  slug: gabarits.slug,
  nom: gabarits.nom,
  typeEvenement: gabarits.typeEvenement,
  etiquettes: gabarits.etiquettes,
  prix: gabarits.prix,
  graphisteNom: graphistes.nom,
  sourceSvg: gabarits.sourceSvg,
}

/** Le catalogue visible du public : seuls les gabarits actifs. */
export async function catalogue(filtre: {
  type?: TypeEvenement
  etiquettes?: string[]
} = {}): Promise<GabaritVue[]> {
  const lignes = await bdd
    .select(COLONNES)
    .from(gabarits)
    .innerJoin(graphistes, eq(graphistes.id, gabarits.graphisteId))
    .where(
      filtre.type
        ? and(eq(gabarits.statut, 'actif'), eq(gabarits.typeEvenement, filtre.type))
        : eq(gabarits.statut, 'actif'),
    )
    .orderBy(desc(gabarits.nbVentes), asc(gabarits.nom))

  if (!filtre.etiquettes?.length) return lignes

  const voulues = filtre.etiquettes
  return lignes.filter((ligne) => voulues.some((tag) => ligne.etiquettes.includes(tag)))
}

export async function gabaritParSlug(slug: string): Promise<GabaritVue | undefined> {
  const [ligne] = await bdd
    .select(COLONNES)
    .from(gabarits)
    .innerJoin(graphistes, eq(graphistes.id, gabarits.graphisteId))
    .where(and(eq(gabarits.slug, slug), eq(gabarits.statut, 'actif')))
    .limit(1)
  return ligne
}

/** Un modèle par type d'événement, pour les trois cartes de l'accueil. */
export async function vitrine(): Promise<GabaritVue[]> {
  const tous = await catalogue()
  const parType = new Map<TypeEvenement, GabaritVue>()
  for (const gabarit of tous) {
    if (!parType.has(gabarit.typeEvenement)) parType.set(gabarit.typeEvenement, gabarit)
  }
  return ['mariage', 'bapteme', 'anniversaire']
    .map((type) => parType.get(type as TypeEvenement))
    .filter((g): g is GabaritVue => Boolean(g))
}

export interface CreateurVue {
  id: string
  nom: string
  bio: string | null
  photoUrl: string | null
  nbModeles: number
}

/**
 * Les créateurs, avec leur nombre de modèles.
 * Ils sont des personnages du produit, pas une ligne de crédits : c'est ce qui
 * distingue une maison d'édition d'une banque de gabarits.
 */
export async function createurs(): Promise<CreateurVue[]> {
  const lignes = await bdd
    .select({
      id: graphistes.id,
      nom: graphistes.nom,
      bio: graphistes.bio,
      photoUrl: graphistes.photoUrl,
      gabaritStatut: gabarits.statut,
      gabaritId: gabarits.id,
    })
    .from(graphistes)
    .leftJoin(gabarits, eq(gabarits.graphisteId, graphistes.id))

  const parId = new Map<string, CreateurVue>()
  for (const ligne of lignes) {
    const vue = parId.get(ligne.id) ?? {
      id: ligne.id,
      nom: ligne.nom,
      bio: ligne.bio,
      photoUrl: ligne.photoUrl,
      nbModeles: 0,
    }
    if (ligne.gabaritId && ligne.gabaritStatut === 'actif') vue.nbModeles += 1
    parId.set(ligne.id, vue)
  }
  return [...parId.values()].filter((c) => c.nbModeles > 0)
}

/** Toutes les étiquettes présentes dans le catalogue, pour les filtres. */
export async function etiquettesDisponibles(type?: TypeEvenement): Promise<string[]> {
  const lignes = await catalogue(type ? { type } : {})
  const toutes = new Set<string>()
  for (const ligne of lignes) for (const tag of ligne.etiquettes) toutes.add(tag)
  return [...toutes].sort()
}

export async function gabaritsParIds(ids: string[]): Promise<GabaritVue[]> {
  if (ids.length === 0) return []
  return bdd
    .select(COLONNES)
    .from(gabarits)
    .innerJoin(graphistes, eq(graphistes.id, gabarits.graphisteId))
    .where(inArray(gabarits.id, ids))
}

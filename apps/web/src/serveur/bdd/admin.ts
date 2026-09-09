import { desc, eq } from 'drizzle-orm'
import type { ChampGabarit } from '@myday/moteur'
import { bdd } from './client'
import { evenements, gabarits, graphistes, paiements } from './schema'
import type { TypeEvenement } from '@/lib/evenements'

export async function listerGabarits() {
  return bdd
    .select({
      id: gabarits.id,
      slug: gabarits.slug,
      nom: gabarits.nom,
      typeEvenement: gabarits.typeEvenement,
      statut: gabarits.statut,
      prix: gabarits.prix,
      nbVentes: gabarits.nbVentes,
      etiquettes: gabarits.etiquettes,
      graphisteNom: graphistes.nom,
    })
    .from(gabarits)
    .innerJoin(graphistes, eq(graphistes.id, gabarits.graphisteId))
    .orderBy(desc(gabarits.creeLe))
}

export async function listerGraphistes() {
  return bdd
    .select({
      id: graphistes.id,
      nom: graphistes.nom,
      bio: graphistes.bio,
      contact: graphistes.contact,
      partRevenu: graphistes.partRevenu,
    })
    .from(graphistes)
    .orderBy(desc(graphistes.creeLe))
}

export async function creerGraphiste(entree: {
  nom: string
  bio: string | null
  contact: string
  partRevenu: string
}): Promise<void> {
  await bdd.insert(graphistes).values(entree)
}

/** Vrai si aucun gabarit ne porte déjà cet identifiant d'URL. */
export async function slugGabaritLibre(slug: string): Promise<boolean> {
  const [ligne] = await bdd
    .select({ id: gabarits.id })
    .from(gabarits)
    .where(eq(gabarits.slug, slug))
    .limit(1)
  return !ligne
}

export async function deposerGabarit(entree: {
  slug: string
  nom: string
  typeEvenement: TypeEvenement
  sourceSvg: string
  champs: ChampGabarit[]
  etiquettes: string[]
  prix: number
  graphisteId: string
}): Promise<void> {
  await bdd.insert(gabarits).values({ ...entree, statut: 'brouillon' })
}

export async function changerStatutGabarit(
  id: string,
  statut: 'brouillon' | 'actif' | 'archive',
): Promise<void> {
  await bdd.update(gabarits).set({ statut, modifieLe: new Date() }).where(eq(gabarits.id, id))
}

export async function listerCommandes() {
  return bdd
    .select({
      id: evenements.id,
      slug: evenements.slug,
      titre: evenements.titre,
      typeEvenement: evenements.typeEvenement,
      statut: evenements.statut,
      creeLe: evenements.creeLe,
      publieLe: evenements.publieLe,
      gabaritNom: gabarits.nom,
      montant: paiements.montant,
      statutPaiement: paiements.statut,
    })
    .from(evenements)
    .innerJoin(gabarits, eq(gabarits.id, evenements.gabaritId))
    .leftJoin(paiements, eq(paiements.evenementId, evenements.id))
    .orderBy(desc(evenements.creeLe))
    .limit(200)
}

/**
 * Un gabarit vu par l'administration : quel que soit son statut, contrairement
 * à `gabaritParSlug` qui ne rend que les modèles actifs. C'est justement un
 * modèle encore en brouillon que l'on vient inspecter.
 */
export async function gabaritAdminParSlug(slug: string) {
  const [ligne] = await bdd
    .select({
      id: gabarits.id,
      slug: gabarits.slug,
      nom: gabarits.nom,
      typeEvenement: gabarits.typeEvenement,
      statut: gabarits.statut,
      prix: gabarits.prix,
      etiquettes: gabarits.etiquettes,
      sourceSvg: gabarits.sourceSvg,
      graphisteNom: graphistes.nom,
      creeLe: gabarits.creeLe,
    })
    .from(gabarits)
    .innerJoin(graphistes, eq(graphistes.id, gabarits.graphisteId))
    .where(eq(gabarits.slug, slug))
    .limit(1)
  return ligne
}

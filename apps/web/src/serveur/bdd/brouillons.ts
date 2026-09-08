import { and, asc, eq, sql } from 'drizzle-orm'
import type { ChampGabarit, ValeursChamps } from '@myday/moteur'
import { analyserDocument, analyserGabarit } from '@myday/moteur'
import type { TypeEvenement } from '@/lib/evenements'
import { bdd } from './client'
import { ceremonies, evenements, gabarits, graphistes } from './schema'

export interface CeremonieBrouillon {
  id: string
  rang: number
  nom: string
  debuteLe: Date
  termineLe: Date | null
  lieu: string
  adresse: string | null
  repere: string | null
  codeVestimentaire: string | null
  note: string | null
}

export interface Brouillon {
  id: string
  slug: string
  secretBrouillon: string
  titre: string
  typeEvenement: TypeEvenement
  valeursChamps: ValeursChamps
  photoUrl: string | null
  recadrage: { zoom: number; focaleX: number; focaleY: number } | null
  codeVestimentaire: string | null
  motDesHotes: string | null
  telephoneHote: string | null
  livreOrOuvert: boolean
  galerieOuverte: boolean
  cagnotteOuverte: boolean
  cagnotteMot: string | null
  statut: 'brouillon' | 'publie' | 'archive'
  gabarit: {
    id: string
    slug: string
    nom: string
    sourceSvg: string
    prix: number
    graphisteNom: string
  }
  champs: ChampGabarit[]
  ceremonies: CeremonieBrouillon[]
}

/** Identifiant d'URL lisible, dérivé des prénoms. */
function slugDepuis(titre: string): string {
  const base = titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return base || 'invitation'
}

/**
 * Crée un brouillon. Aucun compte n'est demandé : le brouillon vit dans une
 * URL secrète, et le compte se crée tout seul au paiement.
 */
export async function creerBrouillon(
  gabaritSlug: string,
  valeursInitiales: ValeursChamps,
): Promise<Brouillon | undefined> {
  const [gabarit] = await bdd
    .select()
    .from(gabarits)
    .where(and(eq(gabarits.slug, gabaritSlug), eq(gabarits.statut, 'actif')))
    .limit(1)

  if (!gabarit) return undefined

  const titre = [valeursInitiales.nom_1, valeursInitiales.nom_2]
    .filter(Boolean)
    .join(' & ')
  const base = slugDepuis(titre || gabarit.nom)

  // Le slug public doit rester unique sans révéler de compteur devinable.
  const suffixe = crypto.randomUUID().slice(0, 6)

  const [cree] = await bdd
    .insert(evenements)
    .values({
      slug: `${base}-${suffixe}`,
      secretBrouillon: crypto.randomUUID(),
      titre: titre || 'Mon invitation',
      typeEvenement: gabarit.typeEvenement,
      gabaritId: gabarit.id,
      valeursChamps: valeursInitiales,
      statut: 'brouillon',
    })
    .returning()

  return cree ? brouillonParSecret(cree.secretBrouillon) : undefined
}

export async function brouillonParSecret(secret: string): Promise<Brouillon | undefined> {
  const [ligne] = await bdd
    .select({
      id: evenements.id,
      slug: evenements.slug,
      secretBrouillon: evenements.secretBrouillon,
      titre: evenements.titre,
      typeEvenement: evenements.typeEvenement,
      valeursChamps: evenements.valeursChamps,
      photoUrl: evenements.photoUrl,
      recadrage: evenements.recadrage,
      codeVestimentaire: evenements.codeVestimentaire,
      motDesHotes: evenements.motDesHotes,
      telephoneHote: evenements.telephoneHote,
      livreOrOuvert: evenements.livreOrOuvert,
      galerieOuverte: evenements.galerieOuverte,
      cagnotteOuverte: evenements.cagnotteOuverte,
      cagnotteMot: evenements.cagnotteMot,
      statut: evenements.statut,
      gabaritId: gabarits.id,
      gabaritSlug: gabarits.slug,
      gabaritNom: gabarits.nom,
      sourceSvg: gabarits.sourceSvg,
      prix: gabarits.prix,
      graphisteNom: graphistes.nom,
    })
    .from(evenements)
    .innerJoin(gabarits, eq(gabarits.id, evenements.gabaritId))
    .innerJoin(graphistes, eq(graphistes.id, gabarits.graphisteId))
    .where(eq(evenements.secretBrouillon, secret))
    .limit(1)

  if (!ligne) return undefined

  const programme = await bdd
    .select()
    .from(ceremonies)
    .where(eq(ceremonies.evenementId, ligne.id))
    .orderBy(asc(ceremonies.rang))

  return {
    id: ligne.id,
    slug: ligne.slug,
    secretBrouillon: ligne.secretBrouillon,
    titre: ligne.titre,
    typeEvenement: ligne.typeEvenement,
    valeursChamps: (ligne.valeursChamps ?? {}) as ValeursChamps,
    photoUrl: ligne.photoUrl,
    recadrage: ligne.recadrage as Brouillon['recadrage'],
    codeVestimentaire: ligne.codeVestimentaire,
    motDesHotes: ligne.motDesHotes,
    telephoneHote: ligne.telephoneHote,
    livreOrOuvert: ligne.livreOrOuvert,
    galerieOuverte: ligne.galerieOuverte,
    cagnotteOuverte: ligne.cagnotteOuverte,
    cagnotteMot: ligne.cagnotteMot,
    statut: ligne.statut,
    gabarit: {
      id: ligne.gabaritId,
      slug: ligne.gabaritSlug,
      nom: ligne.gabaritNom,
      sourceSvg: ligne.sourceSvg,
      prix: ligne.prix,
      graphisteNom: ligne.graphisteNom,
    },
    champs: analyserGabarit(analyserDocument(ligne.sourceSvg)),
    ceremonies: programme,
  }
}

export async function enregistrerCarte(
  secret: string,
  valeurs: ValeursChamps,
): Promise<void> {
  const titre = [valeurs.nom_1, valeurs.nom_2].filter(Boolean).join(' & ')
  await bdd
    .update(evenements)
    .set({
      valeursChamps: valeurs,
      ...(titre ? { titre } : {}),
      modifieLe: new Date(),
    })
    .where(eq(evenements.secretBrouillon, secret))
}

export async function enregistrerDetails(
  secret: string,
  details: {
    codeVestimentaire: string | null
    motDesHotes: string | null
    telephoneHote: string | null
  },
): Promise<void> {
  await bdd
    .update(evenements)
    .set({ ...details, modifieLe: new Date() })
    .where(eq(evenements.secretBrouillon, secret))
}

export async function enregistrerPhoto(
  secret: string,
  photoUrl: string | null,
  recadrage: { zoom: number; focaleX: number; focaleY: number } | null,
): Promise<void> {
  await bdd
    .update(evenements)
    .set({ photoUrl, recadrage, modifieLe: new Date() })
    .where(eq(evenements.secretBrouillon, secret))
}

export interface EntreeCeremonie {
  nom: string
  debuteLe: Date
  termineLe: Date | null
  lieu: string
  adresse: string | null
  repere: string | null
  codeVestimentaire: string | null
  note: string | null
}

export async function ajouterCeremonie(
  evenementId: string,
  entree: EntreeCeremonie,
): Promise<void> {
  const [{ prochain } = { prochain: 1 }] = await bdd
    .select({ prochain: sql<number>`coalesce(max(${ceremonies.rang}), 0) + 1` })
    .from(ceremonies)
    .where(eq(ceremonies.evenementId, evenementId))

  await bdd.insert(ceremonies).values({ evenementId, rang: Number(prochain), ...entree })
}

export async function modifierCeremonie(
  evenementId: string,
  ceremonieId: string,
  entree: EntreeCeremonie,
): Promise<void> {
  await bdd
    .update(ceremonies)
    .set(entree)
    .where(and(eq(ceremonies.id, ceremonieId), eq(ceremonies.evenementId, evenementId)))
}

export async function retirerCeremonie(
  evenementId: string,
  ceremonieId: string,
): Promise<void> {
  await bdd
    .delete(ceremonies)
    .where(and(eq(ceremonies.id, ceremonieId), eq(ceremonies.evenementId, evenementId)))
}

export async function publierBrouillon(secret: string): Promise<void> {
  await bdd
    .update(evenements)
    .set({ statut: 'publie', publieLe: new Date(), modifieLe: new Date() })
    .where(eq(evenements.secretBrouillon, secret))
}

import { and, desc, eq } from 'drizzle-orm'
import { bdd } from './client'
import { evenements, livraisons, paiements } from './schema'
import type { NomFournisseur } from '@/serveur/paiement/fournisseur'

export interface PaiementVue {
  id: string
  evenementId: string
  fournisseur: NomFournisseur
  reference: string
  montant: number
  statut: 'en_attente' | 'reussi' | 'echoue' | 'annule'
  urlPaiement: string | null
}

export async function ouvrirPaiement(entree: {
  evenementId: string
  fournisseur: NomFournisseur
  reference: string
  montant: number
  devise: string
  urlPaiement: string
  charge: unknown
}): Promise<void> {
  await bdd
    .insert(paiements)
    .values({ ...entree, charge: entree.charge as object })
    // Rejouer la même session ne doit pas créer un second paiement.
    .onConflictDoNothing({ target: paiements.reference })
}

export async function paiementParReference(reference: string): Promise<PaiementVue | undefined> {
  const [ligne] = await bdd
    .select({
      id: paiements.id,
      evenementId: paiements.evenementId,
      fournisseur: paiements.fournisseur,
      reference: paiements.reference,
      montant: paiements.montant,
      statut: paiements.statut,
      urlPaiement: paiements.urlPaiement,
    })
    .from(paiements)
    .where(eq(paiements.reference, reference))
    .limit(1)
  return ligne
}

/**
 * Marque un paiement confirmé.
 *
 * Renvoie faux si le paiement était déjà réussi : les fournisseurs rejouent
 * leurs webhooks, et une seconde confirmation ne doit ni republier ni relivrer.
 */
export async function confirmerPaiement(
  reference: string,
  statut: 'reussi' | 'echoue' | 'annule',
  charge: unknown,
): Promise<boolean> {
  const modifiees = await bdd
    .update(paiements)
    .set({
      statut,
      charge: charge as object,
      ...(statut === 'reussi' ? { confirmeLe: new Date() } : {}),
    })
    .where(and(eq(paiements.reference, reference), eq(paiements.statut, 'en_attente')))
    .returning({ id: paiements.id })

  return modifiees.length > 0
}

export async function paiementReussiPour(evenementId: string): Promise<boolean> {
  const [ligne] = await bdd
    .select({ id: paiements.id })
    .from(paiements)
    .where(and(eq(paiements.evenementId, evenementId), eq(paiements.statut, 'reussi')))
    .limit(1)
  return Boolean(ligne)
}

export async function dernierPaiement(evenementId: string): Promise<PaiementVue | undefined> {
  const [ligne] = await bdd
    .select({
      id: paiements.id,
      evenementId: paiements.evenementId,
      fournisseur: paiements.fournisseur,
      reference: paiements.reference,
      montant: paiements.montant,
      statut: paiements.statut,
      urlPaiement: paiements.urlPaiement,
    })
    .from(paiements)
    .where(eq(paiements.evenementId, evenementId))
    .orderBy(desc(paiements.creeLe))
    .limit(1)
  return ligne
}

export async function enregistrerFichiers(
  evenementId: string,
  fichiers: { png: string; pdf: string },
): Promise<void> {
  await bdd
    .update(evenements)
    .set({ fichierPng: fichiers.png, fichierPdf: fichiers.pdf, modifieLe: new Date() })
    .where(eq(evenements.id, evenementId))
}

export async function journaliserLivraison(entree: {
  evenementId: string
  canal: string
  destinataire: string
  statut: 'envoyee' | 'echouee'
  erreur?: string
}): Promise<void> {
  await bdd.insert(livraisons).values({
    ...entree,
    erreur: entree.erreur ?? null,
    ...(entree.statut === 'envoyee' ? { envoyeeLe: new Date() } : {}),
  })
}

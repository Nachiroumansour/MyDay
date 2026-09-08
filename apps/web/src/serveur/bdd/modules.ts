import { and, asc, desc, eq } from 'drizzle-orm'
import { bdd } from './client'
import { evenements, invites, messagesLivreOr, participations, photos } from './schema'

/* ------------------------------------------------------------------ *
 * Liste d'invités et liens nominatifs
 * ------------------------------------------------------------------ */

export interface InviteVue {
  id: string
  nomComplet: string
  telephone: string | null
  jeton: string
  aRepondu: boolean
}

export async function invitesPour(evenementId: string): Promise<InviteVue[]> {
  const lignes = await bdd
    .select({
      id: invites.id,
      nomComplet: invites.nomComplet,
      telephone: invites.telephone,
      jeton: invites.jeton,
    })
    .from(invites)
    .where(eq(invites.evenementId, evenementId))
    .orderBy(asc(invites.nomComplet))

  return lignes.map((ligne) => ({ ...ligne, aRepondu: false }))
}

export async function ajouterInvites(
  evenementId: string,
  nouveaux: { nomComplet: string; telephone?: string; jeton: string }[],
): Promise<void> {
  if (nouveaux.length === 0) return
  await bdd
    .insert(invites)
    .values(
      nouveaux.map((invite) => ({
        evenementId,
        nomComplet: invite.nomComplet,
        telephone: invite.telephone ?? null,
        jeton: invite.jeton,
      })),
    )
    .onConflictDoNothing()
}

export async function retirerInvite(evenementId: string, inviteId: string): Promise<void> {
  await bdd
    .delete(invites)
    .where(and(eq(invites.id, inviteId), eq(invites.evenementId, evenementId)))
}

export async function inviteParJeton(
  evenementId: string,
  jeton: string,
): Promise<InviteVue | undefined> {
  const [ligne] = await bdd
    .select({
      id: invites.id,
      nomComplet: invites.nomComplet,
      telephone: invites.telephone,
      jeton: invites.jeton,
    })
    .from(invites)
    .where(and(eq(invites.evenementId, evenementId), eq(invites.jeton, jeton)))
    .limit(1)
  return ligne ? { ...ligne, aRepondu: false } : undefined
}

/* ------------------------------------------------------------------ *
 * Livre d'or
 * ------------------------------------------------------------------ */

export interface MessageVue {
  id: string
  auteur: string
  message: string
  statut: 'en_attente' | 'publie' | 'masque'
  creeLe: Date
}

export async function livreOrPublie(evenementId: string): Promise<MessageVue[]> {
  return bdd
    .select({
      id: messagesLivreOr.id,
      auteur: messagesLivreOr.auteur,
      message: messagesLivreOr.message,
      statut: messagesLivreOr.statut,
      creeLe: messagesLivreOr.creeLe,
    })
    .from(messagesLivreOr)
    .where(and(eq(messagesLivreOr.evenementId, evenementId), eq(messagesLivreOr.statut, 'publie')))
    .orderBy(desc(messagesLivreOr.creeLe))
}

export async function livreOrComplet(evenementId: string): Promise<MessageVue[]> {
  return bdd
    .select({
      id: messagesLivreOr.id,
      auteur: messagesLivreOr.auteur,
      message: messagesLivreOr.message,
      statut: messagesLivreOr.statut,
      creeLe: messagesLivreOr.creeLe,
    })
    .from(messagesLivreOr)
    .where(eq(messagesLivreOr.evenementId, evenementId))
    .orderBy(desc(messagesLivreOr.creeLe))
}

export async function deposerMessage(
  evenementId: string,
  auteur: string,
  message: string,
): Promise<void> {
  await bdd.insert(messagesLivreOr).values({ evenementId, auteur, message })
}

export async function modererMessage(
  evenementId: string,
  messageId: string,
  statut: 'publie' | 'masque',
): Promise<void> {
  await bdd
    .update(messagesLivreOr)
    .set({ statut })
    .where(and(eq(messagesLivreOr.id, messageId), eq(messagesLivreOr.evenementId, evenementId)))
}

/* ------------------------------------------------------------------ *
 * Galerie partagée
 * ------------------------------------------------------------------ */

export interface PhotoVue {
  id: string
  deposantNom: string | null
  url: string
  statut: 'en_attente' | 'publie' | 'masque'
  creeLe: Date
}

export async function photosPubliees(evenementId: string): Promise<PhotoVue[]> {
  return bdd
    .select({
      id: photos.id,
      deposantNom: photos.deposantNom,
      url: photos.url,
      statut: photos.statut,
      creeLe: photos.creeLe,
    })
    .from(photos)
    .where(and(eq(photos.evenementId, evenementId), eq(photos.statut, 'publie')))
    .orderBy(desc(photos.creeLe))
}

export async function photosCompletes(evenementId: string): Promise<PhotoVue[]> {
  return bdd
    .select({
      id: photos.id,
      deposantNom: photos.deposantNom,
      url: photos.url,
      statut: photos.statut,
      creeLe: photos.creeLe,
    })
    .from(photos)
    .where(eq(photos.evenementId, evenementId))
    .orderBy(desc(photos.creeLe))
}

export async function deposerPhoto(
  evenementId: string,
  url: string,
  deposantNom: string | null,
): Promise<void> {
  await bdd.insert(photos).values({ evenementId, url, deposantNom })
}

export async function modererPhoto(
  evenementId: string,
  photoId: string,
  statut: 'publie' | 'masque',
): Promise<void> {
  await bdd
    .update(photos)
    .set({ statut })
    .where(and(eq(photos.id, photoId), eq(photos.evenementId, evenementId)))
}

/* ------------------------------------------------------------------ *
 * Cagnotte
 * ------------------------------------------------------------------ */

export interface ParticipationVue {
  id: string
  contributeur: string
  montant: number
  message: string | null
  statut: 'en_attente' | 'reussi' | 'echoue' | 'annule'
  creeLe: Date
}

export async function ouvrirParticipation(entree: {
  evenementId: string
  contributeur: string
  telephone: string | null
  montant: number
  message: string | null
  reference: string
}): Promise<void> {
  await bdd.insert(participations).values(entree).onConflictDoNothing()
}

export async function confirmerParticipation(
  reference: string,
  statut: 'reussi' | 'echoue' | 'annule',
): Promise<boolean> {
  const modifiees = await bdd
    .update(participations)
    .set({ statut, ...(statut === 'reussi' ? { confirmeeLe: new Date() } : {}) })
    .where(and(eq(participations.reference, reference), eq(participations.statut, 'en_attente')))
    .returning({ id: participations.id })
  return modifiees.length > 0
}

export async function participationsReussies(
  evenementId: string,
): Promise<ParticipationVue[]> {
  return bdd
    .select({
      id: participations.id,
      contributeur: participations.contributeur,
      montant: participations.montant,
      message: participations.message,
      statut: participations.statut,
      creeLe: participations.creeLe,
    })
    .from(participations)
    .where(and(eq(participations.evenementId, evenementId), eq(participations.statut, 'reussi')))
    .orderBy(desc(participations.creeLe))
}

/* ------------------------------------------------------------------ *
 * Modules ouverts par le créateur
 * ------------------------------------------------------------------ */

export async function reglerModules(
  evenementId: string,
  modules: {
    livreOrOuvert: boolean
    galerieOuverte: boolean
    cagnotteOuverte: boolean
    cagnotteMot: string | null
  },
): Promise<void> {
  await bdd.update(evenements).set(modules).where(eq(evenements.id, evenementId))
}

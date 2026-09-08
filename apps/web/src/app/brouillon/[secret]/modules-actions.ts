'use server'

import { revalidatePath } from 'next/cache'
import { engendrerJeton, lireListeInvites } from '@/lib/invites'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import {
  ajouterInvites,
  modererMessage,
  modererPhoto,
  reglerModules,
  retirerInvite,
} from '@/serveur/bdd/modules'

function texte(donnees: FormData, cle: string): string {
  return String(donnees.get(cle) ?? '').trim()
}

export async function importerInvites(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return

  const saisis = lireListeInvites(texte(donnees, 'liste'))
  await ajouterInvites(
    brouillon.id,
    saisis.map((invite) => ({ ...invite, jeton: engendrerJeton() })),
  )
  revalidatePath(`/brouillon/${secret}/invites`)
}

export async function supprimerInvite(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return
  await retirerInvite(brouillon.id, texte(donnees, 'inviteId'))
  revalidatePath(`/brouillon/${secret}/invites`)
}

export async function reglerOuvertures(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return

  const mot = texte(donnees, 'cagnotteMot')
  await reglerModules(brouillon.id, {
    livreOrOuvert: donnees.get('livreOr') === 'on',
    galerieOuverte: donnees.get('galerie') === 'on',
    cagnotteOuverte: donnees.get('cagnotte') === 'on',
    cagnotteMot: mot === '' ? null : mot,
  })
  revalidatePath(`/brouillon/${secret}/details`)
}

export async function trancherMessage(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return
  const statut = texte(donnees, 'statut') === 'publie' ? 'publie' : 'masque'
  await modererMessage(brouillon.id, texte(donnees, 'messageId'), statut)
  revalidatePath(`/brouillon/${secret}/moderation`)
}

export async function trancherPhoto(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return
  const statut = texte(donnees, 'statut') === 'publie' ? 'publie' : 'masque'
  await modererPhoto(brouillon.id, texte(donnees, 'photoId'), statut)
  revalidatePath(`/brouillon/${secret}/moderation`)
}

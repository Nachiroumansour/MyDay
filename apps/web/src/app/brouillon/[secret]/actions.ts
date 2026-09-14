'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ValeursChamps } from '@myday/moteur'
import {
  ajouterCeremonie,
  brouillonParSecret,
  enregistrerCarte,
  enregistrerDetails,
  enregistrerPhoto,
  modifierCeremonie,
  retirerCeremonie,
} from '@/serveur/bdd/brouillons'
import { enregistrerMedia, ErreurMedia } from '@/serveur/stockage'
import { resoudrePoint } from '@/serveur/localisation'

function texte(donnees: FormData, cle: string): string {
  return String(donnees.get(cle) ?? '').trim()
}

function texteOuNul(donnees: FormData, cle: string): string | null {
  const valeur = texte(donnees, cle)
  return valeur === '' ? null : valeur
}

export async function sauverCarte(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return

  const valeurs: ValeursChamps = {}
  for (const champ of brouillon.champs) {
    if (champ.type === 'image') continue
    valeurs[champ.id] = texte(donnees, `champ-${champ.id}`)
  }

  await enregistrerCarte(secret, valeurs)
  revalidatePath(`/brouillon/${secret}`)
}

export async function sauverPhoto(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return

  const recadrage = {
    zoom: Number(donnees.get('zoom') ?? 1),
    focaleX: Number(donnees.get('focaleX') ?? 0.5),
    focaleY: Number(donnees.get('focaleY') ?? 0.5),
  }

  const fichier = donnees.get('photo')
  if (fichier instanceof File && fichier.size > 0) {
    try {
      const media = await enregistrerMedia(new Uint8Array(await fichier.arrayBuffer()))
      await enregistrerPhoto(secret, media.url, recadrage)
    } catch (erreur) {
      const message = erreur instanceof ErreurMedia ? erreur.message : 'Photo refusée.'
      redirect(`/brouillon/${secret}?erreur=${encodeURIComponent(message)}#photo`)
    }
  } else {
    await enregistrerPhoto(secret, brouillon.photoUrl, recadrage)
  }

  revalidatePath(`/brouillon/${secret}`)
}

export async function retirerPhoto(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  await enregistrerPhoto(secret, null, null)
  revalidatePath(`/brouillon/${secret}`)
}

function horodatage(donnees: FormData, cleDate: string, cleHeure: string): Date | null {
  const date = texte(donnees, cleDate)
  const heure = texte(donnees, cleHeure) || '00:00'
  if (!date) return null
  // Le Sénégal est à UTC+0 : l'heure saisie est l'heure locale de la fête.
  const horodate = Date.parse(`${date}T${heure}:00Z`)
  return Number.isNaN(horodate) ? null : new Date(horodate)
}

export async function sauverCeremonie(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return

  const debuteLe = horodatage(donnees, 'debuteLe', 'heureDebut')
  const nom = texte(donnees, 'nom')
  const lieu = texte(donnees, 'lieu')
  if (!debuteLe || nom === '' || lieu === '') {
    redirect(`/brouillon/${secret}/programme?erreur=incomplet`)
  }

  // Un lien court de partage ne porte pas le point : il faut le déplier ici,
  // là où l'on peut sortir sur le réseau.
  const point = await resoudrePoint(texte(donnees, 'point'))

  const entree = {
    nom,
    debuteLe,
    termineLe: horodatage(donnees, 'debuteLe', 'heureFin'),
    lieu,
    adresse: texteOuNul(donnees, 'adresse'),
    repere: texteOuNul(donnees, 'repere'),
    codeVestimentaire: texteOuNul(donnees, 'codeVestimentaire'),
    note: texteOuNul(donnees, 'note'),
    latitude: point?.latitude ?? null,
    longitude: point?.longitude ?? null,
  }

  const ceremonieId = texte(donnees, 'ceremonieId')
  if (ceremonieId) await modifierCeremonie(brouillon.id, ceremonieId, entree)
  else await ajouterCeremonie(brouillon.id, entree)

  revalidatePath(`/brouillon/${secret}/programme`)
}

export async function supprimerCeremonie(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return
  await retirerCeremonie(brouillon.id, texte(donnees, 'ceremonieId'))
  revalidatePath(`/brouillon/${secret}/programme`)
}

export async function sauverDetails(donnees: FormData): Promise<void> {
  const secret = texte(donnees, 'secret')
  await enregistrerDetails(secret, {
    codeVestimentaire: texteOuNul(donnees, 'codeVestimentaire'),
    motDesHotes: texteOuNul(donnees, 'motDesHotes'),
    telephoneHote: texteOuNul(donnees, 'telephoneHote'),
  })
  revalidatePath(`/brouillon/${secret}/details`)
}


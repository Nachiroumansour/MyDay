/** Indicatif par défaut : la grande majorité des invités répond du Sénégal. */
const INDICATIF_DEFAUT = '+221'
const MESSAGE_MAX = 500
const PERSONNES_MAX = 20

/**
 * Ramène un numéro saisi à la main à sa forme internationale.
 * Renvoie `undefined` si ça ne ressemble pas à un numéro — c'est au
 * formulaire de le dire à l'invité, pas au moteur de deviner.
 */
export function normaliserTelephone(brut: string, indicatif = INDICATIF_DEFAUT): string | undefined {
  const nettoye = brut.replace(/[\s.\-()]/g, '')
  if (!/^\+?\d+$/.test(nettoye)) return undefined

  if (nettoye.startsWith('+') || nettoye.startsWith('00')) {
    const international = nettoye.startsWith('+') ? nettoye : `+${nettoye.slice(2)}`
    const chiffres = international.slice(1)
    if (chiffres.length < 8 || chiffres.length > 15) return undefined
    return international
  }

  // Numéro national : au Sénégal il fait neuf chiffres (77 123 45 67). On
  // vérifie cette longueur avant d'ajouter l'indicatif, sans quoi un numéro
  // manifestement trop court passerait grâce aux chiffres de l'indicatif.
  const national = nettoye.replace(/^0+/, '')
  if (national.length < 8 || national.length > 12) return undefined
  return `${indicatif}${national}`
}

export interface EntreeReponse {
  nom: string
  telephone: string
  present: boolean
  nbPersonnes: string | number
  ceremonieIds: string[]
  message?: string
}

export interface ReponseValidee {
  nom: string
  telephone: string
  present: boolean
  nbPersonnes: number
  ceremonieIds: string[]
  message?: string
}

export type ResultatValidation =
  | { ok: true; valeurs: ReponseValidee }
  | { ok: false; erreurs: Record<string, string> }

export function validerReponse(
  entree: EntreeReponse,
  ceremoniesConnues: string[],
): ResultatValidation {
  const erreurs: Record<string, string> = {}

  const nom = entree.nom.trim()
  if (nom === '') erreurs.nom = 'Indiquez votre nom.'
  else if (nom.length > 120) erreurs.nom = 'Ce nom est trop long.'

  const telephone = normaliserTelephone(entree.telephone.trim())
  if (!telephone) {
    erreurs.telephone = 'Ce numéro ne semble pas valide. Exemple : 77 123 45 67.'
  }

  // Qui ne vient pas n'a ni cérémonies ni accompagnants à déclarer.
  let nbPersonnes = 0
  let ceremonieIds: string[] = []

  if (entree.present) {
    nbPersonnes = Number(entree.nbPersonnes)
    if (!Number.isInteger(nbPersonnes) || nbPersonnes < 1) {
      erreurs.nbPersonnes = 'Indiquez combien vous serez.'
    } else if (nbPersonnes > PERSONNES_MAX) {
      erreurs.nbPersonnes = `Au-delà de ${PERSONNES_MAX} personnes, prévenez directement les hôtes.`
    }

    ceremonieIds = entree.ceremonieIds.filter((id) => ceremoniesConnues.includes(id))
    if (entree.ceremonieIds.length === 0) {
      erreurs.ceremonieIds = 'Choisissez au moins une cérémonie.'
    } else if (ceremonieIds.length !== entree.ceremonieIds.length) {
      erreurs.ceremonieIds = 'Une des cérémonies choisies n’existe pas.'
    }
  }

  if (Object.keys(erreurs).length > 0) return { ok: false, erreurs }

  const message = entree.message?.trim().slice(0, MESSAGE_MAX)

  return {
    ok: true,
    valeurs: {
      nom,
      telephone: telephone!,
      present: entree.present,
      nbPersonnes,
      ceremonieIds,
      ...(message ? { message } : {}),
    },
  }
}

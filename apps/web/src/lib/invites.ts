import { normaliserTelephone } from './rsvp'

/**
 * Alphabet sans caractère ambigu : un jeton se lit parfois à voix haute, et
 * se recopie à la main. Ni O ni 0, ni I ni l.
 */
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'
const LONGUEUR = 8

/** Jeton du lien nominatif : court, non devinable, sans donnée personnelle. */
export function engendrerJeton(): string {
  const octets = crypto.getRandomValues(new Uint8Array(LONGUEUR))
  return Array.from(octets, (octet) => ALPHABET[octet % ALPHABET.length]).join('')
}

export interface InviteSaisi {
  nomComplet: string
  telephone?: string
}

const NOM_MAX = 80

/**
 * Lit une liste d'invités collée telle quelle : un par ligne, le numéro
 * éventuellement après une virgule. On accepte le désordre plutôt que
 * d'imposer un format.
 */
export function lireListeInvites(brut: string): InviteSaisi[] {
  const vus = new Set<string>()
  const invites: InviteSaisi[] = []

  for (const ligne of brut.split(/\r?\n/)) {
    const [nomBrut, telephoneBrut] = ligne.split(',')
    const nomComplet = (nomBrut ?? '').trim()
    if (nomComplet === '' || nomComplet.length > NOM_MAX) continue

    const cle = nomComplet.toLowerCase()
    if (vus.has(cle)) continue
    vus.add(cle)

    const telephone = telephoneBrut ? normaliserTelephone(telephoneBrut.trim()) : undefined
    invites.push(telephone ? { nomComplet, telephone } : { nomComplet })
  }

  return invites
}

export function messageInvitation(nom: string, titre: string, lien: string): string {
  return [
    `${nom}, vous êtes convié à ${titre}.`,
    '',
    `Votre invitation : ${lien}`,
  ].join('\n')
}

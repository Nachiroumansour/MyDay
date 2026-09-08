export interface EvenementAgenda {
  /** Sert à construire l'UID : doit être stable dans le temps. */
  identifiant: string
  titre: string
  debut: Date
  fin?: Date | null
  lieu: string
  description?: string
  url?: string
}

const UNE_HEURE = 60 * 60 * 1000
const LONGUEUR_MAX = 75

/** Format de date iCalendar : 20270314T163000Z. */
function horodatage(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Les virgules, points-virgules et antislashs ont un sens en iCalendar. */
function echapper(valeur: string): string {
  return valeur
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * iCalendar limite les lignes à 75 octets. Au-delà, on replie en préfixant
 * la suite d'une espace. Le découpage se fait sur les octets, pas sur les
 * caractères — mais jamais au milieu d'un caractère multi-octets.
 */
function replier(ligne: string): string[] {
  if (Buffer.byteLength(ligne, 'utf8') <= LONGUEUR_MAX) return [ligne]

  const morceaux: string[] = []
  let courant = ''
  let limite = LONGUEUR_MAX

  for (const caractere of ligne) {
    if (Buffer.byteLength(courant + caractere, 'utf8') > limite) {
      morceaux.push(courant)
      courant = ' '
      limite = LONGUEUR_MAX
    }
    courant += caractere
  }
  if (courant.trim() !== '') morceaux.push(courant)
  return morceaux
}

export function genererIcs(evenement: EvenementAgenda): string {
  const fin = evenement.fin ?? new Date(evenement.debut.getTime() + UNE_HEURE)

  const lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyDay//Invitation//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${evenement.identifiant}@myday.sn`,
    `DTSTAMP:${horodatage(new Date())}`,
    `DTSTART:${horodatage(evenement.debut)}`,
    `DTEND:${horodatage(fin)}`,
    `SUMMARY:${echapper(evenement.titre)}`,
    `LOCATION:${echapper(evenement.lieu)}`,
    ...(evenement.description ? [`DESCRIPTION:${echapper(evenement.description)}`] : []),
    ...(evenement.url ? [`URL:${echapper(evenement.url)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lignes.flatMap(replier).join('\r\n')
}

/**
 * Le Sénégal est à UTC+0 toute l'année, sans heure d'été. Tout est donc
 * formaté dans ce fuseau, quel que soit l'appareil de l'invité — un invité
 * en diaspora doit lire l'heure de la cérémonie, pas l'heure de chez lui.
 */
const FUSEAU = 'Africa/Dakar'
const LOCALE = 'fr-FR'

const JOUR_EN_MS = 24 * 60 * 60 * 1000

export function formaterDateLongue(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: FUSEAU,
  }).format(date)
}

export function formaterDateCourte(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    timeZone: FUSEAU,
  }).format(date)
}

function parties(date: Date): { heure: number; minute: number; jour: string } {
  const f = new Intl.DateTimeFormat('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
    timeZone: FUSEAU,
  }).formatToParts(date)
  const par = (type: string) => f.find((p) => p.type === type)?.value ?? '0'
  return {
    heure: Number(par('hour')),
    minute: Number(par('minute')),
    jour: `${par('year')}-${par('month')}-${par('day')}`,
  }
}

/** « 16h30 », et « 9h » quand les minutes sont nulles. */
export function formaterHeure(date: Date): string {
  const { heure, minute } = parties(date)
  return minute === 0 ? `${heure}h` : `${heure}h${String(minute).padStart(2, '0')}`
}

export function formaterPlage(debut: Date, fin?: Date | null): string {
  if (!fin) return formaterHeure(debut)
  const memeJour = parties(debut).jour === parties(fin).jour
  return memeJour
    ? `${formaterHeure(debut)} – ${formaterHeure(fin)}`
    : `${formaterHeure(debut)} – ${formaterHeure(fin)} le lendemain`
}

/** Jours entiers séparant les deux dates, comptés en jours calendaires. */
export function joursRestants(cible: Date, maintenant: Date = new Date()): number {
  const minuit = (d: Date) => Date.parse(`${parties(d).jour}T00:00:00Z`)
  return Math.round((minuit(cible) - minuit(maintenant)) / JOUR_EN_MS)
}

export function libelleCompteARebours(jours: number): string {
  if (jours < 0) return ''
  if (jours === 0) return 'C’est aujourd’hui'
  if (jours === 1) return 'C’est demain'
  return `J-${jours}`
}

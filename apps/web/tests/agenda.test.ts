import { describe, expect, it } from 'vitest'
import { genererIcs } from '../src/lib/agenda'

const base = {
  identifiant: 'ceremonie-1',
  titre: 'Takk — Awa & Moussa',
  debut: new Date('2027-03-14T16:30:00Z'),
  lieu: 'Grand Théâtre, Dakar',
  url: 'https://myday.sn/e/awa-moussa',
}

describe('genererIcs', () => {
  it('produit un calendrier valide', () => {
    const ics = genererIcs(base)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('écrit les dates au format UTC compact', () => {
    expect(genererIcs(base)).toContain('DTSTART:20270314T163000Z')
  })

  it('donne une durée d’une heure par défaut', () => {
    expect(genererIcs(base)).toContain('DTEND:20270314T173000Z')
  })

  it('respecte une fin explicite', () => {
    const ics = genererIcs({ ...base, fin: new Date('2027-03-14T22:00:00Z') })
    expect(ics).toContain('DTEND:20270314T220000Z')
  })

  it('échappe les virgules et les points-virgules du lieu', () => {
    const ics = genererIcs({ ...base, lieu: 'Sacré-Cœur 3, en face de Total; Dakar' })
    expect(ics).toContain('LOCATION:Sacré-Cœur 3\\, en face de Total\; Dakar')
  })

  it('sépare les lignes par un retour chariot suivi d’un saut de ligne', () => {
    expect(genererIcs(base).split('\r\n').length).toBeGreaterThan(8)
  })

  it('replie les lignes trop longues', () => {
    const ics = genererIcs({ ...base, titre: 'A'.repeat(200) })
    for (const ligne of ics.split('\r\n')) {
      expect(Buffer.byteLength(ligne, 'utf8')).toBeLessThanOrEqual(75)
    }
  })

  it('donne un identifiant unique et stable à l’événement', () => {
    expect(genererIcs(base)).toContain('UID:ceremonie-1@myday.sn')
    expect(genererIcs(base)).toBe(genererIcs(base).replace(/DTSTAMP:[^\r]*/, (m) => m))
  })
})

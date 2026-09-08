import { describe, expect, it } from 'vitest'
import {
  formaterDateCourte,
  formaterDateLongue,
  formaterHeure,
  formaterPlage,
  joursRestants,
  libelleCompteARebours,
} from '../src/lib/dates'

// Le Sénégal est à UTC+0 toute l'année : les dates sont écrites en UTC.
const samedi14mars = new Date('2027-03-14T16:30:00Z')

describe('formaterDateLongue', () => {
  it('écrit la date en toutes lettres, en français', () => {
    expect(formaterDateLongue(samedi14mars)).toBe('dimanche 14 mars 2027')
  })

  it('n’ajoute pas de zéro devant le quantième', () => {
    expect(formaterDateLongue(new Date('2027-03-02T10:00:00Z'))).toBe('mardi 2 mars 2027')
  })
})

describe('formaterDateCourte', () => {
  it('écrit la date sans le jour de la semaine, année comprise', () => {
    expect(formaterDateCourte(samedi14mars)).toBe('14 mars 2027')
  })
})

describe('formaterHeure', () => {
  it('écrit l’heure à la française', () => {
    expect(formaterHeure(samedi14mars)).toBe('16h30')
  })

  it('omet les minutes quand elles sont nulles', () => {
    expect(formaterHeure(new Date('2027-03-14T09:00:00Z'))).toBe('9h')
  })
})

describe('formaterPlage', () => {
  it('donne une seule heure quand il n’y a pas de fin', () => {
    expect(formaterPlage(samedi14mars)).toBe('16h30')
  })

  it('donne la plage quand la fin est le même jour', () => {
    expect(formaterPlage(samedi14mars, new Date('2027-03-14T22:00:00Z'))).toBe('16h30 – 22h')
  })

  it('mentionne le jour suivant quand la fin déborde', () => {
    expect(formaterPlage(samedi14mars, new Date('2027-03-15T02:00:00Z'))).toBe(
      '16h30 – 2h le lendemain',
    )
  })
})

describe('joursRestants', () => {
  it('compte les jours entiers restants', () => {
    expect(joursRestants(samedi14mars, new Date('2027-03-01T00:00:00Z'))).toBe(13)
  })

  it('renvoie zéro le jour même', () => {
    expect(joursRestants(samedi14mars, new Date('2027-03-14T08:00:00Z'))).toBe(0)
  })

  it('renvoie un nombre négatif après l’événement', () => {
    expect(joursRestants(samedi14mars, new Date('2027-03-20T08:00:00Z'))).toBeLessThan(0)
  })
})

describe('libelleCompteARebours', () => {
  it('écrit J moins le nombre de jours', () => {
    expect(libelleCompteARebours(42)).toBe('J-42')
  })

  it('annonce demain', () => {
    expect(libelleCompteARebours(1)).toBe('C’est demain')
  })

  it('annonce le jour même', () => {
    expect(libelleCompteARebours(0)).toBe('C’est aujourd’hui')
  })

  it('ne compte plus une fois l’événement passé', () => {
    expect(libelleCompteARebours(-3)).toBe('')
  })
})

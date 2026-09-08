import { describe, expect, it } from 'vitest'
import { normaliserTelephone, validerReponse } from '../src/lib/rsvp'

describe('normaliserTelephone', () => {
  it('préfixe un numéro sénégalais local', () => {
    expect(normaliserTelephone('77 123 45 67')).toBe('+221771234567')
  })

  it('accepte un numéro déjà international', () => {
    expect(normaliserTelephone('+33 6 12 34 56 78')).toBe('+33612345678')
  })

  it('accepte la forme 00 pour l’international', () => {
    expect(normaliserTelephone('0033612345678')).toBe('+33612345678')
  })

  it('retire les points, tirets et espaces', () => {
    expect(normaliserTelephone('77-123.45 67')).toBe('+221771234567')
  })

  it('refuse un numéro trop court', () => {
    expect(normaliserTelephone('12345')).toBeUndefined()
  })

  it('refuse ce qui n’est pas un numéro', () => {
    expect(normaliserTelephone('pas un numéro')).toBeUndefined()
  })
})

describe('validerReponse', () => {
  const valide = {
    nom: 'Aminata Diallo',
    telephone: '77 123 45 67',
    present: true,
    nbPersonnes: '2',
    ceremonieIds: ['c1', 'c2'],
    message: 'Avec joie !',
  }

  it('accepte une réponse complète', () => {
    const r = validerReponse(valide, ['c1', 'c2', 'c3'])
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.valeurs.telephone).toBe('+221771234567')
      expect(r.valeurs.nbPersonnes).toBe(2)
      expect(r.valeurs.ceremonieIds).toEqual(['c1', 'c2'])
    }
  })

  it('exige un nom', () => {
    const r = validerReponse({ ...valide, nom: '  ' }, ['c1'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erreurs.nom).toBe('Indiquez votre nom.')
  })

  it('explique ce qui ne va pas dans le numéro', () => {
    const r = validerReponse({ ...valide, telephone: '123' }, ['c1'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erreurs.telephone).toContain('numéro')
  })

  it('n’exige aucune cérémonie de qui ne vient pas', () => {
    const r = validerReponse({ ...valide, present: false, ceremonieIds: [] }, ['c1'])
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.valeurs.nbPersonnes).toBe(0)
  })

  it('exige au moins une cérémonie de qui vient', () => {
    const r = validerReponse({ ...valide, ceremonieIds: [] }, ['c1', 'c2'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erreurs.ceremonieIds).toContain('cérémonie')
  })

  it('rejette une cérémonie qui n’appartient pas à l’événement', () => {
    const r = validerReponse({ ...valide, ceremonieIds: ['c1', 'intrus'] }, ['c1', 'c2'])
    expect(r.ok).toBe(false)
  })

  it('borne le nombre de personnes', () => {
    const r = validerReponse({ ...valide, nbPersonnes: '99' }, ['c1', 'c2'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erreurs.nbPersonnes).toBeDefined()
  })

  it('tronque un message trop long plutôt que de le refuser', () => {
    const r = validerReponse({ ...valide, message: 'a'.repeat(2000) }, ['c1', 'c2'])
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.valeurs.message?.length).toBeLessThanOrEqual(500)
  })
})

import { describe, expect, it } from 'vitest'
import { engendrerJeton, lireListeInvites, messageInvitation } from '../src/lib/invites'

describe('engendrerJeton', () => {
  it('produit un jeton court', () => {
    expect(engendrerJeton().length).toBe(8)
  })

  it('n’utilise que des caractères sans ambiguïté', () => {
    // Ni O ni 0, ni I ni l : un jeton se lit parfois à voix haute.
    for (let i = 0; i < 200; i += 1) {
      expect(engendrerJeton()).toMatch(/^[23456789abcdefghjkmnpqrstuvwxyz]{8}$/)
    }
  })

  it('ne produit pas deux fois le même', () => {
    const jetons = new Set(Array.from({ length: 500 }, engendrerJeton))
    expect(jetons.size).toBe(500)
  })
})

describe('lireListeInvites', () => {
  it('lit un nom par ligne', () => {
    expect(lireListeInvites('Awa Diallo\nMoussa Fall')).toEqual([
      { nomComplet: 'Awa Diallo' },
      { nomComplet: 'Moussa Fall' },
    ])
  })

  it('lit un nom et un numéro séparés par une virgule', () => {
    expect(lireListeInvites('Awa Diallo, 77 123 45 67')).toEqual([
      { nomComplet: 'Awa Diallo', telephone: '+221771234567' },
    ])
  })

  it('ignore les lignes vides', () => {
    expect(lireListeInvites('Awa\n\n  \nMoussa')).toHaveLength(2)
  })

  it('ignore un numéro illisible plutôt que de refuser la ligne', () => {
    expect(lireListeInvites('Awa Diallo, pas un numéro')).toEqual([
      { nomComplet: 'Awa Diallo' },
    ])
  })

  it('écarte un doublon de nom', () => {
    expect(lireListeInvites('Awa\nAwa')).toHaveLength(1)
  })

  it('plafonne la longueur d’un nom', () => {
    expect(lireListeInvites('A'.repeat(200))).toHaveLength(0)
  })
})

describe('messageInvitation', () => {
  it('nomme l’invité et porte son lien', () => {
    const message = messageInvitation('Awa Diallo', 'Aminata & Ibrahima', 'https://x.sn/e/a/b')
    expect(message).toContain('Awa Diallo')
    expect(message).toContain('https://x.sn/e/a/b')
  })
})

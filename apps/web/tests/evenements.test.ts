import { describe, expect, it } from 'vitest'
import {
  couleurEvenement,
  estTypeEvenement,
  libelleEvenement,
  TYPES_EVENEMENT,
} from '../src/lib/evenements'

describe('types d’événement', () => {
  it('en compte exactement trois', () => {
    expect(TYPES_EVENEMENT).toEqual(['mariage', 'bapteme', 'anniversaire'])
  })

  it('associe à chacun la couleur de la direction de design', () => {
    expect(couleurEvenement('mariage')).toBe('#2C3A80')
    expect(couleurEvenement('bapteme')).toBe('#1F6B4A')
    expect(couleurEvenement('anniversaire')).toBe('#C9700F')
  })

  it('donne un libellé lisible et accentué', () => {
    expect(libelleEvenement('bapteme')).toBe('Baptême')
    expect(libelleEvenement('mariage')).toBe('Mariage')
    expect(libelleEvenement('anniversaire')).toBe('Anniversaire')
  })

  it('reconnaît un type valide', () => {
    expect(estTypeEvenement('mariage')).toBe(true)
  })

  it('rejette ce qui n’est pas un type', () => {
    expect(estTypeEvenement('graduation')).toBe(false)
    expect(estTypeEvenement('')).toBe(false)
  })

  it('n’attribue jamais deux fois la même couleur', () => {
    const couleurs = TYPES_EVENEMENT.map(couleurEvenement)
    expect(new Set(couleurs).size).toBe(couleurs.length)
  })
})

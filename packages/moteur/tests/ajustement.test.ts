import { describe, expect, it } from 'vitest'
import { ajusterAuCadre, PLANCHER_ECHELLE } from '../src/gabarit/ajustement.js'
import type { PoliceChargee } from '../src/rendu/polices.js'

/** Police fictive : chaque caractère fait exactement une demi-taille de large. */
const policeFictive: PoliceChargee = {
  nom: 'Fictive',
  mesurer: (texte, taille) => texte.length * taille * 0.5,
}

const cadre = { x: 0, y: 0, largeur: 200, hauteur: 60 }

describe('ajusterAuCadre', () => {
  it('garde la taille nominale quand le texte tient déjà', () => {
    // « Awa » = 3 × 40 × 0,5 = 60 unités, largement sous 200.
    expect(ajusterAuCadre('Awa', policeFictive, 40, cadre)).toEqual({
      taille: 40,
      deborde: false,
    })
  })

  it('réduit la taille jusqu’à ce que le texte tienne', () => {
    // 15 caractères à la taille 40 font 300 unités : il faut descendre à 26,67,
    // ce qui reste au-dessus du plancher de 24.
    const resultat = ajusterAuCadre('A'.repeat(15), policeFictive, 40, cadre)
    expect(resultat.taille).toBeLessThan(40)
    expect(resultat.deborde).toBe(false)
    expect(policeFictive.mesurer('A'.repeat(15), resultat.taille)).toBeLessThanOrEqual(200)
  })

  it('ne descend jamais sous le plancher et signale le débordement', () => {
    const resultat = ajusterAuCadre('A'.repeat(100), policeFictive, 40, cadre)
    expect(resultat.taille).toBe(40 * PLANCHER_ECHELLE)
    expect(resultat.deborde).toBe(true)
  })

  it('traite une chaîne vide sans rien changer', () => {
    expect(ajusterAuCadre('', policeFictive, 40, cadre)).toEqual({ taille: 40, deborde: false })
  })

  it('refuse un cadre de largeur nulle en gardant la taille nominale', () => {
    const resultat = ajusterAuCadre('Awa', policeFictive, 40, { ...cadre, largeur: 0 })
    expect(resultat.taille).toBe(40 * PLANCHER_ECHELLE)
    expect(resultat.deborde).toBe(true)
  })
})

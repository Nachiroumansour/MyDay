import { describe, expect, it } from 'vitest'
import { festivite, grainsAmbiance, TOUTES_FESTIVITES } from '../src/lib/festivite'
import { TYPES_EVENEMENT } from '../src/lib/evenements'

describe('festivite', () => {
  it('donne une ambiance à chaque type d’événement', () => {
    for (const type of TYPES_EVENEMENT) {
      expect(festivite(type).type).toBe(type)
    }
  })

  it('donne à chacune sa forme qui tombe', () => {
    expect(festivite('mariage').forme).toBe('petale')
    expect(festivite('bapteme').forme).toBe('bulle')
    expect(festivite('anniversaire').forme).toBe('confetti')
  })

  it('n’attribue pas deux fois la même forme', () => {
    const formes = TOUTES_FESTIVITES.map((f) => f.forme)
    expect(new Set(formes).size).toBe(formes.length)
  })

  it('donne un emoji principal et une palette', () => {
    for (const f of TOUTES_FESTIVITES) {
      expect(f.emoji.length).toBeGreaterThan(0)
      expect(f.emojis.length).toBeGreaterThanOrEqual(3)
      expect(f.emojis).toContain(f.emoji)
    }
  })

  it('reprend la couleur de l’événement, plus une profonde et une claire', () => {
    const mariage = festivite('mariage')
    expect(mariage.couleur).toBe('#2C3A80')
    expect(mariage.couleurProfonde).not.toBe(mariage.couleur)
    expect(mariage.couleurClaire).not.toBe(mariage.couleur)
  })

  it('nomme la fête pour l’oreille, pas pour la machine', () => {
    expect(festivite('bapteme').invitation).toContain('baptême')
  })
})

describe('grainsAmbiance', () => {
  it('produit le nombre demandé', () => {
    expect(grainsAmbiance('mariage', 20)).toHaveLength(20)
  })

  it('est déterministe — le serveur et le navigateur doivent voir la même chose', () => {
    expect(grainsAmbiance('mariage', 12)).toEqual(grainsAmbiance('mariage', 12))
  })

  it('donne des ambiances différentes selon la fête', () => {
    expect(grainsAmbiance('mariage', 12)).not.toEqual(grainsAmbiance('anniversaire', 12))
  })

  it('répartit les grains sur toute la largeur', () => {
    const grains = grainsAmbiance('mariage', 30)
    expect(Math.min(...grains.map((g) => g.gauche))).toBeLessThan(20)
    expect(Math.max(...grains.map((g) => g.gauche))).toBeGreaterThan(80)
  })

  it('décale les départs pour qu’ils ne tombent pas en rang', () => {
    const delais = grainsAmbiance('mariage', 20).map((g) => g.delai)
    expect(new Set(delais).size).toBeGreaterThan(10)
  })

  it('varie les tailles et les vitesses', () => {
    const grains = grainsAmbiance('anniversaire', 20)
    expect(new Set(grains.map((g) => g.taille)).size).toBeGreaterThan(3)
    expect(new Set(grains.map((g) => g.duree)).size).toBeGreaterThan(3)
  })

  it('reste dans des bornes qui gardent l’animation lente et discrète', () => {
    for (const grain of grainsAmbiance('mariage', 40)) {
      expect(grain.duree).toBeGreaterThanOrEqual(9)
      expect(grain.duree).toBeLessThanOrEqual(20)
      expect(grain.opacite).toBeLessThanOrEqual(0.5)
      expect(grain.gauche).toBeGreaterThanOrEqual(0)
      expect(grain.gauche).toBeLessThanOrEqual(100)
    }
  })
})

describe('zones d’ambiance', () => {
  it('tient les grains hors de la colonne centrale en mode bords', async () => {
    const { grainsAmbiance } = await import('../src/lib/festivite')
    for (const grain of grainsAmbiance('mariage', 24, 'bords')) {
      expect(grain.gauche < 30 || grain.gauche > 70).toBe(true)
    }
  })

  it('couvre les deux côtés', async () => {
    const { grainsAmbiance } = await import('../src/lib/festivite')
    const grains = grainsAmbiance('mariage', 24, 'bords')
    expect(grains.some((g) => g.gauche < 30)).toBe(true)
    expect(grains.some((g) => g.gauche > 70)).toBe(true)
  })
})

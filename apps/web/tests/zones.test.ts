import { describe, expect, it } from 'vitest'
import { zonesTactiles } from '../src/lib/zones'

const VUE = { largeur: 600, hauteur: 900 }
const champ = (id: string, x: number, y: number, largeur: number, hauteur: number, type = 'texte') => ({
  id,
  type,
  cadre: { x, y, largeur, hauteur },
})

describe('zonesTactiles', () => {
  it('reporte le cadre du graphiste en pourcentages de la carte', () => {
    const [zone] = zonesTactiles([champ('nom_1', 60, 225, 480, 90)], VUE)
    expect(zone).toEqual({ id: 'nom_1', gauche: 10, haut: 25, largeur: 80, hauteur: 10 })
  })

  it('range les zones dans l’ordre de lecture', () => {
    const zones = zonesTactiles(
      [champ('lieu', 80, 728, 440, 36), champ('nom_1', 70, 218, 460, 74), champ('date', 80, 632, 440, 38)],
      VUE,
    )
    expect(zones.map((z) => z.id)).toEqual(['nom_1', 'date', 'lieu'])
  })

  it('départage deux champs sur la même ligne de gauche à droite', () => {
    const zones = zonesTactiles([champ('b', 300, 100, 100, 40), champ('a', 50, 100, 100, 40)], VUE)
    expect(zones.map((z) => z.id)).toEqual(['a', 'b'])
  })

  it('laisse la zone photo à ses curseurs', () => {
    expect(zonesTactiles([champ('zone_photo', 0, 0, 100, 100, 'image')], VUE)).toEqual([])
  })

  it('rogne un cadre qui déborde de la carte', () => {
    const [zone] = zonesTactiles([champ('x', 500, 850, 200, 100)], VUE)
    expect(zone!.gauche + zone!.largeur).toBeCloseTo(100)
    expect(zone!.haut + zone!.hauteur).toBeCloseTo(100)
  })

  it('écarte un cadre entièrement hors de la carte', () => {
    expect(zonesTactiles([champ('x', 700, 100, 50, 50)], VUE)).toEqual([])
  })

  it('ne rend rien d’une carte sans dimensions', () => {
    expect(zonesTactiles([champ('x', 0, 0, 10, 10)], { largeur: 0, hauteur: 900 })).toEqual([])
  })
})

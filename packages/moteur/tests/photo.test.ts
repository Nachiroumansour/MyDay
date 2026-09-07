import { describe, expect, it } from 'vitest'
import { analyserDocument, serialiserDocument } from '../src/dom.js'
import { calculerPlacement, insererPhoto } from '../src/gabarit/photo.js'
import { RECADRAGE_NEUTRE } from '../src/types.js'

const cadre = { x: 100, y: 200, largeur: 300, hauteur: 300 }

describe('calculerPlacement', () => {
  it('couvre le cadre avec une photo carrée sans marge', () => {
    const place = calculerPlacement(cadre, { largeur: 800, hauteur: 800 }, RECADRAGE_NEUTRE)
    expect(place.largeur).toBeCloseTo(300)
    expect(place.hauteur).toBeCloseTo(300)
    expect(place.x).toBeCloseTo(100)
    expect(place.y).toBeCloseTo(200)
  })

  it('déborde sur la largeur pour une photo panoramique', () => {
    const place = calculerPlacement(cadre, { largeur: 1600, hauteur: 800 }, RECADRAGE_NEUTRE)
    expect(place.hauteur).toBeCloseTo(300)
    expect(place.largeur).toBeCloseTo(600)
    // Centrée : elle dépasse de 150 de chaque côté.
    expect(place.x).toBeCloseTo(-50)
  })

  it('agrandit selon le zoom', () => {
    const place = calculerPlacement(cadre, { largeur: 800, hauteur: 800 }, {
      ...RECADRAGE_NEUTRE,
      zoom: 2,
    })
    expect(place.largeur).toBeCloseTo(600)
  })

  it('déplace le cadrage selon le point focal', () => {
    const gauche = calculerPlacement(cadre, { largeur: 1600, hauteur: 800 }, {
      zoom: 1,
      focaleX: 0,
      focaleY: 0.5,
    })
    expect(gauche.x).toBeCloseTo(100)
  })

  it('ne laisse jamais apparaître de vide dans le cadre', () => {
    const place = calculerPlacement(cadre, { largeur: 1600, hauteur: 800 }, {
      zoom: 1,
      focaleX: 1,
      focaleY: 1,
    })
    expect(place.x).toBeLessThanOrEqual(cadre.x)
    expect(place.y).toBeLessThanOrEqual(cadre.y)
    expect(place.x + place.largeur).toBeGreaterThanOrEqual(cadre.x + cadre.largeur)
    expect(place.y + place.hauteur).toBeGreaterThanOrEqual(cadre.y + cadre.hauteur)
  })

  it('refuse un zoom inférieur à 1 en le ramenant à 1', () => {
    const place = calculerPlacement(cadre, { largeur: 800, hauteur: 800 }, {
      ...RECADRAGE_NEUTRE,
      zoom: 0.2,
    })
    expect(place.largeur).toBeCloseTo(300)
  })
})

describe('insererPhoto', () => {
  const gabarit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
    <rect data-champ="zone_photo" data-type="image" x="100" y="200" width="300" height="300"/>
  </svg>`

  it('remplace le rectangle par une image détourée', () => {
    const doc = analyserDocument(gabarit)
    insererPhoto(doc, 'zone_photo', {
      source: 'data:image/jpeg;base64,AAA',
      largeur: 800,
      hauteur: 800,
    })
    const sortie = serialiserDocument(doc)
    expect(sortie).toContain('<image')
    expect(sortie).toContain('clipPath')
    expect(sortie).toContain('data:image/jpeg;base64,AAA')
  })

  it('ignore un identifiant de champ inconnu sans lever', () => {
    const doc = analyserDocument(gabarit)
    expect(() =>
      insererPhoto(doc, 'inexistant', { source: 'x', largeur: 10, hauteur: 10 }),
    ).not.toThrow()
  })
})

import { describe, expect, it } from 'vitest'
import { lienGoogleMaps, lienWaze } from '../src/lib/itineraire'

describe('lienGoogleMaps', () => {
  it('utilise les coordonnées quand on les a', () => {
    const lien = lienGoogleMaps({ lieu: 'Grand Théâtre', latitude: 14.7, longitude: -17.47 })
    expect(lien).toBe('https://www.google.com/maps/dir/?api=1&destination=14.7%2C-17.47')
  })

  it('retombe sur le texte quand les coordonnées manquent', () => {
    const lien = lienGoogleMaps({ lieu: 'Grand Théâtre', adresse: 'Dakar' })
    expect(lien).toContain('destination=Grand%20Th%C3%A9%C3%A2tre%2C%20Dakar')
  })

  it('se contente du lieu quand il n’y a pas d’adresse', () => {
    expect(lienGoogleMaps({ lieu: 'Grand Théâtre' })).toContain('destination=Grand%20Th')
  })
})

describe('lienWaze', () => {
  it('utilise les coordonnées quand on les a', () => {
    expect(lienWaze({ lieu: 'x', latitude: 14.7, longitude: -17.47 })).toBe(
      'https://waze.com/ul?ll=14.7%2C-17.47&navigate=yes',
    )
  })

  it('cherche par nom sinon', () => {
    expect(lienWaze({ lieu: 'Grand Théâtre', adresse: 'Dakar' })).toContain('q=Grand%20Th')
  })
})

import { describe, expect, it } from 'vitest'
import {
  formulesIntro,
  libelleChamp,
  longueurConseillee,
  manquants,
} from '../src/lib/redaction'

describe('formulesIntro', () => {
  it('propose des formules pour chaque type d’événement', () => {
    for (const type of ['mariage', 'bapteme', 'anniversaire'] as const) {
      expect(formulesIntro(type).length).toBeGreaterThanOrEqual(3)
    }
  })

  it('propose au moins une formule en wolof', () => {
    expect(formulesIntro('mariage').some((f) => f.langue === 'wolof')).toBe(true)
  })

  it('ne propose que des formules assez courtes pour une carte', () => {
    for (const formule of formulesIntro('mariage')) {
      expect(formule.texte.length).toBeLessThanOrEqual(160)
    }
  })
})

describe('libelleChamp', () => {
  it('traduit les identifiants techniques en mots du client', () => {
    expect(libelleChamp('nom_1', 'mariage')).toBe('Prénom de la mariée')
    expect(libelleChamp('nom_2', 'mariage')).toBe('Prénom du marié')
    expect(libelleChamp('nom_1', 'bapteme')).toBe('Prénom de l’enfant')
  })

  it('reste lisible pour un champ inconnu', () => {
    expect(libelleChamp('mystere', 'mariage')).toBe('Mystere')
  })
})

describe('longueurConseillee', () => {
  it('avertit quand le texte approche de la limite', () => {
    expect(longueurConseillee('a'.repeat(17), 18)).toBe('proche')
  })

  it('signale un dépassement', () => {
    expect(longueurConseillee('a'.repeat(19), 18)).toBe('trop-long')
  })

  it('ne dit rien quand tout va bien', () => {
    expect(longueurConseillee('Awa', 18)).toBe('bon')
  })

  it('ne dit rien sans limite déclarée', () => {
    expect(longueurConseillee('a'.repeat(200))).toBe('bon')
  })
})

describe('manquants', () => {
  const champs = [
    { id: 'nom_1', type: 'texte' as const },
    { id: 'date', type: 'date' as const },
    { id: 'zone_photo', type: 'image' as const },
  ]

  it('liste ce qui reste à remplir', () => {
    expect(manquants(champs, { nom_1: 'Awa' })).toEqual(['date'])
  })

  it('n’exige jamais la photo', () => {
    expect(manquants(champs, { nom_1: 'Awa', date: '14 mars' })).toEqual([])
  })

  it('traite un champ vide comme manquant', () => {
    expect(manquants(champs, { nom_1: '   ', date: '14 mars' })).toEqual(['nom_1'])
  })
})

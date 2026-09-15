import { describe, expect, it } from 'vitest'
import {
  formulesIntro,
  grouperChamps,
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

describe('champs facultatifs', () => {
  it('n’exige pas un champ déclaré facultatif', () => {
    const champs = [
      { id: 'nom_1', type: 'texte' as const },
      { id: 'mot_final', type: 'texte' as const, facultatif: true },
    ]
    expect(manquants(champs, { nom_1: 'Awa', mot_final: '' })).toEqual([])
  })

  it('exige toujours les autres', () => {
    const champs = [
      { id: 'nom_1', type: 'texte' as const },
      { id: 'mot_final', type: 'texte' as const, facultatif: true },
    ]
    expect(manquants(champs, { nom_1: '', mot_final: '' })).toEqual(['nom_1'])
  })
})

describe('grouperChamps', () => {
  const champ = (id: string, type = 'texte') => ({ id, type })

  it('range les huit champs d’un modèle orné en quatre blocs', () => {
    const groupes = grouperChamps([
      champ('ceremonie'),
      champ('nom_1'),
      champ('famille_1'),
      champ('nom_2'),
      champ('famille_2'),
      champ('date', 'date'),
      champ('lieu'),
      champ('mot_final'),
    ])
    expect(groupes.map((g) => g.titre)).toEqual([
      'La célébration',
      'Les noms',
      'Quand et où',
      'La touche finale',
    ])
  })

  it('met prénom et nom de famille sur la même ligne', () => {
    const groupes = grouperChamps([
      champ('nom_1'),
      champ('famille_1'),
      champ('nom_2'),
      champ('famille_2'),
    ])
    expect(groupes[0]!.rangees.map((r) => r.champs.map((c) => c.id))).toEqual([
      ['nom_1', 'famille_1'],
      ['nom_2', 'famille_2'],
    ])
  })

  it('laisse un prénom seul sur sa ligne quand le nom manque', () => {
    const groupes = grouperChamps([champ('nom_1'), champ('nom_2')])
    expect(groupes[0]!.rangees.map((r) => r.champs.length)).toEqual([1, 1])
  })

  it('ignore la zone photo, que le formulaire traite à part', () => {
    const groupes = grouperChamps([champ('nom_1'), champ('zone_photo', 'image')])
    expect(groupes.flatMap((g) => g.rangees.flatMap((r) => r.champs.map((c) => c.id)))).toEqual([
      'nom_1',
    ])
  })

  it('n’oublie aucun champ inconnu', () => {
    const groupes = grouperChamps([champ('nom_1'), champ('devise_secrete')])
    const tous = groupes.flatMap((g) => g.rangees.flatMap((r) => r.champs.map((c) => c.id)))
    expect(tous).toContain('devise_secrete')
    expect(groupes.at(-1)!.titre).toBe('Le reste')
  })

  it('ne crée pas de bloc vide', () => {
    const groupes = grouperChamps([champ('date', 'date')])
    expect(groupes).toHaveLength(1)
    expect(groupes[0]!.titre).toBe('Quand et où')
  })

  it('tient un gabarit sans aucun champ', () => {
    expect(grouperChamps([])).toEqual([])
  })
})

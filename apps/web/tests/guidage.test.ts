import { describe, expect, it } from 'vitest'
import {
  etapesGuidage,
  nommerStyle,
  scoreGabarit,
  tagsDepuisChoix,
} from '../src/lib/guidage'

describe('etapesGuidage', () => {
  it('propose trois étapes par type d’événement', () => {
    expect(etapesGuidage('mariage')).toHaveLength(3)
    expect(etapesGuidage('bapteme')).toHaveLength(3)
    expect(etapesGuidage('anniversaire')).toHaveLength(3)
  })

  it('n’offre que deux options par étape — on choisit entre deux images', () => {
    for (const etape of etapesGuidage('mariage')) {
      expect(etape.options).toHaveLength(2)
    }
  })

  it('donne à chaque option des étiquettes exploitables', () => {
    for (const etape of etapesGuidage('mariage')) {
      for (const option of etape.options) {
        expect(option.tags.length).toBeGreaterThan(0)
      }
    }
  })

  it('donne un identifiant unique à chaque étape', () => {
    const ids = etapesGuidage('mariage').map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('tagsDepuisChoix', () => {
  it('rassemble les étiquettes des options choisies', () => {
    const etapes = etapesGuidage('mariage')
    const choix = { [etapes[0]!.id]: etapes[0]!.options[0]!.id }
    expect(tagsDepuisChoix('mariage', choix)).toEqual(
      expect.arrayContaining(etapes[0]!.options[0]!.tags),
    )
  })

  it('ignore un choix inconnu', () => {
    expect(tagsDepuisChoix('mariage', { inconnu: 'nimporte' })).toEqual([])
  })

  it('ne renvoie aucun doublon', () => {
    const etapes = etapesGuidage('mariage')
    const choix = Object.fromEntries(etapes.map((e) => [e.id, e.options[0]!.id]))
    const tags = tagsDepuisChoix('mariage', choix)
    expect(new Set(tags).size).toBe(tags.length)
  })
})

describe('scoreGabarit', () => {
  it('note zéro quand rien ne correspond', () => {
    expect(scoreGabarit(['moderne', 'sobre'], ['traditionnel'])).toBe(0)
  })

  it('note plus haut quand plus d’étiquettes correspondent', () => {
    const une = scoreGabarit(['moderne', 'sobre'], ['moderne'])
    const deux = scoreGabarit(['moderne', 'sobre'], ['moderne', 'sobre'])
    expect(deux).toBeGreaterThan(une)
  })

  it('ne pénalise pas un gabarit riche en étiquettes', () => {
    const maigre = scoreGabarit(['moderne'], ['moderne'])
    const riche = scoreGabarit(['moderne', 'sobre', 'doré'], ['moderne'])
    expect(riche).toBeGreaterThanOrEqual(maigre)
  })
})

describe('nommerStyle', () => {
  it('nomme le style à partir des étiquettes retenues', () => {
    expect(nommerStyle(['moderne', 'dore'])).toBe('Moderne & doré')
  })

  it('se contente d’une étiquette', () => {
    expect(nommerStyle(['traditionnel'])).toBe('Traditionnel')
  })

  it('ne retient que les deux plus parlantes', () => {
    expect(nommerStyle(['moderne', 'dore', 'sobre', 'floral']).split('&')).toHaveLength(2)
  })

  it('reste lisible quand rien n’est choisi', () => {
    expect(nommerStyle([])).toBe('Votre style')
  })
})

describe('libelleEtiquette', () => {
  it('traduit le jargon technique en mot du client', async () => {
    const { libelleEtiquette } = await import('../src/lib/guidage')
    expect(libelleEtiquette('dore')).toBe('Doré')
    expect(libelleEtiquette('ornemente')).toBe('Ornementé')
    expect(libelleEtiquette('enfantin')).toBe('Tendre')
  })

  it('laisse passer une étiquette inconnue plutôt que de l’effacer', async () => {
    const { libelleEtiquette } = await import('../src/lib/guidage')
    expect(libelleEtiquette('bazin')).toBe('bazin')
  })
})

import { describe, expect, it } from 'vitest'
import { compterParCeremonie, exporterCsv, resumeReponses } from '../src/lib/statistiques'

const ceremonies = [
  { id: 'c1', nom: 'Ngénte' },
  { id: 'c2', nom: 'Takk' },
  { id: 'c3', nom: 'Réception' },
]

const reponses = [
  { nom: 'Awa', telephone: '+221771111111', present: true, nbPersonnes: 2, ceremonieIds: ['c1', 'c3'], message: 'Avec joie', creeLe: new Date('2026-09-01T10:00:00Z') },
  { nom: 'Moussa', telephone: '+221772222222', present: true, nbPersonnes: 4, ceremonieIds: ['c3'], message: null, creeLe: new Date('2026-09-02T10:00:00Z') },
  { nom: 'Fatou', telephone: '+221773333333', present: false, nbPersonnes: 0, ceremonieIds: [], message: 'Désolée', creeLe: new Date('2026-09-03T10:00:00Z') },
]

describe('resumeReponses', () => {
  it('compte les présents et les absents', () => {
    const resume = resumeReponses(reponses)
    expect(resume.presents).toBe(2)
    expect(resume.absents).toBe(1)
  })

  it('additionne les personnes attendues, accompagnants compris', () => {
    expect(resumeReponses(reponses).personnes).toBe(6)
  })

  it('n’attend personne quand personne n’a répondu', () => {
    expect(resumeReponses([])).toEqual({ presents: 0, absents: 0, personnes: 0, reponses: 0 })
  })

  it('ne compte pas les absents dans les personnes attendues', () => {
    const resume = resumeReponses([reponses[2]!])
    expect(resume.personnes).toBe(0)
  })
})

describe('compterParCeremonie', () => {
  it('compte les personnes attendues à chaque cérémonie', () => {
    const compte = compterParCeremonie(reponses, ceremonies)
    expect(compte).toEqual([
      { id: 'c1', nom: 'Ngénte', personnes: 2, foyers: 1 },
      { id: 'c2', nom: 'Takk', personnes: 0, foyers: 0 },
      { id: 'c3', nom: 'Réception', personnes: 6, foyers: 2 },
    ])
  })

  it('garde l’ordre des cérémonies', () => {
    expect(compterParCeremonie(reponses, ceremonies).map((c) => c.id)).toEqual(['c1', 'c2', 'c3'])
  })

  it('ignore une cérémonie inconnue citée dans une réponse', () => {
    const intrus = [{ ...reponses[0]!, ceremonieIds: ['inconnue'] }]
    expect(compterParCeremonie(intrus, ceremonies).every((c) => c.personnes === 0)).toBe(true)
  })
})

describe('exporterCsv', () => {
  it('écrit une ligne d’en-tête puis une ligne par réponse', () => {
    const lignes = exporterCsv(reponses, ceremonies).trim().split('\n')
    expect(lignes).toHaveLength(4)
    expect(lignes[0]).toContain('Nom')
  })

  it('protège les virgules et les guillemets', () => {
    const piege = [{ ...reponses[0]!, nom: 'Awa "la grande", Diallo' }]
    expect(exporterCsv(piege, ceremonies)).toContain('"Awa ""la grande"", Diallo"')
  })

  it('neutralise une formule qui serait exécutée par un tableur', () => {
    const piege = [{ ...reponses[0]!, nom: '=1+1' }]
    expect(exporterCsv(piege, ceremonies)).toContain("'=1+1")
  })

  it('nomme les cérémonies plutôt que leurs identifiants', () => {
    expect(exporterCsv(reponses, ceremonies)).toContain('Ngénte')
  })
})

import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { analyserDocument, serialiserDocument } from '../src/dom'
import { vectoriserTextes } from '../src/gabarit/vectorisation'
import { chargerPolicesDepuisDossier } from '../src/rendu/polices'

const dossier = fileURLToPath(new URL('../demo/polices', import.meta.url))
const catalogue = await chargerPolicesDepuisDossier(dossier)

function doc(contenu: string): Document {
  return analyserDocument(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200">${contenu}</svg>`,
  )
}

describe('vectoriserTextes', () => {
  it('remplace le texte par un tracé', () => {
    const d = doc('<text x="10" y="100" font-family="Marcellus" font-size="40">Awa</text>')
    vectoriserTextes(d, catalogue)
    const sortie = serialiserDocument(d)
    expect(sortie).toContain('<path')
    expect(sortie).not.toContain('<text')
    expect(sortie).toMatch(/d="M[^"]{20,}"/)
  })

  it('donne des tracés différents pour deux polices différentes', () => {
    const marcellus = doc('<text x="0" y="100" font-family="Marcellus" font-size="40">Awa</text>')
    const vibes = doc('<text x="0" y="100" font-family="GreatVibes" font-size="40">Awa</text>')
    vectoriserTextes(marcellus, catalogue)
    vectoriserTextes(vibes, catalogue)
    expect(serialiserDocument(marcellus)).not.toBe(serialiserDocument(vibes))
  })

  it('reporte la couleur du texte sur le tracé', () => {
    const d = doc('<text x="0" y="100" font-family="Marcellus" font-size="40" fill="#2C3A80">Awa</text>')
    vectoriserTextes(d, catalogue)
    expect(serialiserDocument(d)).toContain('fill="#2C3A80"')
  })

  it('conserve l’identifiant de champ sur le tracé', () => {
    const d = doc('<text data-champ="nom_1" data-type="texte" x="0" y="100" font-family="Marcellus" font-size="40">Awa</text>')
    vectoriserTextes(d, catalogue)
    const sortie = serialiserDocument(d)
    expect(sortie).toContain('data-champ="nom_1"')
    expect(sortie).toContain('<path')
  })

  it('centre le tracé quand text-anchor vaut middle', () => {
    const centre = doc('<text x="400" y="100" text-anchor="middle" font-family="Marcellus" font-size="40">Awa</text>')
    const gauche = doc('<text x="400" y="100" font-family="Marcellus" font-size="40">Awa</text>')
    vectoriserTextes(centre, catalogue)
    vectoriserTextes(gauche, catalogue)
    // Le tracé centré commence plus à gauche que le tracé aligné à gauche.
    const abscisse = (svg: string) => Number(/d="M\s*(-?[\d.]+)/.exec(svg)?.[1] ?? 0)
    expect(abscisse(serialiserDocument(centre))).toBeLessThan(
      abscisse(serialiserDocument(gauche)),
    )
  })

  it('applique l’interlettrage', () => {
    const serre = doc('<text x="0" y="100" font-family="Marcellus" font-size="40">INVITATION</text>')
    const large = doc('<text x="0" y="100" font-family="Marcellus" font-size="40" letter-spacing="6">INVITATION</text>')
    vectoriserTextes(serre, catalogue)
    vectoriserTextes(large, catalogue)
    expect(serialiserDocument(large).length).toBeGreaterThan(serialiserDocument(serre).length - 200)
    expect(serialiserDocument(large)).not.toBe(serialiserDocument(serre))
  })

  it('signale une police absente et laisse le texte intact', () => {
    const d = doc('<text x="0" y="100" font-family="PoliceInconnue" font-size="40">Awa</text>')
    const resultat = vectoriserTextes(d, catalogue)
    expect(resultat.policesManquantes).toEqual(['PoliceInconnue'])
    expect(serialiserDocument(d)).toContain('<text')
  })

  it('ne signale rien quand toutes les polices sont présentes', () => {
    const d = doc('<text x="0" y="100" font-family="Marcellus" font-size="40">Awa</text>')
    expect(vectoriserTextes(d, catalogue).policesManquantes).toEqual([])
  })

  it('supprime un texte devenu vide', () => {
    const d = doc('<text x="0" y="100" font-family="Marcellus" font-size="40">   </text>')
    vectoriserTextes(d, catalogue)
    expect(serialiserDocument(d)).not.toContain('<text')
    expect(serialiserDocument(d)).not.toContain('<path')
  })

  it('accepte une famille entre guillemets', () => {
    const d = doc(`<text x="0" y="100" font-family="'Marcellus'" font-size="40">Awa</text>`)
    expect(vectoriserTextes(d, catalogue).policesManquantes).toEqual([])
  })
})

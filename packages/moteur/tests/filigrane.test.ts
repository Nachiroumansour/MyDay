import { describe, expect, it } from 'vitest'
import { analyserDocument, serialiserDocument } from '../src/dom'
import { apposerFiligrane } from '../src/gabarit/filigrane'

const gabarit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <text data-champ="nom_1" data-type="texte" data-cadre="0,0,600,60">Awa</text>
</svg>`

describe('apposerFiligrane', () => {
  it('ajoute la mention par défaut', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc)
    expect(serialiserDocument(doc)).toContain('MyDay')
  })

  it('accepte une mention personnalisée', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc, 'APERÇU')
    expect(serialiserDocument(doc)).toContain('APERÇU')
  })

  it('place le filigrane après le contenu, donc au-dessus', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc)
    const sortie = serialiserDocument(doc)
    expect(sortie.indexOf('data-filigrane')).toBeGreaterThan(sortie.indexOf('data-champ="nom_1"'))
  })

  it('couvre la surface avec plusieurs répétitions', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc)
    const sortie = serialiserDocument(doc)
    expect(sortie.split('MyDay').length - 1).toBeGreaterThan(3)
  })

  it('n’altère pas le contenu de la carte', () => {
    const doc = analyserDocument(gabarit)
    apposerFiligrane(doc)
    expect(serialiserDocument(doc)).toContain('>Awa<')
  })
})

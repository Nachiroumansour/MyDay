import { describe, expect, it } from 'vitest'
import { analyserDocument, serialiserDocument } from '../src/dom.js'
import { remplirTextes } from '../src/gabarit/remplissage.js'

function gabarit(): Document {
  return analyserDocument(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
    <text data-champ="nom_1" data-type="texte" data-cadre="0,0,600,60">Prénom</text>
    <text data-champ="lieu" data-type="texte" data-cadre="0,60,600,40"><tspan x="0">Lieu</tspan></text>
    <rect data-champ="zone_photo" data-type="image" x="0" y="100" width="100" height="100"/>
  </svg>`)
}

describe('remplirTextes', () => {
  it('écrit la valeur dans un élément texte simple', () => {
    const doc = gabarit()
    remplirTextes(doc, { nom_1: 'Awa' })
    expect(serialiserDocument(doc)).toContain('>Awa<')
    expect(serialiserDocument(doc)).not.toContain('>Prénom<')
  })

  it('écrit la valeur dans le tspan quand il y en a un, en gardant ses attributs', () => {
    const doc = gabarit()
    remplirTextes(doc, { lieu: 'Dakar' })
    const sortie = serialiserDocument(doc)
    expect(sortie).toContain('x="0"')
    expect(sortie).toContain('>Dakar<')
  })

  it('supprime l’élément d’un champ laissé vide', () => {
    const doc = gabarit()
    remplirTextes(doc, { nom_1: '', lieu: '   ' })
    const sortie = serialiserDocument(doc)
    expect(sortie).not.toContain('data-champ="nom_1"')
    expect(sortie).not.toContain('data-champ="lieu"')
  })

  it('laisse intact un champ absent des valeurs', () => {
    const doc = gabarit()
    remplirTextes(doc, {})
    expect(serialiserDocument(doc)).toContain('>Prénom<')
  })

  it('ne touche pas aux champs image', () => {
    const doc = gabarit()
    remplirTextes(doc, { zone_photo: 'https://exemple.test/photo.jpg' })
    expect(serialiserDocument(doc)).toContain('data-champ="zone_photo"')
  })

  it('échappe le contenu au lieu de l’interpréter comme du balisage', () => {
    const doc = gabarit()
    remplirTextes(doc, { nom_1: '<script>alerte()</script>' })
    const sortie = serialiserDocument(doc)
    expect(sortie).not.toContain('<script>')
    expect(sortie).toContain('&lt;script&gt;')
  })
})

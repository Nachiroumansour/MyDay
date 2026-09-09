import { describe, expect, it } from 'vitest'
import { analyserDocument } from '../src/dom'
import { verifierDepot } from '../src/gabarit/verification'

function gabarit(interieur: string, racine = 'data-largeur-mm="127" data-hauteur-mm="190.5"'): Document {
  return analyserDocument(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 600 900" ${racine}>${interieur}</svg>`,
  )
}

const CORRECT = '<text data-champ="nom_1" data-type="texte" data-cadre="0,0,600,80">Awa</text>'

describe('verifierDepot', () => {
  it('accepte un gabarit conforme', () => {
    expect(verifierDepot(gabarit(CORRECT))).toEqual([])
  })

  it('refuse une image intégrée', () => {
    const reproches = verifierDepot(gabarit(`${CORRECT}<image href="data:image/png;base64,AAAA"/>`))
    expect(reproches).toHaveLength(1)
    expect(reproches[0]).toContain('image')
    expect(reproches[0]).toContain('zone_photo')
  })

  it('compte les images plutôt que de n’en signaler qu’une', () => {
    const reproches = verifierDepot(
      gabarit(`<image href="data:a"/><image href="data:b"/><image href="data:c"/>`),
    )
    expect(reproches[0]).toContain('3 images intégrées')
  })

  it('refuse du script', () => {
    expect(verifierDepot(gabarit(`${CORRECT}<script>alert(1)</script>`))[0]).toContain('script')
  })

  it('refuse ce que le rendu ignore', () => {
    expect(verifierDepot(gabarit(`${CORRECT}<foreignObject><p>Bonjour</p></foreignObject>`))[0]).toContain(
      'foreignObject',
    )
    expect(verifierDepot(gabarit(`${CORRECT}<animate attributeName="x"/>`))[0]).toContain('animate')
  })

  it('refuse une référence vers l’extérieur', () => {
    const reproches = verifierDepot(gabarit(`${CORRECT}<use xlink:href="https://ailleurs.test/x.svg"/>`))
    expect(reproches[0]).toContain('ailleurs.test')
  })

  it('laisse passer une référence interne', () => {
    expect(verifierDepot(gabarit(`${CORRECT}<use href="#rose"/>`))).toEqual([])
  })

  it('exige les dimensions physiques', () => {
    expect(verifierDepot(gabarit(CORRECT, ''))[0]).toContain('data-largeur-mm')
  })

  it('refuse des dimensions physiques absurdes', () => {
    const reproches = verifierDepot(gabarit(CORRECT, 'data-largeur-mm="0" data-hauteur-mm="-3"'))
    expect(reproches[0]).toContain('nombres positifs')
  })

  it('accumule les reproches plutôt que de s’arrêter au premier', () => {
    expect(verifierDepot(gabarit('<image href="data:a"/><script/>', ''))).toHaveLength(3)
  })
})

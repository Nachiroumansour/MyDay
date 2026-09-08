import { describe, expect, it } from 'vitest'
import { analyserDocument } from '../src/dom'
import { analyserGabarit, ErreurGabarit } from '../src/gabarit/analyse'

const gabarit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <text data-champ="nom_1" data-type="texte" data-cadre="60,200,480,70"
        data-max-longueur="24" font-family="Marcellus" font-size="54">Prénom</text>
  <text data-champ="texte_intro" data-type="texte_long" data-cadre="60,300,480,120"
        font-family="Marcellus" font-size="20">Intro</text>
  <rect data-champ="zone_photo" data-type="image" x="150" y="480" width="300" height="300"/>
</svg>`

describe('analyserGabarit', () => {
  it('découvre les champs et leur cadre', () => {
    const champs = analyserGabarit(analyserDocument(gabarit))
    expect(champs.map((c) => c.id)).toEqual(['nom_1', 'texte_intro', 'zone_photo'])
  })

  it('lit le cadre déclaré', () => {
    const [premier] = analyserGabarit(analyserDocument(gabarit))
    expect(premier?.cadre).toEqual({ x: 60, y: 200, largeur: 480, hauteur: 70 })
  })

  it('déduit le cadre d’un rectangle de sa géométrie', () => {
    const champs = analyserGabarit(analyserDocument(gabarit))
    const photo = champs.find((c) => c.id === 'zone_photo')
    expect(photo?.cadre).toEqual({ x: 150, y: 480, largeur: 300, hauteur: 300 })
  })

  it('retient la police et la taille nominale du texte', () => {
    const [premier] = analyserGabarit(analyserDocument(gabarit))
    expect(premier?.police).toBe('Marcellus')
    expect(premier?.tailleNominale).toBe(54)
  })

  it('retient la longueur maximale quand elle est déclarée', () => {
    const [premier] = analyserGabarit(analyserDocument(gabarit))
    expect(premier?.maxLongueur).toBe(24)
  })

  it('refuse un champ sans type', () => {
    const fautif = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <text data-champ="nom_1" data-cadre="0,0,10,10">x</text></svg>`
    expect(() => analyserGabarit(analyserDocument(fautif))).toThrow(ErreurGabarit)
  })

  it('refuse deux champs portant le même identifiant', () => {
    const fautif = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <text data-champ="a" data-type="texte" data-cadre="0,0,5,5">x</text>
      <text data-champ="a" data-type="texte" data-cadre="0,5,5,5">y</text></svg>`
    expect(() => analyserGabarit(analyserDocument(fautif))).toThrow(/deux fois/)
  })

  it('refuse un champ texte sans cadre', () => {
    const fautif = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <text data-champ="a" data-type="texte">x</text></svg>`
    expect(() => analyserGabarit(analyserDocument(fautif))).toThrow(/cadre/)
  })
})

import { describe, expect, it } from 'vitest'
import { analyserDocument } from '../src/dom.js'
import { dimensionsPhysiques, pixelsPourDpi, rendrePng, DPI_LIVRAISON } from '../src/rendu/png.js'


const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"
     data-largeur-mm="127" data-hauteur-mm="190.5">
  <rect width="600" height="900" fill="#F7F8FA"/>
  <text x="300" y="450" text-anchor="middle" font-family="Marcellus" font-size="60"
        fill="#2C3A80">Awa</text>
</svg>`

/** Lit la largeur et la hauteur dans le bloc IHDR d'un PNG. */
function tailleDuPng(donnees: Uint8Array): { largeur: number; hauteur: number } {
  const vue = new DataView(donnees.buffer, donnees.byteOffset, donnees.byteLength)
  return { largeur: vue.getUint32(16), hauteur: vue.getUint32(20) }
}

describe('dimensionsPhysiques', () => {
  it('lit la taille déclarée par le gabarit', () => {
    expect(dimensionsPhysiques(analyserDocument(svg))).toEqual({
      largeurMm: 127,
      hauteurMm: 190.5,
    })
  })

  it('retombe sur le format carte par défaut quand rien n’est déclaré', () => {
    const nu = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"/>`
    expect(dimensionsPhysiques(analyserDocument(nu)).largeurMm).toBe(127)
  })
})

describe('pixelsPourDpi', () => {
  it('convertit 127 mm en 1500 px à 300 dpi', () => {
    expect(pixelsPourDpi(127, DPI_LIVRAISON)).toBe(1500)
  })

  it('arrondit au pixel entier', () => {
    expect(Number.isInteger(pixelsPourDpi(190.5, DPI_LIVRAISON))).toBe(true)
  })
})

describe('rendrePng', () => {
  it('produit un PNG valide à la largeur demandée', async () => {
    const png = await rendrePng(svg, {
      largeurPx: 1500,
    })

    // Signature PNG.
    expect([...png.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47])
    expect(tailleDuPng(png).largeur).toBe(1500)
    expect(tailleDuPng(png).hauteur).toBe(2250)
  }, 20_000)

  it('rend un fichier plus lourd qu’une image vide', async () => {
    const png = await rendrePng(svg, {
      largeurPx: 600,
    })
    expect(png.byteLength).toBeGreaterThan(1000)
  }, 20_000)
})

describe('non-régression', () => {
  it('respecte la largeur demandée malgré des polices passées en mémoire', async () => {
    // resvg-js 2.6.2 ignore `fitTo` quand on lui donne des `fontBuffers` :
    // ce test verrouille la parade.
    const png = await rendrePng(svg, {
      largeurPx: 900,
    })
    expect(tailleDuPng(png)).toEqual({ largeur: 900, hauteur: 1350 })
  }, 20_000)

})

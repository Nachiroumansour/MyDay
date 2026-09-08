import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { rendrePng } from '../src/rendu/png'
import { rendrePdf } from '../src/rendu/pdf'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <rect width="600" height="900" fill="#FFFFFF"/>
  <circle cx="300" cy="450" r="200" fill="#2C3A80"/>
</svg>`

const pngDeTest = () => rendrePng(svg, { largeurPx: 600 })

describe('rendrePdf', () => {
  it('produit un fichier PDF', async () => {
    const pdf = await rendrePdf(await pngDeTest(), { largeurMm: 127, hauteurMm: 190.5 })
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe('%PDF-')
  }, 20_000)

  it('crée une page unique à la taille physique du gabarit', async () => {
    const pdf = await rendrePdf(await pngDeTest(), { largeurMm: 127, hauteurMm: 190.5 })
    const document = await PDFDocument.load(pdf)
    expect(document.getPageCount()).toBe(1)

    const page = document.getPage(0)
    // 1 mm = 72 / 25,4 points.
    expect(page.getWidth()).toBeCloseTo((127 * 72) / 25.4, 1)
    expect(page.getHeight()).toBeCloseTo((190.5 * 72) / 25.4, 1)
  }, 20_000)

  it('refuse des données qui ne sont pas un PNG', async () => {
    await expect(
      rendrePdf(new Uint8Array([1, 2, 3, 4]), { largeurMm: 127, hauteurMm: 190.5 }),
    ).rejects.toThrow()
  })
})

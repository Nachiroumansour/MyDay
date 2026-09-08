import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { dimensionsImage, typeImage } from '../src/lib/image'

const racine = fileURLToPath(new URL('..', import.meta.url))

describe('typeImage', () => {
  it('reconnaît un PNG à sa signature', async () => {
    const png = await readFile(`${racine}captures/apercu-partage.png`)
    expect(typeImage(new Uint8Array(png))).toBe('image/png')
  })

  it('refuse ce qui n’est pas une image', () => {
    expect(typeImage(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toBeUndefined()
  })

  it('refuse un fichier trop court pour être lu', () => {
    expect(typeImage(new Uint8Array([0x89]))).toBeUndefined()
  })
})

describe('dimensionsImage', () => {
  it('lit la taille d’un PNG', async () => {
    const png = await readFile(`${racine}captures/apercu-partage.png`)
    expect(dimensionsImage(new Uint8Array(png))).toEqual({ largeur: 1200, hauteur: 630 })
  })

  it('lit la taille d’un JPEG', () => {
    // Un JPEG minimal : SOI, puis un segment SOF0 déclarant 480 × 640.
    const jpeg = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xc0, 0x00, 0x11, 0x08,
      0x02, 0x80, // hauteur 640
      0x01, 0xe0, // largeur 480
      0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    ])
    expect(dimensionsImage(jpeg)).toEqual({ largeur: 480, hauteur: 640 })
  })

  it('renvoie undefined pour un format inconnu', () => {
    expect(dimensionsImage(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toBeUndefined()
  })
})

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CataloguePolices, chargerPolicesDepuisDossier } from '../src/rendu/polices'

const dossier = fileURLToPath(new URL('../demo/polices', import.meta.url))

describe('CataloguePolices', () => {
  it('mesure une chaîne plus large qu’une chaîne plus courte', async () => {
    const fichier = await readFile(`${dossier}/Marcellus.ttf`)
    const catalogue = new CataloguePolices()
    catalogue.ajouter(
      'Marcellus',
      fichier.buffer.slice(fichier.byteOffset, fichier.byteOffset + fichier.byteLength) as ArrayBuffer,
    )

    const police = catalogue.obtenir('Marcellus')
    expect(police).toBeDefined()
    expect(police!.mesurer('Awa & Moussa', 54)).toBeGreaterThan(police!.mesurer('Awa', 54))
  })

  it('mesure proportionnellement à la taille', async () => {
    const catalogue = await chargerPolicesDepuisDossier(dossier)
    const police = catalogue.obtenir('Marcellus')!
    const petite = police.mesurer('Dakar', 20)
    const grande = police.mesurer('Dakar', 40)
    expect(grande / petite).toBeCloseTo(2, 1)
  })

  it('rend une chaîne vide de largeur nulle', async () => {
    const catalogue = await chargerPolicesDepuisDossier(dossier)
    expect(catalogue.obtenir('Marcellus')!.mesurer('', 40)).toBe(0)
  })

  it('charge toutes les polices d’un dossier, nommées d’après le fichier', async () => {
    const catalogue = await chargerPolicesDepuisDossier(dossier)
    expect(catalogue.noms()).toEqual(
      expect.arrayContaining(['Marcellus', 'CormorantGaramond', 'GreatVibes']),
    )
  })

  it('renvoie undefined pour une police absente', async () => {
    const catalogue = await chargerPolicesDepuisDossier(dossier)
    expect(catalogue.obtenir('PoliceInexistante')).toBeUndefined()
  })
})

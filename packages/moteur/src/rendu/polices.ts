import { readdir, readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import opentype from 'opentype.js'

export interface PoliceChargee {
  nom: string
  /** Largeur du texte en unités du viewBox, pour une taille de police donnée. */
  mesurer(texte: string, taille: number): number
}

export class CataloguePolices {
  private readonly polices = new Map<string, PoliceChargee>()

  ajouter(nom: string, contenu: ArrayBuffer): void {
    const police = opentype.parse(contenu)
    this.polices.set(nom, {
      nom,
      mesurer(texte, taille) {
        if (texte === '') return 0
        return police.getAdvanceWidth(texte, taille)
      },
    })
  }

  obtenir(nom: string): PoliceChargee | undefined {
    return this.polices.get(nom)
  }

  noms(): string[] {
    return [...this.polices.keys()]
  }
}

const EXTENSIONS = new Set(['.ttf', '.otf'])

/** Charge toutes les polices d'un dossier. Le nom retenu est celui du fichier. */
export async function chargerPolicesDepuisDossier(dossier: string): Promise<CataloguePolices> {
  const catalogue = new CataloguePolices()
  for (const fichier of await readdir(dossier)) {
    if (!EXTENSIONS.has(extname(fichier).toLowerCase())) continue
    const contenu = await readFile(join(dossier, fichier))
    catalogue.ajouter(
      basename(fichier, extname(fichier)),
      contenu.buffer.slice(
        contenu.byteOffset,
        contenu.byteOffset + contenu.byteLength,
      ) as ArrayBuffer,
    )
  }
  return catalogue
}

import { Resvg } from '@resvg/resvg-js'
import { analyserDocument, serialiserDocument } from '../dom.js'

/** Résolution d'impression exigée par la spec (critère d'acceptation 7). */
export const DPI_LIVRAISON = 300

/** Format d'une carte d'invitation courante : 127 × 190,5 mm (5 × 7,5 pouces). */
const LARGEUR_PAR_DEFAUT_MM = 127
const HAUTEUR_PAR_DEFAUT_MM = 190.5

export interface DimensionsPhysiques {
  largeurMm: number
  hauteurMm: number
}

function nombre(valeur: string | null | undefined): number | undefined {
  if (!valeur) return undefined
  const converti = Number(valeur)
  return Number.isFinite(converti) && converti > 0 ? converti : undefined
}

export function dimensionsPhysiques(doc: Document): DimensionsPhysiques {
  const racine = doc.documentElement
  return {
    largeurMm: nombre(racine?.getAttribute('data-largeur-mm')) ?? LARGEUR_PAR_DEFAUT_MM,
    hauteurMm: nombre(racine?.getAttribute('data-hauteur-mm')) ?? HAUTEUR_PAR_DEFAUT_MM,
  }
}

export function pixelsPourDpi(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi)
}

/** Proportions du dessin, lues dans le viewBox ou à défaut dans width/height. */
export function proportions(doc: Document): { largeur: number; hauteur: number } {
  const racine = doc.documentElement
  const viewBox = racine?.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every(Number.isFinite) && parts[2]! > 0 && parts[3]! > 0) {
      return { largeur: parts[2]!, hauteur: parts[3]! }
    }
  }
  return {
    largeur: nombre(racine?.getAttribute('width')) ?? 600,
    hauteur: nombre(racine?.getAttribute('height')) ?? 900,
  }
}

/**
 * Écrit la taille de rendu voulue sur la balise racine.
 *
 * resvg-js 2.6.2 ignore silencieusement son option `fitTo` dès qu'on lui passe
 * des `fontBuffers` — vérifié : `fitTo` seul donne 1500 px, `fitTo` + `fontBuffers`
 * retombe à la taille du viewBox. Comme les polices doivent voyager en mémoire
 * (aucun disque garanti en production), on dimensionne le document nous-mêmes :
 * le viewBox se charge alors de la mise à l'échelle, et le résultat ne dépend
 * plus du comportement de la librairie.
 */
export function dimensionnerRacine(svg: string, largeurPx: number): string {
  const doc = analyserDocument(svg)
  const { largeur, hauteur } = proportions(doc)
  const hauteurPx = Math.round(largeurPx * (hauteur / largeur))

  doc.documentElement?.setAttribute('width', String(largeurPx))
  doc.documentElement?.setAttribute('height', String(hauteurPx))

  return serialiserDocument(doc)
}

export interface OptionsPng {
  largeurPx: number
}

/**
 * Rend le document en PNG.
 *
 * Aucune police n'est passée à resvg : ses options de police sont inopérantes
 * (`fontBuffers` ignoré, `loadSystemFonts: false` non honoré en 2.6.2). Le texte
 * doit donc être vectorisé en amont — voir `vectoriserTextes`. Tout `<text>`
 * restant serait rendu avec une police système, ou pas rendu du tout sur un
 * serveur nu.
 */
export async function rendrePng(svg: string, options: OptionsPng): Promise<Uint8Array> {
  const rendu = new Resvg(dimensionnerRacine(svg, options.largeurPx))
  return new Uint8Array(rendu.render().asPng())
}

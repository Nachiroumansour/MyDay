import { PDFDocument } from 'pdf-lib'
import type { DimensionsPhysiques } from './png'

const POINTS_PAR_MM = 72 / 25.4

/**
 * Encapsule le PNG haute résolution dans un PDF d'une page, à la taille
 * physique réelle du gabarit. Le PDF contient exactement l'image de l'aperçu,
 * ce qui rend toute divergence impossible.
 */
export async function rendrePdf(
  png: Uint8Array,
  dimensions: DimensionsPhysiques,
): Promise<Uint8Array> {
  const document = await PDFDocument.create()
  const image = await document.embedPng(png)

  const largeur = dimensions.largeurMm * POINTS_PAR_MM
  const hauteur = dimensions.hauteurMm * POINTS_PAR_MM

  const page = document.addPage([largeur, hauteur])
  page.drawImage(image, { x: 0, y: 0, width: largeur, height: hauteur })

  return document.save()
}

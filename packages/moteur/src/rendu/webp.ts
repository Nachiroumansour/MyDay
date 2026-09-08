import sharp from 'sharp'
import { rendrePng } from './png'

/**
 * Rend le document en WebP.
 *
 * Les cartes ornées — roses, feuillage, filets d'or — sont faites de milliers
 * de petites formes antialiasées, et le PNG ne sait pas les compresser : la
 * même carte pèse 465 Ko en PNG et 65 Ko en WebP à 900 pixels de large. Sur
 * la page que tous les invités ouvrent, souvent en 3G, l'écart décide.
 *
 * Le PNG reste de mise là où le destinataire n'est pas un navigateur : les
 * aperçus de partage, que certains robots sociaux lisent mal en WebP, et les
 * fichiers haute définition livrés au client, qui ne doivent rien perdre.
 */
export interface OptionsWebp {
  largeurPx: number
  /** De 1 à 100. 82 tient la calligraphie sans faire gonfler le fichier. */
  qualite?: number
}

export const QUALITE_PAR_DEFAUT = 82

export async function rendreWebp(svg: string, options: OptionsWebp): Promise<Uint8Array> {
  const png = await rendrePng(svg, { largeurPx: options.largeurPx })
  const webp = await sharp(Buffer.from(png))
    .webp({ quality: options.qualite ?? QUALITE_PAR_DEFAUT })
    .toBuffer()
  return new Uint8Array(webp)
}

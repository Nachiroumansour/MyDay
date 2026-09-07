export * from './types.js'
export { analyserDocument, serialiserDocument } from './dom.js'
export { analyserGabarit, ErreurGabarit } from './gabarit/analyse.js'

export function versionMoteur(): string {
  return '1.0.0'
}
export { remplirTextes } from './gabarit/remplissage.js'
export { ajusterAuCadre, ajusterDocument, PLANCHER_ECHELLE } from './gabarit/ajustement.js'
export { CataloguePolices, chargerPolicesDepuisDossier } from './rendu/polices.js'
export type { PoliceChargee } from './rendu/polices.js'
export { calculerPlacement, insererPhoto } from './gabarit/photo.js'
export type { Photo } from './gabarit/photo.js'
export { apposerFiligrane } from './gabarit/filigrane.js'
export { dimensionnerRacine, dimensionsPhysiques, pixelsPourDpi, proportions, rendrePng, DPI_LIVRAISON } from './rendu/png.js'
export type { DimensionsPhysiques, OptionsPng } from './rendu/png.js'
export { vectoriserTextes } from './gabarit/vectorisation.js'
export type { ResultatVectorisation } from './gabarit/vectorisation.js'

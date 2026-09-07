import { analyserDocument, serialiserDocument } from './dom.js'
import { ajusterDocument } from './gabarit/ajustement.js'
import { analyserGabarit } from './gabarit/analyse.js'
import { apposerFiligrane } from './gabarit/filigrane.js'
import { insererPhoto, retirerZonePhoto, type Photo } from './gabarit/photo.js'
import { remplirTextes } from './gabarit/remplissage.js'
import { vectoriserTextes } from './gabarit/vectorisation.js'
import { dimensionsPhysiques, type DimensionsPhysiques } from './rendu/png.js'
import type { CataloguePolices } from './rendu/polices.js'
import type { ChampGabarit, ValeursChamps } from './types.js'

export interface DemandeComposition {
  gabaritSvg: string
  valeurs: ValeursChamps
  photo?: Photo
  polices: CataloguePolices
  /** Vrai tant que le client n'a pas payé. */
  filigrane?: boolean
  mentionFiligrane?: string
}

export interface CarteComposee {
  svg: string
  champs: ChampGabarit[]
  /** Identifiants des champs dont le texte déborde malgré la réduction. */
  debordements: string[]
  /** Polices que le gabarit réclame et que le catalogue n'a pas. */
  policesManquantes: string[]
  dimensions: DimensionsPhysiques
}

/**
 * Assemble une carte à partir d'un gabarit et des valeurs du client.
 *
 * L'ordre compte. On découvre les champs sur le document intact, puis on
 * remplit, puis on ajuste — l'ajustement mesure le texte réellement écrit. Le
 * filigrane s'appose avant la vectorisation pour être vectorisé lui aussi :
 * laissé en `<text>`, il risquerait de ne pas être dessiné au rendu, et un
 * aperçu sans filigrane est une fuite du catalogue.
 */
export function composerCarte(demande: DemandeComposition): CarteComposee {
  const doc = analyserDocument(demande.gabaritSvg)
  const champs = analyserGabarit(doc)
  const dimensions = dimensionsPhysiques(doc)

  remplirTextes(doc, demande.valeurs)
  const debordements = ajusterDocument(doc, champs, demande.polices)

  if (demande.filigrane) {
    const policeFiligrane = demande.polices.noms()[0] ?? 'sans-serif'
    apposerFiligrane(doc, demande.mentionFiligrane, policeFiligrane)
  }

  const { policesManquantes } = vectoriserTextes(doc, demande.polices)

  for (const zone of champs.filter((c) => c.type === 'image')) {
    if (demande.photo) insererPhoto(doc, zone.id, demande.photo)
    else retirerZonePhoto(doc, zone.id)
  }

  return {
    svg: serialiserDocument(doc),
    champs,
    debordements,
    policesManquantes,
    dimensions,
  }
}

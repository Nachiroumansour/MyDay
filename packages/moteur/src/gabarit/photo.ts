import { elementsDeChamp } from '../dom.js'
import type { Cadre, Recadrage } from '../types.js'
import { RECADRAGE_NEUTRE } from '../types.js'

const NS_SVG = 'http://www.w3.org/2000/svg'
const NS_XLINK = 'http://www.w3.org/1999/xlink'

export interface Photo {
  /** URL ou data-URI de la photo. */
  source: string
  largeur: number
  hauteur: number
  recadrage?: Recadrage
}

function borner(valeur: number, minimum: number, maximum: number): number {
  if (minimum > maximum) return minimum
  return Math.min(Math.max(valeur, minimum), maximum)
}

/**
 * Place la photo de façon à couvrir tout le cadre sans déformation.
 * Le point focal indique quelle partie de la photo doit rester visible ; le
 * résultat est borné pour qu'aucun vide n'apparaisse jamais dans le cadre.
 */
export function calculerPlacement(
  cadre: Cadre,
  photo: { largeur: number; hauteur: number },
  recadrage: Recadrage,
): Cadre {
  const zoom = Math.max(1, recadrage.zoom)
  const echelle = Math.max(cadre.largeur / photo.largeur, cadre.hauteur / photo.hauteur) * zoom

  const largeur = photo.largeur * echelle
  const hauteur = photo.hauteur * echelle

  // On place le point focal de la photo au centre du cadre, puis on ramène
  // l'image dans les limites qui garantissent une couverture complète.
  const xVoulu = cadre.x + cadre.largeur / 2 - largeur * borner(recadrage.focaleX, 0, 1)
  const yVoulu = cadre.y + cadre.hauteur / 2 - hauteur * borner(recadrage.focaleY, 0, 1)

  return {
    x: borner(xVoulu, cadre.x + cadre.largeur - largeur, cadre.x),
    y: borner(yVoulu, cadre.y + cadre.hauteur - hauteur, cadre.y),
    largeur,
    hauteur,
  }
}

export function insererPhoto(doc: Document, idChamp: string, photo: Photo): void {
  const zone = elementsDeChamp(doc).find((e) => e.getAttribute('data-champ') === idChamp)
  if (!zone || zone.getAttribute('data-type') !== 'image') return

  const cadre: Cadre = {
    x: Number(zone.getAttribute('x') ?? 0),
    y: Number(zone.getAttribute('y') ?? 0),
    largeur: Number(zone.getAttribute('width') ?? 0),
    hauteur: Number(zone.getAttribute('height') ?? 0),
  }

  const place = calculerPlacement(cadre, photo, photo.recadrage ?? RECADRAGE_NEUTRE)
  const idDetourage = `detourage-${idChamp}`

  const detourage = doc.createElementNS(NS_SVG, 'clipPath')
  detourage.setAttribute('id', idDetourage)
  const rectangle = doc.createElementNS(NS_SVG, 'rect')
  rectangle.setAttribute('x', String(cadre.x))
  rectangle.setAttribute('y', String(cadre.y))
  rectangle.setAttribute('width', String(cadre.largeur))
  rectangle.setAttribute('height', String(cadre.hauteur))
  detourage.appendChild(rectangle)

  const image = doc.createElementNS(NS_SVG, 'image')
  image.setAttribute('x', String(place.x))
  image.setAttribute('y', String(place.y))
  image.setAttribute('width', String(place.largeur))
  image.setAttribute('height', String(place.hauteur))
  image.setAttribute('clip-path', `url(#${idDetourage})`)
  image.setAttribute('preserveAspectRatio', 'none')
  image.setAttribute('href', photo.source)
  // resvg ne lit encore que la forme xlink : on écrit les deux.
  image.setAttributeNS(NS_XLINK, 'xlink:href', photo.source)

  const groupe = doc.createElementNS(NS_SVG, 'g')
  groupe.setAttribute('data-champ-rendu', idChamp)
  groupe.appendChild(detourage)
  groupe.appendChild(image)

  zone.parentNode?.replaceChild(groupe, zone)
}

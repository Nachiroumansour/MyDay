/**
 * Lecture des en-têtes d'image, sans dépendance native.
 *
 * Le moteur a besoin des proportions de la photo pour la recadrer en
 * couverture. On les lit dans l'en-tête plutôt que de faire confiance au
 * navigateur, qui peut mentir.
 */
export type TypeImage = 'image/png' | 'image/jpeg' | 'image/webp'

export interface DimensionsImage {
  largeur: number
  hauteur: number
}

function estPng(o: Uint8Array): boolean {
  return o.length > 24 && o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4e && o[3] === 0x47
}

function estJpeg(o: Uint8Array): boolean {
  return o.length > 4 && o[0] === 0xff && o[1] === 0xd8
}

function estWebp(o: Uint8Array): boolean {
  return (
    o.length > 30 &&
    o[0] === 0x52 && o[1] === 0x49 && o[2] === 0x46 && o[3] === 0x46 &&
    o[8] === 0x57 && o[9] === 0x45 && o[10] === 0x42 && o[11] === 0x50
  )
}

export function typeImage(octets: Uint8Array): TypeImage | undefined {
  if (estPng(octets)) return 'image/png'
  if (estWebp(octets)) return 'image/webp'
  if (estJpeg(octets)) return 'image/jpeg'
  return undefined
}

function dimensionsPng(o: Uint8Array): DimensionsImage {
  const vue = new DataView(o.buffer, o.byteOffset, o.byteLength)
  return { largeur: vue.getUint32(16), hauteur: vue.getUint32(20) }
}

/** Parcourt les segments jusqu'au marqueur SOF, qui porte les dimensions. */
function dimensionsJpeg(o: Uint8Array): DimensionsImage | undefined {
  const vue = new DataView(o.buffer, o.byteOffset, o.byteLength)
  let position = 2

  while (position + 9 < o.length) {
    if (o[position] !== 0xff) {
      position += 1
      continue
    }
    const marqueur = o[position + 1]!
    // SOF0 à SOF15, en excluant DHT (c4), JPG (c8) et DAC (cc).
    if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
      return { hauteur: vue.getUint16(position + 5), largeur: vue.getUint16(position + 7) }
    }
    position += 2 + vue.getUint16(position + 2)
  }
  return undefined
}

function dimensionsWebp(o: Uint8Array): DimensionsImage | undefined {
  const vue = new DataView(o.buffer, o.byteOffset, o.byteLength)
  const format = String.fromCharCode(o[12]!, o[13]!, o[14]!, o[15]!)

  if (format === 'VP8X') {
    return {
      largeur: 1 + (o[24]! | (o[25]! << 8) | (o[26]! << 16)),
      hauteur: 1 + (o[27]! | (o[28]! << 8) | (o[29]! << 16)),
    }
  }
  if (format === 'VP8 ') {
    return {
      largeur: vue.getUint16(26, true) & 0x3fff,
      hauteur: vue.getUint16(28, true) & 0x3fff,
    }
  }
  if (format === 'VP8L') {
    const bits = vue.getUint32(21, true)
    return { largeur: 1 + (bits & 0x3fff), hauteur: 1 + ((bits >> 14) & 0x3fff) }
  }
  return undefined
}

export function dimensionsImage(octets: Uint8Array): DimensionsImage | undefined {
  const type = typeImage(octets)
  if (type === 'image/png') return dimensionsPng(octets)
  if (type === 'image/jpeg') return dimensionsJpeg(octets)
  if (type === 'image/webp') return dimensionsWebp(octets)
  return undefined
}

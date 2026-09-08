import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { dimensionsImage, typeImage, type DimensionsImage } from '@/lib/image'

/**
 * Stockage des médias déposés par les clients.
 *
 * Sur disque en développement. L'interface reste étroite — enregistrer, lire —
 * pour qu'un stockage objet (Cloudinary, S3) se substitue sans toucher au reste.
 */
const DOSSIER = process.env.DOSSIER_MEDIAS ?? join(process.cwd(), '.donnees', 'medias')

export const TAILLE_MAX = 8 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export interface MediaEnregistre {
  id: string
  url: string
  type: string
  dimensions: DimensionsImage
}

export class ErreurMedia extends Error {}

export async function enregistrerMedia(octets: Uint8Array): Promise<MediaEnregistre> {
  if (octets.byteLength > TAILLE_MAX) {
    throw new ErreurMedia('Votre photo dépasse 8 Mo. Choisissez-en une plus légère.')
  }

  const type = typeImage(octets)
  if (!type) {
    throw new ErreurMedia('Ce fichier n’est pas une image. Choisissez un JPEG, un PNG ou un WebP.')
  }

  const dimensions = dimensionsImage(octets)
  if (!dimensions) {
    throw new ErreurMedia('Cette image est illisible. Essayez-en une autre.')
  }

  const id = `${crypto.randomUUID()}.${EXTENSIONS[type]}`
  await mkdir(DOSSIER, { recursive: true })
  await writeFile(join(DOSSIER, id), octets)

  return { id, url: `/media/${id}`, type, dimensions }
}

export async function lireMedia(id: string): Promise<{ octets: Uint8Array; type: string } | undefined> {
  // Aucun chemin ne doit pouvoir sortir du dossier des médias.
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(id)) return undefined
  try {
    const octets = new Uint8Array(await readFile(join(DOSSIER, id)))
    return { octets, type: typeImage(octets) ?? 'application/octet-stream' }
  } catch {
    return undefined
  }
}

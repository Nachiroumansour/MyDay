import { composerCarte, rendrePng } from '@myday/moteur'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { largeurAdmise } from '@/serveur/carte'
import { lireMedia } from '@/serveur/stockage'
import { polices } from '@/serveur/polices'
import { dimensionsImage } from '@/lib/image'

/** L'aperçu suit chaque frappe : il ne se met jamais en cache. */
export const dynamic = 'force-dynamic'

export async function GET(
  requete: Request,
  { params }: { params: Promise<{ secret: string }> },
) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return new Response('Introuvable', { status: 404 })

  // La photo est intégrée en data-URI : resvg ne va pas chercher les URL.
  let photo
  if (brouillon.photoUrl) {
    const media = await lireMedia(brouillon.photoUrl.replace('/media/', ''))
    const dimensions = media && dimensionsImage(media.octets)
    if (media && dimensions) {
      photo = {
        source: `data:${media.type};base64,${Buffer.from(media.octets).toString('base64')}`,
        largeur: dimensions.largeur,
        hauteur: dimensions.hauteur,
        ...(brouillon.recadrage ? { recadrage: brouillon.recadrage } : {}),
      }
    }
  }

  const carte = composerCarte({
    gabaritSvg: brouillon.gabarit.sourceSvg,
    valeurs: brouillon.valeursChamps,
    polices: await polices(),
    // Tant que le client n'a pas payé, rien de vendable ne sort d'ici.
    filigrane: brouillon.statut !== 'publie',
    ...(photo ? { photo } : {}),
  })

  const png = await rendrePng(carte.svg, {
    largeurPx: largeurAdmise(new URL(requete.url).searchParams.get('l')),
  })

  return new Response(png as BodyInit, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
  })
}

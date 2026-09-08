import { lireMedia } from '@/serveur/stockage'

export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const media = await lireMedia(id)
  if (!media) return new Response('Introuvable', { status: 404 })

  return new Response(media.octets as BodyInit, {
    headers: {
      'Content-Type': media.type,
      // Le nom du fichier contient un identifiant unique : son contenu ne
      // change jamais.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

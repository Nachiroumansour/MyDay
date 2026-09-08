import { evenementPublie } from '@/serveur/bdd/evenements'
import { largeurAdmise, rendreCarte } from '@/serveur/carte'

/** Une carte publiée ne change plus : on la garde longtemps en cache. */
export const revalidate = 86400

export async function GET(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const evenement = await evenementPublie(slug)
  if (!evenement) return new Response('Introuvable', { status: 404 })

  const largeur = largeurAdmise(new URL(requete.url).searchParams.get('l'))
  const png = await rendreCarte(evenement, { largeurPx: largeur, filigrane: false })

  return new Response(png as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}

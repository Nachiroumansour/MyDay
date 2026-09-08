import { formaterDateLongue } from '@/lib/dates'
import { couleurEvenement } from '@/lib/evenements'
import { apercuPartage } from '@/serveur/apercu-partage'
import { evenementPublie } from '@/serveur/bdd/evenements'

export const revalidate = 86400

/**
 * L'image que voient les destinataires dans WhatsApp avant même d'ouvrir le
 * lien — souvent la seule chose qu'ils verront.
 */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const evenement = await evenementPublie(slug)
  if (!evenement) return new Response('Introuvable', { status: 404 })

  const premiere = evenement.ceremonies[0]
  const png = await apercuPartage(
    evenement,
    couleurEvenement(evenement.typeEvenement),
    premiere ? formaterDateLongue(premiere.debuteLe) : 'Vous êtes attendu',
    premiere?.lieu ?? '',
  )

  return new Response(png as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}

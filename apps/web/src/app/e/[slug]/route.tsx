import { couleurEvenement } from '@/lib/evenements'
import { evenementPublie } from '@/serveur/bdd/evenements'
import { proportionsCarte } from '@/serveur/carte'
import { origine } from '@/serveur/origine'
import { documentInvitation } from '@/vues/invitation/document'

/**
 * La page invitation, rendue en HTML statique hors du routeur de Next.
 *
 * Ce n'est pas un `page.tsx` parce que le routeur embarque plus de 400 Ko de
 * socle React quoi qu'on fasse — intenable sur la page que tous les invités
 * ouvrent, souvent en 3G (spec §4.5). Ici, le seul script est l'ouverture de
 * l'enveloppe.
 */
export async function GET(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const evenement = await evenementPublie(slug)

  if (!evenement) {
    return new Response('Cette invitation n’existe pas ou n’est plus en ligne.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const requeteUrl = new URL(requete.url)

  const html = documentInvitation({
    evenement,
    couleur: couleurEvenement(evenement.typeEvenement),
    origine: origine(requete),
    proportions: proportionsCarte(evenement.gabarit.sourceSvg),
    reponseEnvoyee: requeteUrl.searchParams.get('rsvp') === 'merci',
    champsFautifs: (requeteUrl.searchParams.get('champs') ?? '').split(',').filter(Boolean),
    ...(requeteUrl.searchParams.get('present') === 'oui'
      ? { choixPrecedent: 'oui' as const }
      : requeteUrl.searchParams.get('present') === 'non'
        ? { choixPrecedent: 'non' as const }
        : {}),
  })

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Le compte à rebours ne bouge qu'une fois par jour ; une heure de
      // fraîcheur suffit largement et évite de rendre la page à chaque visite.
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

import { couleurEvenement } from '@/lib/evenements'
import { evenementPublie } from './bdd/evenements'
import {
  inviteParJeton,
  livreOrPublie,
  participationsReussies,
  photosPubliees,
} from './bdd/modules'
import { proportionsCarte } from './carte'
import { origine } from './origine'
import { documentInvitation } from '@/vues/invitation/document'

/**
 * Sert la page invitation, avec ou sans lien nominatif.
 *
 * Un seul chemin de rendu pour les deux : la version nommée n'est pas une page
 * différente, c'est la même page qui sait à qui elle parle.
 */
export async function servirInvitation(
  requete: Request,
  slug: string,
  jeton?: string,
): Promise<Response> {
  const evenement = await evenementPublie(slug)

  if (!evenement) {
    return new Response('Cette invitation n’existe pas ou n’est plus en ligne.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const [messages, photos, participations, invite] = await Promise.all([
    evenement.livreOrOuvert ? livreOrPublie(evenement.id) : Promise.resolve([]),
    evenement.galerieOuverte ? photosPubliees(evenement.id) : Promise.resolve([]),
    evenement.cagnotteOuverte ? participationsReussies(evenement.id) : Promise.resolve([]),
    jeton ? inviteParJeton(evenement.id, jeton) : Promise.resolve(undefined),
  ])

  const parametres = new URL(requete.url).searchParams
  const present = parametres.get('present')

  const html = documentInvitation({
    evenement,
    couleur: couleurEvenement(evenement.typeEvenement),
    origine: origine(requete),
    proportions: proportionsCarte(evenement.gabarit.sourceSvg),
    reponseEnvoyee: parametres.get('rsvp') === 'merci',
    champsFautifs: (parametres.get('champs') ?? '').split(',').filter(Boolean),
    ...(present === 'oui' || present === 'non' ? { choixPrecedent: present } : {}),
    ...(invite ? { invite } : {}),
    messages,
    photos,
    participations,
    deposes: {
      livreOr: parametres.get('mot') === 'merci',
      photo: parametres.get('photo') === 'merci',
      participation: parametres.get('don') === 'merci',
    },
  })

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Une page nominative ne doit jamais être servie à quelqu'un d'autre
      // depuis un cache partagé.
      'Cache-Control': jeton
        ? 'private, no-store'
        : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

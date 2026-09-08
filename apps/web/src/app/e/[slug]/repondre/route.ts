import { redirect } from 'next/navigation'
import { validerReponse } from '@/lib/rsvp'
import { enregistrerReponse, evenementPublie } from '@/serveur/bdd/evenements'

/**
 * Réception d'une réponse d'invité.
 *
 * Une route POST classique plutôt qu'une action serveur : la page invité ne
 * porte aucun composant client, pour tenir le budget de 60 Ko de la spec
 * (§4.5). Le formulaire fonctionne donc même sans JavaScript.
 *
 * En cas d'erreur on ne renvoie que les noms des champs fautifs dans l'URL,
 * jamais les valeurs saisies : un numéro de téléphone n'a rien à faire dans
 * une adresse, qui finit dans l'historique et les journaux du serveur.
 */
export async function POST(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const evenement = await evenementPublie(slug)
  if (!evenement) redirect(`/e/${slug}`)

  const donnees = await requete.formData()

  const resultat = validerReponse(
    {
      nom: String(donnees.get('nom') ?? ''),
      telephone: String(donnees.get('telephone') ?? ''),
      present: donnees.get('present') === 'oui',
      nbPersonnes: String(donnees.get('nbPersonnes') ?? '1'),
      ceremonieIds: donnees.getAll('ceremonies').map(String),
      message: String(donnees.get('message') ?? ''),
    },
    evenement.ceremonies.map((c) => c.id),
  )

  if (!resultat.ok) {
    // Le choix « présent ou non » repart dans l'URL — ce n'est pas une donnée
    // personnelle — pour que le formulaire se rouvre sur l'erreur au lieu de
    // se replier, laissant l'invité sans explication.
    const champs = Object.keys(resultat.erreurs).join(',')
    const present = donnees.get('present') === 'oui' ? 'oui' : 'non'
    redirect(`/e/${slug}?rsvp=erreur&present=${present}&champs=${encodeURIComponent(champs)}#repondre`)
  }

  await enregistrerReponse({ evenementId: evenement.id, ...resultat.valeurs })
  redirect(`/e/${slug}?rsvp=merci#repondre`)
}

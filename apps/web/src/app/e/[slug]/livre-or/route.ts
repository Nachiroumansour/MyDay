import { redirect } from 'next/navigation'
import { identifiantAppelant, limiteurMessages } from '@/serveur/limitation'
import { evenementPublie } from '@/serveur/bdd/evenements'
import { deposerMessage } from '@/serveur/bdd/modules'

export async function POST(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  // Un envoi en rafale sur un formulaire public est freiné avant d'atteindre
  // la base.
  if (!limiteurMessages.autorise(`${slug}:${identifiantAppelant(requete)}`)) {
    redirect(`/e/${slug}?trop=1#livre-or`)
  }

  const evenement = await evenementPublie(slug)
  if (!evenement?.livreOrOuvert) redirect(`/e/${slug}`)

  const donnees = await requete.formData()
  const auteur = String(donnees.get('auteur') ?? '').trim().slice(0, 80)
  const message = String(donnees.get('message') ?? '').trim().slice(0, 600)

  if (auteur === '' || message === '') redirect(`/e/${slug}#livre-or`)

  await deposerMessage(evenement.id, auteur, message)
  redirect(`/e/${slug}?mot=merci#livre-or`)
}

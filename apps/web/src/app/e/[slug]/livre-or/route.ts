import { redirect } from 'next/navigation'
import { evenementPublie } from '@/serveur/bdd/evenements'
import { deposerMessage } from '@/serveur/bdd/modules'

export async function POST(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const evenement = await evenementPublie(slug)
  if (!evenement?.livreOrOuvert) redirect(`/e/${slug}`)

  const donnees = await requete.formData()
  const auteur = String(donnees.get('auteur') ?? '').trim().slice(0, 80)
  const message = String(donnees.get('message') ?? '').trim().slice(0, 600)

  if (auteur === '' || message === '') redirect(`/e/${slug}#livre-or`)

  await deposerMessage(evenement.id, auteur, message)
  redirect(`/e/${slug}?mot=merci#livre-or`)
}

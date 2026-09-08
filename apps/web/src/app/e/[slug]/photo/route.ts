import { redirect } from 'next/navigation'
import { identifiantAppelant, limiteurPhotos } from '@/serveur/limitation'
import { evenementPublie } from '@/serveur/bdd/evenements'
import { deposerPhoto } from '@/serveur/bdd/modules'
import { enregistrerMedia } from '@/serveur/stockage'

export async function POST(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  // Un envoi en rafale sur un formulaire public est freiné avant d'atteindre
  // la base.
  if (!limiteurPhotos.autorise(`${slug}:${identifiantAppelant(requete)}`)) {
    redirect(`/e/${slug}?trop=1#galerie`)
  }

  const evenement = await evenementPublie(slug)
  if (!evenement?.galerieOuverte) redirect(`/e/${slug}`)

  const donnees = await requete.formData()
  const fichier = donnees.get('photo')
  if (!(fichier instanceof File) || fichier.size === 0) redirect(`/e/${slug}#galerie`)

  try {
    const media = await enregistrerMedia(new Uint8Array(await fichier.arrayBuffer()))
    const nom = String(donnees.get('nom') ?? '').trim().slice(0, 80)
    await deposerPhoto(evenement.id, media.url, nom || null)
  } catch {
    redirect(`/e/${slug}#galerie`)
  }

  redirect(`/e/${slug}?photo=merci#galerie`)
}

import { redirect } from 'next/navigation'
import { lireIdentite, valeursDepuisIdentite } from '@/lib/identite'
import { creerBrouillon } from '@/serveur/bdd/brouillons'

/**
 * Ouvre un brouillon à partir d'un modèle et de l'identité déjà saisie dans la
 * galerie. Aucun compte n'est demandé : le brouillon vit dans une URL secrète.
 */
export async function GET(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const identite = lireIdentite(new URL(requete.url).searchParams)

  const brouillon = await creerBrouillon(slug, valeursDepuisIdentite(identite))
  if (!brouillon) redirect('/modeles')

  redirect(`/brouillon/${brouillon.secretBrouillon}`)
}

import { servirInvitation } from '@/serveur/rendu-invitation'

/**
 * L'invitation nominative : l'enveloppe porte le nom de l'invité et sa réponse
 * est pré-remplie. Le jeton est court, non devinable, et ne contient aucune
 * donnée personnelle.
 */
export async function GET(
  requete: Request,
  { params }: { params: Promise<{ slug: string; jeton: string }> },
) {
  const { slug, jeton } = await params
  return servirInvitation(requete, slug, jeton)
}

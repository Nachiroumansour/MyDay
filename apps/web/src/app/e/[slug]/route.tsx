import { servirInvitation } from '@/serveur/rendu-invitation'

/**
 * La page invitation, rendue en HTML statique hors du routeur de Next.
 *
 * Ce n'est pas un `page.tsx` parce que le routeur embarque plus de 400 Ko de
 * socle React quoi qu'on fasse — intenable sur la page que tous les invités
 * ouvrent, souvent en 3G (spec §4.5).
 */
export async function GET(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  return servirInvitation(requete, slug)
}

import { composerCarte, rendreWebp } from '@myday/moteur'
import { exigerAdmin } from '@/serveur/admin'
import { gabaritAdminParSlug } from '@/serveur/bdd/admin'
import { largeurAdmise } from '@/serveur/carte'
import { polices } from '@/serveur/polices'

/**
 * L'épreuve d'un gabarit, pour l'administration.
 *
 * Aucune valeur n'est fournie : les textes d'exemple du graphiste restent en
 * place, et l'on voit donc sa composition telle qu'il l'a voulue. Sans
 * filigrane non plus — il s'agit de juger le dessin, pas de le protéger d'un
 * public qui n'a pas accès à cet écran.
 */
export const dynamic = 'force-dynamic'

export async function GET(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await exigerAdmin()
  const { slug } = await params
  const gabarit = await gabaritAdminParSlug(slug)
  if (!gabarit) return new Response('Introuvable', { status: 404 })

  const carte = composerCarte({
    gabaritSvg: gabarit.sourceSvg,
    valeurs: {},
    polices: await polices(),
  })

  const image = await rendreWebp(carte.svg, {
    largeurPx: largeurAdmise(new URL(requete.url).searchParams.get('l')),
  })

  return new Response(image as BodyInit, {
    headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'no-store' },
  })
}

import { composerCarte } from '@myday/moteur'
import { lireIdentite, valeursDepuisIdentite } from '@/lib/identite'
import { gabaritParSlug } from '@/serveur/bdd/catalogue'
import { largeurAdmise } from '@/serveur/carte'
import { polices } from '@/serveur/polices'
import { rendreWebp } from '@myday/moteur'

/**
 * La vignette d'un modèle, portant les prénoms du visiteur.
 *
 * C'est ce qui transforme un catalogue en « votre » catalogue : on ne compare
 * plus des modèles abstraits mais des versions de son propre événement. Le
 * filigrane est systématique — rien de vendable ne sort d'ici.
 */
export const revalidate = 86400

export async function GET(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const gabarit = await gabaritParSlug(slug)
  if (!gabarit) return new Response('Introuvable', { status: 404 })

  const parametres = new URL(requete.url).searchParams
  const identite = lireIdentite(parametres)

  const carte = composerCarte({
    gabaritSvg: gabarit.sourceSvg,
    valeurs: valeursDepuisIdentite(identite),
    polices: await polices(),
    filigrane: true,
  })

  const image = await rendreWebp(carte.svg, { largeurPx: largeurAdmise(parametres.get('l')) })

  return new Response(image as BodyInit, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}

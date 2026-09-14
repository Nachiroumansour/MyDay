import { extraireCoordonnees, estLienCourt, type Point } from '@/lib/localisation'

/**
 * Le point d'une cérémonie, à partir de ce que l'hôte a collé.
 *
 * Le bouton « Partager » de Google Maps produit un lien court qui ne contient
 * aucune coordonnée : il faut suivre sa redirection pour obtenir l'adresse
 * longue, qui elle les porte. C'est la forme que les gens collent le plus
 * souvent, donc celle qu'il faut absolument savoir traiter.
 *
 * Une requête sortante vers un service tiers, dans une action déclenchée par
 * l'hôte : elle est donc bornée dans le temps, ne suit qu'un nombre fini de
 * sauts, et n'échoue jamais bruyamment — sans point, l'invité retombe sur la
 * recherche par nom, qui est l'état actuel.
 */
const DELAI_MS = 4000
const SAUTS_MAX = 3

async function deplier(lien: string): Promise<string | undefined> {
  let courant = lien
  for (let saut = 0; saut < SAUTS_MAX; saut += 1) {
    const reponse = await fetch(courant, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(DELAI_MS),
    })
    const suivant = reponse.headers.get('location')
    if (!suivant) return reponse.status < 400 ? courant : undefined
    courant = new URL(suivant, courant).toString()
    if (extraireCoordonnees(courant)) return courant
  }
  return courant
}

export async function resoudrePoint(brut: string): Promise<Point | undefined> {
  const texte = brut.trim()
  if (texte === '') return undefined

  const direct = extraireCoordonnees(texte)
  if (direct) return direct

  if (!estLienCourt(texte)) return undefined

  try {
    const deplie = await deplier(texte)
    return deplie ? extraireCoordonnees(deplie) : undefined
  } catch {
    // Réseau coupé, délai dépassé, Google qui refuse : l'invitation part
    // quand même, avec une recherche par nom plutôt qu'une épingle.
    return undefined
  }
}

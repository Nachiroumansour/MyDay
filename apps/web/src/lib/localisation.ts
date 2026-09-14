export interface Point {
  latitude: number
  longitude: number
}

/**
 * Le point exact d'une cérémonie, extrait de ce que l'hôte colle.
 *
 * À Dakar, une adresse écrite ne mène nulle part : beaucoup de rues n'ont pas
 * de nom dans les cartes, et « Maison familiale Diallo » ne tombe sur aucun
 * point. Le geste qui marche est celui que les gens font déjà entre eux :
 * poser une épingle dans Maps et en partager le lien. On accepte donc toutes
 * les formes que ce partage produit, plus des coordonnées tapées à la main.
 *
 * Les liens courts (maps.app.goo.gl) ne portent pas le point : il faut suivre
 * leur redirection, ce qui se fait côté serveur — voir `serveur/localisation`.
 */

/** Dakar est à ~14,7°N / 17,4°O ; on vérifie surtout qu'on est sur Terre. */
function valide(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    // Le point nul est le symptôme d'une extraction ratée, jamais un lieu de fête.
    !(latitude === 0 && longitude === 0)
  )
}

function point(latitude: string, longitude: string): Point | undefined {
  const lat = Number(latitude)
  const lon = Number(longitude)
  return valide(lat, lon) ? { latitude: lat, longitude: lon } : undefined
}

const NOMBRE = '(-?\\d{1,3}(?:\\.\\d+)?)'

/**
 * Les formes rencontrées, de la plus fiable à la moins précise :
 * `!3d…!4d…` marque le lieu lui-même, `@…` la position de la caméra (qui
 * coïncide en pratique), `q`/`query`/`ll`/`daddr` les liens construits à la main.
 */
const MOTIFS = [
  new RegExp(`!3d${NOMBRE}!4d${NOMBRE}`),
  new RegExp(`[@](${NOMBRE.slice(1, -1)}),(${NOMBRE.slice(1, -1)})`),
  new RegExp(`[?&](?:q|query|ll|sll|daddr|destination)=${NOMBRE},\\s*${NOMBRE}`),
  new RegExp(`^\\s*${NOMBRE}\\s*,\\s*${NOMBRE}\\s*$`),
]

export function extraireCoordonnees(brut: string): Point | undefined {
  const texte = brut.trim()
  if (texte === '') return undefined

  const decode = (() => {
    try {
      return decodeURIComponent(texte)
    } catch {
      return texte
    }
  })()

  for (const motif of MOTIFS) {
    const trouve = motif.exec(decode) ?? motif.exec(texte)
    if (trouve) {
      const resultat = point(trouve[1]!, trouve[2]!)
      if (resultat) return resultat
    }
  }
  return undefined
}

const HÔTES_COURTS = ['maps.app.goo.gl', 'goo.gl', 'maps.google.com']

/** Un lien qu'il faut déplier avant d'y trouver quoi que ce soit. */
export function estLienCourt(brut: string): boolean {
  try {
    const url = new URL(brut.trim())
    if (!HÔTES_COURTS.includes(url.hostname)) return false
    // maps.google.com porte parfois le point directement.
    return extraireCoordonnees(brut) === undefined
  } catch {
    return false
  }
}

/** « 14.6928, -17.4635 » — ce que l'on réaffiche à l'hôte. */
export function formaterPoint(p: Point): string {
  return `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`
}

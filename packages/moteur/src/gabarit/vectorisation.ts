import type { CataloguePolices } from '../rendu/polices.js'

const NS_SVG = 'http://www.w3.org/2000/svg'

/** Attributs de présentation qu'on reporte tels quels du `<text>` sur le `<path>`. */
const ATTRIBUTS_REPORTES = [
  'fill',
  'fill-opacity',
  'opacity',
  'stroke',
  'stroke-width',
  'transform',
  'clip-path',
  'data-champ',
  'data-type',
]

export interface ResultatVectorisation {
  /** Noms des polices absentes du catalogue : le texte est resté en `<text>`. */
  policesManquantes: string[]
}

function nombre(valeur: string | null, defaut: number): number {
  if (valeur === null || valeur.trim() === '') return defaut
  const converti = Number(valeur.replace(/px$/, ''))
  return Number.isFinite(converti) ? converti : defaut
}

/**
 * Remplace chaque `<text>` par le contour de ses lettres.
 *
 * resvg-js 2.6.2 ignore les polices qu'on lui passe en mémoire et n'honore pas
 * `loadSystemFonts: false` — vérifié : une famille inexistante rend le même
 * fichier que Great Vibes. Sur un serveur sans polices installées, les
 * calligraphies des gabarits disparaîtraient donc de la carte livrée.
 *
 * En vectorisant nous-mêmes, le rendu ne dépend plus d'aucun chargement de
 * police, et le navigateur et le serveur dessinent exactement les mêmes tracés.
 */
export function vectoriserTextes(
  doc: Document,
  catalogue: CataloguePolices,
): ResultatVectorisation {
  const manquantes = new Set<string>()

  // getElementsByTagName est vivant : on fige la liste avant de remplacer.
  const textes = Array.from(doc.getElementsByTagName('text'))

  for (const texte of textes) {
    const contenu = (texte.textContent ?? '').trim()
    if (contenu === '') {
      texte.parentNode?.removeChild(texte)
      continue
    }

    const famille = (texte.getAttribute('font-family') ?? '').replace(/['"]/g, '').trim()
    const police = catalogue.obtenir(famille)
    if (!police) {
      manquantes.add(famille || '(aucune)')
      continue
    }

    const taille = nombre(texte.getAttribute('font-size'), 16)
    const espacement = nombre(texte.getAttribute('letter-spacing'), 0)
    const y = nombre(texte.getAttribute('y'), 0)
    const ancre = texte.getAttribute('text-anchor') ?? 'start'

    // `text-anchor` n'existe pas pour un tracé : on décale l'origine nous-mêmes.
    const largeur = police.mesurer(contenu, taille, espacement)
    const xDeclare = nombre(texte.getAttribute('x'), 0)
    const x =
      ancre === 'middle' ? xDeclare - largeur / 2 : ancre === 'end' ? xDeclare - largeur : xDeclare

    const chemin = doc.createElementNS(NS_SVG, 'path')
    chemin.setAttribute('d', police.tracer(contenu, x, y, taille, espacement))
    if (!texte.getAttribute('fill')) chemin.setAttribute('fill', '#000000')
    for (const attribut of ATTRIBUTS_REPORTES) {
      const valeur = texte.getAttribute(attribut)
      if (valeur !== null) chemin.setAttribute(attribut, valeur)
    }

    texte.parentNode?.replaceChild(chemin, texte)
  }

  return { policesManquantes: [...manquantes] }
}

const NS_SVG = 'http://www.w3.org/2000/svg'

interface Boite {
  largeur: number
  hauteur: number
}

function dimensions(doc: Document): Boite {
  const racine = doc.documentElement
  const viewBox = racine?.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      return { largeur: parts[2]!, hauteur: parts[3]! }
    }
  }
  return {
    largeur: Number(racine?.getAttribute('width') ?? 600),
    hauteur: Number(racine?.getAttribute('height') ?? 900),
  }
}

/**
 * Surimpose une trame de mentions en diagonale.
 * `police` doit être une famille présente dans le catalogue, sans quoi la
 * vectorisation laissera la mention en `<text>` et le serveur risque de ne pas
 * la dessiner du tout — un aperçu sans filigrane est une fuite du catalogue.
 * Le pas est calculé sur la plus grande dimension du document pour que la
 * couverture soit complète quelles que soient les proportions du gabarit.
 */
export function apposerFiligrane(
  doc: Document,
  mention = 'MyDay',
  police = 'sans-serif',
): void {
  const { largeur, hauteur } = dimensions(doc)
  const taille = Math.max(largeur, hauteur) / 14
  const pasX = taille * 7
  const pasY = taille * 4

  const groupe = doc.createElementNS(NS_SVG, 'g')
  groupe.setAttribute('data-filigrane', 'true')
  groupe.setAttribute('aria-hidden', 'true')
  groupe.setAttribute('pointer-events', 'none')

  for (let y = -hauteur; y < hauteur * 2; y += pasY) {
    for (let x = -largeur; x < largeur * 2; x += pasX) {
      const texte = doc.createElementNS(NS_SVG, 'text')
      texte.setAttribute('x', String(x))
      texte.setAttribute('y', String(y))
      texte.setAttribute('transform', `rotate(-30 ${x} ${y})`)
      texte.setAttribute('font-family', police)
      texte.setAttribute('font-size', String(taille))
      texte.setAttribute('font-weight', '700')
      texte.setAttribute('fill', '#14161D')
      texte.setAttribute('fill-opacity', '0.16')
      texte.textContent = mention
      groupe.appendChild(texte)
    }
  }

  doc.documentElement?.appendChild(groupe)
}

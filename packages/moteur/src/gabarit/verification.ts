import { proportions } from '../rendu/png'

/**
 * Les contrôles de dépôt d'un gabarit.
 *
 * Distincts de `analyserGabarit`, qui lit les champs de tout gabarit à chaque
 * usage : ceux-ci ne s'appliquent qu'à l'arrivée d'un nouveau fichier. Ils
 * disent non à ce qui passerait sans bruit et se verrait trop tard — une
 * photo intégrée qui alourdit toute la galerie, une balise que le moteur de
 * rendu ignore en silence, des dimensions manquantes qui donnent un fichier
 * d'impression à la mauvaise taille.
 *
 * Rend la liste des reproches, vide si le fichier est recevable.
 */

/** Ce que le moteur de rendu ne sait pas faire, et qui disparaîtrait sans rien dire. */
const BALISES_IGNOREES = ['foreignObject', 'animate', 'animateTransform'] as const

function elements(doc: Document, balise: string): Element[] {
  const trouves = doc.getElementsByTagName(balise)
  return Array.from({ length: trouves.length }, (_, i) => trouves[i]!).filter(Boolean)
}

function referencesExternes(doc: Document): string[] {
  const suspectes: string[] = []
  const tous = doc.getElementsByTagName('*')
  for (let i = 0; i < tous.length; i += 1) {
    const element = tous[i]
    if (!element) continue
    for (const attribut of ['href', 'xlink:href']) {
      const valeur = element.getAttribute(attribut)
      if (valeur && /^(https?:)?\/\//i.test(valeur)) suspectes.push(valeur)
    }
  }
  return suspectes
}

export function verifierDepot(doc: Document): string[] {
  const reproches: string[] = []

  const images = elements(doc, 'image')
  if (images.length > 0) {
    reproches.push(
      `Le fichier contient ${images.length} image${images.length > 1 ? 's' : ''} intégrée${
        images.length > 1 ? 's' : ''
      }. Seule la photo du client en porte une, et c'est le moteur qui l'insère : déclarez un rectangle data-champ="zone_photo" data-type="image".`,
    )
  }

  if (elements(doc, 'script').length > 0) {
    reproches.push('Le fichier contient du script. Un gabarit est un dessin, rien d’autre.')
  }

  for (const balise of BALISES_IGNOREES) {
    if (elements(doc, balise).length > 0) {
      reproches.push(
        `Le fichier contient <${balise}>, que le moteur de rendu ignore : ce contenu n’apparaîtrait sur aucune carte.`,
      )
    }
  }

  const externes = referencesExternes(doc)
  if (externes.length > 0) {
    reproches.push(
      `Le fichier pointe vers l’extérieur (${externes[0]}). Rien n’est téléchargé au rendu : ces éléments seraient vides.`,
    )
  }

  const racine = doc.documentElement
  const largeurMm = racine?.getAttribute('data-largeur-mm')
  const hauteurMm = racine?.getAttribute('data-hauteur-mm')
  if (!largeurMm || !hauteurMm) {
    reproches.push(
      'Il manque data-largeur-mm et data-hauteur-mm sur la balise <svg>. Sans elles, le fichier d’impression sortirait à une taille arbitraire.',
    )
  } else if (!(Number(largeurMm) > 0) || !(Number(hauteurMm) > 0)) {
    reproches.push('data-largeur-mm et data-hauteur-mm doivent être des nombres positifs.')
  }

  try {
    proportions(doc)
  } catch {
    reproches.push('La balise <svg> n’a ni viewBox lisible ni width/height.')
  }

  return reproches
}

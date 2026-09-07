import { elementsDeChamp } from '../dom.js'
import type { ValeursChamps } from '../types.js'

function premierTspan(element: Element): Element | undefined {
  const tspans = element.getElementsByTagName('tspan')
  return tspans.length > 0 ? tspans[0] : undefined
}

/**
 * Écrit les valeurs saisies dans les champs texte du document.
 * `textContent` est utilisé partout : le DOM échappe lui-même le contenu, ce qui
 * rend impossible l'injection de balisage par une valeur du client.
 */
export function remplirTextes(doc: Document, valeurs: ValeursChamps): void {
  for (const element of elementsDeChamp(doc)) {
    const id = element.getAttribute('data-champ')!
    if (element.getAttribute('data-type') === 'image') continue
    if (!(id in valeurs)) continue

    const valeur = (valeurs[id] ?? '').trim()

    if (valeur === '') {
      element.parentNode?.removeChild(element)
      continue
    }

    const cible = premierTspan(element) ?? element
    cible.textContent = valeur
  }
}

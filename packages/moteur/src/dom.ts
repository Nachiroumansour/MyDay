import { DOMParser as ParseurXml, XMLSerializer as SerialiseurXml } from '@xmldom/xmldom'

const SUR_NAVIGATEUR = typeof globalThis.DOMParser !== 'undefined'

/** xmldom expose ses propres types de nœud, incompatibles avec ceux du DOM. */
type NoeudXmldom = Parameters<InstanceType<typeof SerialiseurXml>['serializeToString']>[0]

/**
 * Analyse une source SVG en `Document` DOM standard.
 * Le navigateur utilise son parseur natif, Node passe par xmldom : le reste du
 * moteur ne voit qu'un `Document`, et le même code s'exécute des deux côtés.
 */
export function analyserDocument(source: string): Document {
  if (SUR_NAVIGATEUR) {
    return new globalThis.DOMParser().parseFromString(source, 'image/svg+xml')
  }
  return new ParseurXml().parseFromString(source, 'image/svg+xml') as unknown as Document
}

export function serialiserDocument(doc: Document): string {
  if (SUR_NAVIGATEUR) {
    return new globalThis.XMLSerializer().serializeToString(doc)
  }
  return new SerialiseurXml().serializeToString(doc as unknown as NoeudXmldom)
}

/** Tous les éléments portant `data-champ`, dans l'ordre du document. */
export function elementsDeChamp(doc: Document): Element[] {
  const trouves: Element[] = []
  const tous = doc.getElementsByTagName('*')
  for (let i = 0; i < tous.length; i += 1) {
    const element = tous[i]
    if (element && element.getAttribute('data-champ')) trouves.push(element)
  }
  return trouves
}

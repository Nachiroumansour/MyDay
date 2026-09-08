import { elementsDeChamp } from '../dom'
import type { Cadre, ChampGabarit, TypeChamp } from '../types'

export class ErreurGabarit extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ErreurGabarit'
  }
}

const TYPES_ADMIS: readonly TypeChamp[] = ['texte', 'texte_long', 'date', 'image']

function nombre(valeur: string | null): number | undefined {
  if (valeur === null || valeur.trim() === '') return undefined
  const converti = Number(valeur)
  return Number.isFinite(converti) ? converti : undefined
}

function lireCadre(element: Element, id: string): Cadre {
  const declare = element.getAttribute('data-cadre')
  if (declare) {
    const parts = declare.split(',').map((p) => Number(p.trim()))
    if (parts.length !== 4 || parts.some((p) => !Number.isFinite(p))) {
      throw new ErreurGabarit(
        `Le champ « ${id} » a un data-cadre illisible : « ${declare} ». Attendu « x,y,largeur,hauteur ».`,
      )
    }
    return { x: parts[0]!, y: parts[1]!, largeur: parts[2]!, hauteur: parts[3]! }
  }

  const x = nombre(element.getAttribute('x'))
  const y = nombre(element.getAttribute('y'))
  const largeur = nombre(element.getAttribute('width'))
  const hauteur = nombre(element.getAttribute('height'))
  if (x === undefined || y === undefined || largeur === undefined || hauteur === undefined) {
    throw new ErreurGabarit(
      `Le champ « ${id} » n'a pas de cadre. Ajoutez data-cadre="x,y,largeur,hauteur" sur l'élément.`,
    )
  }
  return { x, y, largeur, hauteur }
}

export function analyserGabarit(doc: Document): ChampGabarit[] {
  const champs: ChampGabarit[] = []
  const vus = new Set<string>()

  for (const element of elementsDeChamp(doc)) {
    const id = element.getAttribute('data-champ')!
    if (vus.has(id)) {
      throw new ErreurGabarit(`Le champ « ${id} » est déclaré deux fois dans le gabarit.`)
    }
    vus.add(id)

    const type = element.getAttribute('data-type') as TypeChamp | null
    if (!type || !TYPES_ADMIS.includes(type)) {
      throw new ErreurGabarit(
        `Le champ « ${id} » n'a pas de data-type valide. Attendu : ${TYPES_ADMIS.join(', ')}.`,
      )
    }

    champs.push({
      id,
      type,
      cadre: lireCadre(element, id),
      maxLongueur: nombre(element.getAttribute('data-max-longueur')),
      police: element.getAttribute('font-family') ?? undefined,
      tailleNominale: nombre(element.getAttribute('font-size')),
    })
  }

  return champs
}

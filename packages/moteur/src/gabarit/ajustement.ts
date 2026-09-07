import { elementsDeChamp } from '../dom.js'
import type { CataloguePolices, PoliceChargee } from '../rendu/polices.js'
import type { Cadre, ChampGabarit } from '../types.js'

/** En deçà, la carte serait déséquilibrée : on préfère signaler le débordement. */
export const PLANCHER_ECHELLE = 0.6

export interface ResultatAjustement {
  taille: number
  deborde: boolean
}

export function ajusterAuCadre(
  texte: string,
  police: PoliceChargee,
  tailleNominale: number,
  cadre: Cadre,
): ResultatAjustement {
  if (texte === '') return { taille: tailleNominale, deborde: false }

  const plancher = tailleNominale * PLANCHER_ECHELLE

  if (cadre.largeur <= 0) return { taille: plancher, deborde: true }

  const largeurNominale = police.mesurer(texte, tailleNominale)
  if (largeurNominale <= cadre.largeur) {
    return { taille: tailleNominale, deborde: false }
  }

  // La chasse est proportionnelle à la taille : une seule division suffit.
  const tailleIdeale = (tailleNominale * cadre.largeur) / largeurNominale
  if (tailleIdeale < plancher) return { taille: plancher, deborde: true }

  return { taille: tailleIdeale, deborde: false }
}

/** Applique l'ajustement à tous les champs texte, renvoie ceux qui débordent. */
export function ajusterDocument(
  doc: Document,
  champs: ChampGabarit[],
  catalogue: CataloguePolices,
): string[] {
  const parId = new Map(champs.map((c) => [c.id, c]))
  const debordements: string[] = []

  for (const element of elementsDeChamp(doc)) {
    const id = element.getAttribute('data-champ')!
    const champ = parId.get(id)
    if (!champ || champ.type === 'image') continue
    if (!champ.police || !champ.tailleNominale) continue

    const police = catalogue.obtenir(champ.police)
    if (!police) continue

    const texte = element.textContent ?? ''
    const resultat = ajusterAuCadre(texte, police, champ.tailleNominale, champ.cadre)

    element.setAttribute('font-size', String(Math.round(resultat.taille * 100) / 100))
    if (resultat.deborde) debordements.push(id)
  }

  return debordements
}

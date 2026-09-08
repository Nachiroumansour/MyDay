import { composerCarte, dimensionsPhysiques, analyserDocument, pixelsPourDpi, rendrePng, rendreWebp, DPI_LIVRAISON } from '@myday/moteur'
import { polices } from './polices'
import type { EvenementVue } from './bdd/evenements'

/** Largeurs de rendu admises. Une liste fermée : la largeur vient de l'URL. */
export const LARGEURS_ADMISES = [300, 480, 900, 1500] as const
export type LargeurCarte = (typeof LARGEURS_ADMISES)[number]

export function largeurAdmise(brut: string | null): LargeurCarte {
  const valeur = Number(brut)
  return (LARGEURS_ADMISES as readonly number[]).includes(valeur)
    ? (valeur as LargeurCarte)
    : 900
}

/**
 * Rend la carte d'un événement.
 * `filigrane` reste vrai tant que le client n'a pas payé — c'est la seule
 * protection du catalogue, et elle ne doit jamais dépendre d'un paramètre
 * d'URL.
 */
export async function rendreCarte(
  evenement: Pick<EvenementVue, 'gabarit' | 'valeursChamps' | 'photoUrl' | 'recadrage'>,
  options: { largeurPx: number; filigrane: boolean; format?: 'png' | 'webp' },
): Promise<Uint8Array> {
  const carte = composerCarte({
    gabaritSvg: evenement.gabarit.sourceSvg,
    valeurs: evenement.valeursChamps,
    polices: await polices(),
    filigrane: options.filigrane,
    ...(evenement.photoUrl
      ? {
          photo: {
            source: evenement.photoUrl,
            largeur: 1200,
            hauteur: 1200,
            ...(evenement.recadrage ? { recadrage: evenement.recadrage } : {}),
          },
        }
      : {}),
  })

  return options.format === 'webp'
    ? rendreWebp(carte.svg, { largeurPx: options.largeurPx })
    : rendrePng(carte.svg, { largeurPx: options.largeurPx })
}

/** Proportions de la carte, pour réserver sa place avant qu'elle ne charge. */
export function proportionsCarte(sourceSvg: string): { largeur: number; hauteur: number } {
  const { largeurMm, hauteurMm } = dimensionsPhysiques(analyserDocument(sourceSvg))
  return {
    largeur: pixelsPourDpi(largeurMm, DPI_LIVRAISON),
    hauteur: pixelsPourDpi(hauteurMm, DPI_LIVRAISON),
  }
}

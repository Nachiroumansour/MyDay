import type { Cadre } from '@myday/moteur'

/**
 * Les zones de la carte que l'on peut toucher pour éditer un texte.
 *
 * Paperless Post et Canva font éditer le texte là où il est, sur la carte ;
 * un formulaire à côté oblige à faire le lien de tête entre « Prénom de la
 * mariée » et ce qu'on voit. Le moteur connaît déjà la boîte de chaque champ,
 * déclarée par le graphiste (`data-cadre`) : il suffit de la reporter en
 * pourcentages par-dessus l'image, qui peut s'afficher à n'importe quelle
 * taille.
 */
export interface Zone {
  id: string
  /** Positions et tailles en pourcentage de la carte. */
  gauche: number
  haut: number
  largeur: number
  hauteur: number
}

function borne(valeur: number): number {
  return Math.min(100, Math.max(0, valeur))
}

export function zonesTactiles(
  champs: { id: string; type: string; cadre: Cadre }[],
  vue: { largeur: number; hauteur: number },
): Zone[] {
  if (vue.largeur <= 0 || vue.hauteur <= 0) return []

  return (
    champs
      // La photo se règle ailleurs : elle a ses curseurs de cadrage.
      .filter((champ) => champ.type !== 'image')
      .map((champ) => {
        const gauche = borne((champ.cadre.x / vue.largeur) * 100)
        const haut = borne((champ.cadre.y / vue.hauteur) * 100)
        return {
          id: champ.id,
          gauche,
          haut,
          largeur: borne((champ.cadre.largeur / vue.largeur) * 100 + gauche) - gauche,
          hauteur: borne((champ.cadre.hauteur / vue.hauteur) * 100 + haut) - haut,
        }
      })
      .filter((zone) => zone.largeur > 0 && zone.hauteur > 0)
      // Dans l'ordre où on lit la carte : c'est celui que suivront « Suivant »
      // et « Précédent » dans la feuille d'édition.
      .sort((a, b) => a.haut - b.haut || a.gauche - b.gauche)
  )
}

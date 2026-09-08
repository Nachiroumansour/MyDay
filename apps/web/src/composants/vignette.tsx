import type { GabaritVue } from '@/serveur/bdd/catalogue'
import type { Identite } from '@/lib/identite'
import { versParametres } from '@/lib/identite'

/**
 * La vignette d'un modèle, déjà personnalisée aux prénoms du visiteur.
 * Ni cadre, ni ombre, ni fond : juste l'image et son nom en dessous.
 */
export function Vignette({
  gabarit,
  identite,
  largeur = 480,
  priorite = false,
}: {
  gabarit: GabaritVue
  identite: Identite
  largeur?: 300 | 480 | 900
  priorite?: boolean
}) {
  const parametres = versParametres(identite)
  const source = `/modeles/${gabarit.slug}/vignette.png?l=${largeur}${
    parametres ? `&${parametres}` : ''
  }`

  return (
    <img
      src={source}
      width={1500}
      height={2250}
      alt={`Modèle ${gabarit.nom}`}
      loading={priorite ? 'eager' : 'lazy'}
      fetchPriority={priorite ? 'high' : 'auto'}
      style={{ display: 'block', width: '100%', height: 'auto', border: '1px solid var(--trait)' }}
    />
  )
}

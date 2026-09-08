import { join } from 'node:path'
import { chargerPolicesDepuisDossier, type CataloguePolices } from '@myday/moteur'

/**
 * Chemin résolu depuis la racine de l'application, et non via `import.meta.url` :
 * le bundler tente d'analyser statiquement `new URL(..., import.meta.url)` et
 * échoue sur un dossier.
 */
const DOSSIER = process.env.DOSSIER_POLICES ?? join(process.cwd(), 'polices')

let cache: Promise<CataloguePolices> | undefined

/**
 * Le catalogue est chargé une seule fois par processus : lire et analyser les
 * fichiers de police à chaque rendu coûterait plus cher que le rendu lui-même.
 */
export function polices(): Promise<CataloguePolices> {
  cache ??= chargerPolicesDepuisDossier(DOSSIER)
  return cache
}

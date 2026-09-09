import { access, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chargerPolicesDepuisDossier, CataloguePolices } from '@myday/moteur'

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

/** Le nom de famille est celui du fichier : il finit dans un `font-family`. */
const NOM_ADMIS = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/
const EXTENSIONS = new Set(['ttf', 'otf'])
export const TAILLE_MAX_POLICE = 4 * 1024 * 1024

export class ErreurPolice extends Error {}

/**
 * Enregistre une police livrée par un graphiste.
 *
 * Le nom de fichier devient le `font-family` des gabarits, d'où sa
 * validation stricte — elle écarte aussi, au passage, toute traversée de
 * chemin. Une police déjà présente n'est jamais remplacée : elle est employée
 * par des gabarits en ligne, et une substitution silencieuse changerait leur
 * dessin sans que personne l'ait demandé.
 */
export async function deposerPolice(nomFichier: string, octets: Uint8Array): Promise<string> {
  const point = nomFichier.lastIndexOf('.')
  const base = point > 0 ? nomFichier.slice(0, point) : nomFichier
  const extension = point > 0 ? nomFichier.slice(point + 1).toLowerCase() : ''

  if (!EXTENSIONS.has(extension)) {
    throw new ErreurPolice(`« ${nomFichier} » n’est ni un .ttf ni un .otf.`)
  }
  if (!NOM_ADMIS.test(base)) {
    throw new ErreurPolice(
      `« ${base} » ne convient pas comme nom de police. Lettres, chiffres, tiret et souligné, sans espace ni accent — c’est ce nom qui ira dans font-family.`,
    )
  }
  if (octets.byteLength > TAILLE_MAX_POLICE) {
    throw new ErreurPolice(`« ${nomFichier} » dépasse 4 Mo.`)
  }

  const chemin = join(DOSSIER, `${base}.${extension}`)
  if (await access(chemin).then(() => true, () => false)) {
    throw new ErreurPolice(
      `Une police « ${base} » est déjà déposée. Des gabarits en ligne s’en servent : donnez un autre nom plutôt que de la remplacer.`,
    )
  }

  // On la fait analyser avant de l'écrire : un fichier corrompu ne doit pas
  // rester dans le dossier à faire échouer tous les rendus suivants.
  try {
    const copie = octets.slice()
    new CataloguePolices().ajouter(base, copie.buffer as ArrayBuffer)
  } catch {
    throw new ErreurPolice(`« ${nomFichier} » n’a pas pu être lu comme police.`)
  }

  await writeFile(chemin, octets)
  cache = undefined
  return base
}

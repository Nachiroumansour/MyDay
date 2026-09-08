/**
 * Assemble les gabarits de démonstration.
 *
 * Les trois modèles partagent le même vocabulaire ornemental — roses, feuillage,
 * filets d'or, écoinçons. Le garder dans un fragment commun évite d'en tenir
 * trois copies à jour ; chaque modèle n'écrit alors que son propre corps.
 *
 * Les fichiers produits restent des SVG autonomes, comme ceux qu'un graphiste
 * nous livre : c'est le format que le moteur lit, et rien dans l'application
 * ne sait qu'ils ont été assemblés.
 *
 *   npx tsx scripts/composer-gabarits.ts
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const gabarits = join(process.cwd(), 'gabarits')
const atelier = join(gabarits, 'atelier')

const CADRE = `  <rect width="600" height="900" fill="url(#papier)"/>

  <use href="#ruban-bord" fill="url(#ruban)" opacity=".4" transform="translate(6 250)"/>
  <use href="#ruban-bord" fill="url(#ruban)" opacity=".4" transform="translate(594 250) scale(-1 1)"/>

  <rect x="18" y="18" width="564" height="864" fill="none" stroke="#B08C2E" stroke-width="2.2"/>
  <rect x="29" y="29" width="542" height="842" fill="none" stroke="#C7A55A" stroke-width=".9"/>
  <use href="#equerre" transform="translate(22 22)"/>
  <use href="#equerre" transform="translate(578 22) scale(-1 1)"/>
  <use href="#equerre" transform="translate(22 878) scale(1 -1)"/>
  <use href="#equerre" transform="translate(578 878) scale(-1 -1)"/>
`

// Le décor floral passe par-dessus le cadre : il l'encadre, il ne s'y range pas.
const BOUQUETS = `
  <use href="#bouquet" transform="translate(10 10)"/>
  <use href="#bouquet" transform="translate(590 10) scale(-1 1)"/>
  <use href="#bouquet" transform="translate(10 890) scale(1 -1)"/>
  <use href="#bouquet" transform="translate(590 890) scale(-1 -1)"/>
`

async function main(): Promise<void> {
  const ornements = await readFile(join(atelier, 'ornements.frag'), 'utf8')
  const bouquet = await readFile(join(atelier, 'bouquet.frag'), 'utf8')

  const corps = (await readdir(atelier)).filter((f) => f.endsWith('.corps.frag')).sort()
  if (corps.length === 0) throw new Error('Aucun corps de gabarit dans gabarits/atelier.')

  for (const fichier of corps) {
    const nom = fichier.replace('.corps.frag', '')
    const contenu = await readFile(join(atelier, fichier), 'utf8')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"
     data-largeur-mm="127" data-hauteur-mm="190.5">
${ornements}${bouquet}  </defs>
${CADRE}
${contenu}${BOUQUETS}</svg>
`
    await writeFile(join(gabarits, `${nom}.svg`), svg)
    console.log(`✓ ${nom}.svg — ${(svg.length / 1024).toFixed(1)} Ko`)
  }
}

await main()

/**
 * Mesure ce qui transite réellement sur le réseau pour une page, et le
 * confronte au budget de la spec (§4.5) : la page invité doit rester sous
 * 60 Ko de JavaScript compressé.
 *
 *   npx tsx scripts/mesurer-poids.ts [url-de-base] [chemin...]
 */
import { chromium } from 'playwright'

const [, , base = 'http://localhost:3210', ...chemins] = process.argv

const BUDGET_JS_KO = 60

interface Poste {
  type: string
  octets: number
  nombre: number
}

function ko(octets: number): string {
  return `${(octets / 1024).toFixed(1)} Ko`
}

async function main(): Promise<void> {
  const navigateur = await chromium.launch({ channel: 'chrome' })
  let depassements = 0

  for (const chemin of chemins.length > 0 ? chemins : ['/']) {
    const contexte = await navigateur.newContext({
      viewport: { width: 390, height: 844 },
      locale: 'fr-FR',
    })
    const page = await contexte.newPage()
    const postes = new Map<string, Poste>()

    page.on('response', async (reponse) => {
      const type = (reponse.headers()['content-type'] ?? 'inconnu').split(';')[0]!
      const taille = Number(reponse.headers()['content-length'] ?? 0)
      const octets =
        taille || (await reponse.body().then((b) => b.byteLength).catch(() => 0))
      const poste = postes.get(type) ?? { type, octets: 0, nombre: 0 }
      poste.octets += octets
      poste.nombre += 1
      postes.set(type, poste)
    })

    await page.goto(`${base}${chemin}`, { waitUntil: 'networkidle' })

    const lignes = [...postes.values()].sort((a, b) => b.octets - a.octets)
    const js = lignes
      .filter((l) => l.type.includes('javascript'))
      .reduce((somme, l) => somme + l.octets, 0)
    const total = lignes.reduce((somme, l) => somme + l.octets, 0)

    console.log(`\n${chemin}`)
    for (const ligne of lignes) {
      console.log(`  ${ligne.type.padEnd(26)} ${ko(ligne.octets).padStart(10)}  ×${ligne.nombre}`)
    }
    console.log(`  ${'TOTAL'.padEnd(26)} ${ko(total).padStart(10)}`)

    const depasse = js / 1024 > BUDGET_JS_KO
    console.log(
      `  ${depasse ? '✗' : '✓'} JavaScript ${ko(js)} — budget ${BUDGET_JS_KO} Ko`,
    )
    if (depasse) depassements += 1

    await contexte.close()
  }

  await navigateur.close()
  process.exit(depassements === 0 ? 0 : 1)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exit(1)
})

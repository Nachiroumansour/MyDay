/**
 * Capture des écrans de l'application, pour juger le rendu à l'œil.
 * Utilise le Chrome déjà installé sur la machine : rien à télécharger.
 *
 *   npx tsx scripts/capturer.ts <url-de-base> <sortie> [chemin...]
 */
import { mkdir } from 'node:fs/promises'
import { chromium, type Page } from 'playwright'

const [, , base = 'http://localhost:3210', sortie = 'captures', ...chemins] = process.argv

const APPAREILS = [
  { nom: 'mobile', largeur: 390, hauteur: 844, echelle: 2 },
  { nom: 'bureau', largeur: 1280, hauteur: 900, echelle: 1 },
] as const

function nomFichier(chemin: string): string {
  const propre = chemin.replace(/^\//, '').replace(/[^\w-]+/g, '-') || 'accueil'
  return propre.replace(/-+$/, '')
}

async function attendreStabilite(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => {})
  // Laisse les polices se poser avant de capturer.
  await page.evaluate(() => document.fonts?.ready).catch(() => {})
  await page.waitForTimeout(250)
}

/**
 * Fait croire à la page que l'enveloppe a déjà été ouverte, pour capturer ce
 * que voit un invité qui revient — c'est-à-dire la page elle-même.
 */
const ENVELOPPE_DEJA_VUE = () => {
  const origine = Storage.prototype.getItem
  Storage.prototype.getItem = function (cle: string) {
    if (cle.startsWith('myday:enveloppe:')) return '1'
    return origine.call(this, cle)
  }
}

async function main(): Promise<void> {
  await mkdir(sortie, { recursive: true })
  const navigateur = await chromium.launch({ channel: 'chrome' })

  for (const appareil of APPAREILS) {
    const contexte = await navigateur.newContext({
      viewport: { width: appareil.largeur, height: appareil.hauteur },
      deviceScaleFactor: appareil.echelle,
      locale: 'fr-FR',
      timezoneId: 'Africa/Dakar',
    })
    const page = await contexte.newPage()

    for (const chemin of chemins.length > 0 ? chemins : ['/']) {
      // 1. Le premier écran tel quel — enveloppe comprise.
      await page.goto(`${base}${chemin}`, { waitUntil: 'domcontentloaded' })
      await attendreStabilite(page)
      const premier = `${sortie}/${nomFichier(chemin)}-${appareil.nom}-arrivee.png`
      await page.screenshot({ path: premier })
      console.log(`✓ ${premier}`)

      // 2. La page entière, comme la voit un invité qui revient.
      await contexte.addInitScript(ENVELOPPE_DEJA_VUE)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await attendreStabilite(page)
      const entier = `${sortie}/${nomFichier(chemin)}-${appareil.nom}.png`
      await page.screenshot({ path: entier, fullPage: true })
      console.log(`✓ ${entier}`)
    }
    await contexte.close()
  }

  await navigateur.close()
}

main().catch((erreur) => {
  console.error(erreur)
  process.exit(1)
})

/**
 * Vérifie de bout en bout le parcours de l'invité, dans un vrai navigateur :
 * l'ouverture de l'enveloppe, puis l'envoi d'une réponse.
 *
 *   npx tsx scripts/verifier-parcours.ts [url-de-base] [slug]
 */
import { chromium, type Page } from 'playwright'

const [, , base = 'http://localhost:3210', slug = 'aminata-ibrahima'] = process.argv

let echecs = 0

function verifier(intitule: string, condition: boolean): void {
  console.log(`${condition ? '✓' : '✗'} ${intitule}`)
  if (!condition) echecs += 1
}

async function parcours(page: Page): Promise<void> {
  await page.goto(`${base}/e/${slug}`, { waitUntil: 'domcontentloaded' })

  const voile = page.getByRole('dialog')
  verifier('l’enveloppe accueille l’invité', await voile.isVisible())

  await page.getByRole('button', { name: 'Ouvrir l’invitation' }).click()
  await voile.waitFor({ state: 'hidden', timeout: 4000 })
  verifier('l’enveloppe s’efface après l’ouverture', !(await voile.isVisible()))

  verifier('le programme est là', await page.getByText('Le programme').isVisible())
  verifier('le repère guide l’invité', await page.getByText('Pour trouver').first().isVisible())

  await page.reload({ waitUntil: 'domcontentloaded' })
  verifier('l’ouverture ne se rejoue pas', !(await voile.isVisible()))

  // La réponse. « Je serai là » est un bouton radio déguisé : on clique
  // l'étiquette, comme le ferait un invité.
  await page.getByText('Je serai là', { exact: true }).click()
  await page.getByLabel('Votre nom').fill('Fatou Sarr')
  await page.getByLabel('Votre numéro').fill('77 987 65 43')
  await page.getByLabel('Vous serez combien ?').fill('3')

  const cases = page.locator('input[name="ceremonies"]')
  await cases.first().check()
  await cases.last().check()
  await page.getByLabel('Un mot pour les hôtes', { exact: false }).fill('Avec grand plaisir !')

  await page.getByRole('button', { name: 'Envoyer ma réponse' }).click()
  await page.getByText('C’est noté, merci.').waitFor({ timeout: 6000 })
  verifier('la réponse est enregistrée', true)

  verifier(
    'la page invité ne charge aucun JavaScript de cadre',
    (await page.evaluate(() => document.querySelectorAll('script[src]').length)) === 0,
  )

  // Un formulaire mal rempli doit expliquer quoi corriger.
  // L'enveloppe ne se rejoue plus : elle a déjà été vue plus haut.
  await page.goto(`${base}/e/${slug}`, { waitUntil: 'domcontentloaded' })
  await page.getByText('Je serai là', { exact: true }).click()
  await page.getByLabel('Votre nom').fill('Test')
  await page.getByLabel('Votre numéro').fill('123')
  await page.locator('input[name="ceremonies"]').first().check()
  await page.getByRole('button', { name: 'Envoyer ma réponse' }).click()
  await page.getByText('Ce numéro ne semble pas valide', { exact: false }).waitFor({ timeout: 6000 })
  verifier('un numéro invalide est expliqué, pas rejeté sèchement', true)
}

/** Le parcours du client : de l'accueil au modèle, en passant par le guidage. */
async function parcoursClient(page: Page): Promise<void> {
  await page.goto(`${base}/?n1=Aminata&n2=Ibrahima`, { waitUntil: 'domcontentloaded' })
  verifier(
    'l’accueil montre de vraies cartes',
    (await page.locator('img[src*="/vignette.png"]').count()) >= 3,
  )
  verifier(
    'les vignettes portent déjà les prénoms du visiteur',
    (await page.locator('img[src*="n1=Aminata"]').count()) >= 3,
  )

  await page.getByRole('link', { name: 'Les modèles' }).click()
  await page.waitForURL('**/modeles*')
  verifier('la galerie affiche le catalogue', (await page.locator('img[src*="/vignette.png"]').count()) > 8)

  await page.getByRole('link', { name: 'Mariage', exact: true }).click()
  await page.waitForURL('**type=mariage**')
  verifier('le filtre par type restreint le catalogue', (await page.locator('h1').innerText()) === 'Mariage')

  await page.getByRole('link', { name: 'Aidez-moi à choisir' }).click()
  await page.waitForURL('**/guide**')
  verifier('le guidage démarre', (await page.locator('h1').innerText()).length > 0)

  // Trois choix visuels mènent au style nommé.
  for (let etape = 0; etape < 4; etape += 1) {
    const suivante = page.locator('main a[href*="/guide?"]').first()
    if ((await suivante.count()) === 0) break
    await suivante.click()
    await page.waitForLoadState('domcontentloaded')
  }
  verifier(
    'le guidage aboutit à un style nommé',
    (await page.getByText('Votre style').count()) > 0,
  )

  await page.locator('main a[href*="/modeles/"]').first().click()
  await page.waitForURL('**/modeles/**')
  verifier(
    'la fiche modèle propose de personnaliser',
    (await page.getByRole('link', { name: 'Personnaliser ce modèle' }).count()) === 1,
  )
}

async function main(): Promise<void> {
  const navigateur = await chromium.launch({ channel: 'chrome' })
  const contexte = await navigateur.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'fr-FR',
    timezoneId: 'Africa/Dakar',
  })
  const page = await contexte.newPage()
  page.on('pageerror', (erreur) => {
    console.log(`✗ erreur JavaScript : ${erreur.message}`)
    echecs += 1
  })

  try {
    await parcours(page)
    await parcoursClient(page)
  } finally {
    await navigateur.close()
  }

  console.log(echecs === 0 ? '\nParcours invité et parcours client vérifiés.' : `\n${echecs} vérification(s) en échec.`)
  process.exit(echecs === 0 ? 0 : 1)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exit(1)
})

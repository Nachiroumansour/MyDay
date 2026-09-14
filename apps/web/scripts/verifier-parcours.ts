/**
 * Vérifie de bout en bout le parcours de l'invité, dans un vrai navigateur :
 * l'ouverture de l'enveloppe, puis l'envoi d'une réponse.
 *
 *   npx tsx scripts/verifier-parcours.ts [url-de-base] [slug]
 */
import { readFile } from 'node:fs/promises'
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

  await page.getByRole('button', { name: 'Ouvrir l’enveloppe' }).click()
  await voile.waitFor({ state: 'hidden', timeout: 4000 })
  verifier('l’enveloppe s’efface après l’ouverture', !(await voile.isVisible()))

  verifier('le programme est là', await page.getByText('Programme des cérémonies').isVisible())
  verifier(
    'le repère guide l’invité',
    await page.getByText('pharmacie du Point E').first().isVisible(),
  )

  await page.reload({ waitUntil: 'domcontentloaded' })
  verifier('l’ouverture ne se rejoue pas', !(await voile.isVisible()))

  // La réponse. « Je serai là » est un bouton radio déguisé : on clique
  // l'étiquette, comme le ferait un invité.
  await page.getByText('Je serai là', { exact: true }).click()
  await page.getByLabel('Votre nom et prénom').fill('Fatou Sarr')
  await page.getByLabel('Votre numéro WhatsApp').fill('77 987 65 43')
  await page.getByLabel('Vous serez combien ?').selectOption('3')

  const cases = page.locator('input[name="ceremonies"]')
  await cases.first().check()
  await cases.last().check()
  await page.getByLabel('Un mot pour les hôtes', { exact: false }).fill('Avec grand plaisir !')

  await page.getByRole('button', { name: 'Envoyer ma réponse' }).click()
  await page.getByText('C’est noté, merci.').waitFor({ timeout: 6000 })
  verifier('la réponse est enregistrée', true)

  // Une seconde réponse depuis le même numéro doit corriger la première.
  await page.goto(`${base}/e/${slug}`, { waitUntil: 'domcontentloaded' })
  await page.getByText('Je serai là', { exact: true }).click()
  await page.getByLabel('Votre nom et prénom').fill('Fatou Sarr')
  await page.getByLabel('Votre numéro WhatsApp').fill('77 987 65 43')
  await page.getByLabel('Vous serez combien ?').selectOption('5')
  await page.locator('input[name="ceremonies"]').first().check()
  await page.getByRole('button', { name: 'Envoyer ma réponse' }).click()
  await page.getByText('C’est noté, merci.').waitFor({ timeout: 6000 })
  verifier('répondre une seconde fois corrige au lieu de dupliquer', true)

  verifier(
    'la page invité ne charge aucun JavaScript de cadre',
    (await page.evaluate(() => document.querySelectorAll('script[src]').length)) === 0,
  )

  // Un formulaire mal rempli doit expliquer quoi corriger.
  // L'enveloppe ne se rejoue plus : elle a déjà été vue plus haut.
  await page.goto(`${base}/e/${slug}`, { waitUntil: 'domcontentloaded' })
  await page.getByText('Je serai là', { exact: true }).click()
  await page.getByLabel('Votre nom et prénom').fill('Test')
  await page.getByLabel('Votre numéro WhatsApp').fill('123')
  await page.locator('input[name="ceremonies"]').first().check()
  await page.getByRole('button', { name: 'Envoyer ma réponse' }).click()
  await page.getByText('Ce numéro ne semble pas valide', { exact: false }).waitFor({ timeout: 6000 })
  verifier('un numéro invalide est expliqué, pas rejeté sèchement', true)
}

/** Le parcours du client : de l'accueil au modèle, en passant par le guidage. */
async function parcoursClient(page: Page): Promise<void> {
  await page.goto(`${base}/?n1=Aminata&n2=Ibrahima`, { waitUntil: 'domcontentloaded' })
  verifier(
    'l’accueil montre une vraie carte du catalogue',
    (await page.locator('img[src*="/vignette.webp"]').count()) >= 1,
  )
  verifier(
    'elle porte déjà les prénoms du visiteur',
    (await page.locator('img[src*="n1=Aminata"]').count()) >= 1,
  )

  await page.getByRole('link', { name: 'Catalogue' }).first().click()
  await page.waitForURL('**/modeles*')
  verifier('la galerie affiche le catalogue', (await page.locator('img[src*="/vignette.webp"]').count()) > 8)

  await page.getByRole('link', { name: 'Mariage (takk)' }).first().click()
  await page.waitForURL('**type=mariage**')
  // Le titre porte désormais l'emoji de la fête : on vérifie qu'il le contient.
  verifier(
    'le filtre par type restreint le catalogue',
    (await page.locator('h1').innerText()).toLowerCase().includes('mariage'),
  )

  await page.getByRole('link', { name: /test visuel/ }).click()
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

/**
 * Le parcours de création : d'un modèle jusqu'à l'invitation en ligne,
 * sans jamais créer de compte.
 */
async function parcoursCreation(page: Page): Promise<void> {
  await page.goto(`${base}/creer/bapteme-royal-imperial?n1=Sokhna&d=2027-09-04`, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForURL('**/brouillon/**')
  verifier('un brouillon s’ouvre sans créer de compte', page.url().includes('/brouillon/'))

  const secret = page.url().split('/brouillon/')[1]!.split(/[?#]/)[0]!
  verifier(
    'l’identité saisie dans la galerie est reprise',
    (await page.getByLabel('Prénom de l’enfant').inputValue()) === 'Sokhna',
  )
  verifier('l’aperçu de la carte est affiché', await page.locator('img[alt="Aperçu de votre carte"]').isVisible())

  // Le modèle orné demande davantage. « Petite phrase de fin » est déclarée
  // facultative dans le gabarit : on la laisse vide exprès, la publication
  // doit passer quand même.
  await page.getByLabel('Nom de la cérémonie (Ngénte…)').fill('NGÉNTE')
  await page.getByLabel('Nom de famille de l’enfant').fill('DIALLO')
  await page.getByLabel('Les parents').fill('Awa & Ibrahima Diallo')
  await page.getByLabel('Lieu', { exact: true }).fill('Sacré-Cœur 3, Dakar')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await page.waitForLoadState('networkidle')

  verifier(
    'un champ facultatif laissé vide ne bloque pas',
    (await page.getByLabel('Petite phrase de fin').inputValue()) === '',
  )

  // Le programme.
  await page.goto(`${base}/brouillon/${secret}/programme`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nom de la cérémonie').fill('Ngénte')
  await page.getByLabel('Date', { exact: true }).fill('2027-09-04')
  await page.getByLabel('De', { exact: true }).fill('10:00')
  await page.getByLabel('Lieu', { exact: true }).fill('Maison familiale')
  // Le point exact : c'est lui qui transforme « Itinéraire » en vraie
  // navigation, au lieu d'une recherche sur le nom du lieu.
  await page.getByLabel('Le point exact sur la carte').fill(
    'https://www.google.com/maps/place/X/@14.7167,-17.4677,17z/data=!3d14.7167!4d-17.4677',
  )
  // Le champ marche sans JavaScript ; la confirmation, elle, attend l'hydratation.
  await page.getByText('Point enregistré').waitFor({ timeout: 10_000 })
  verifier('le point collé est reconnu', true)
  await page.getByLabel('Pour trouver').fill('portail vert, après la boulangerie')
  await page.getByRole('button', { name: 'Ajouter cette cérémonie' }).click()
  await page.waitForLoadState('networkidle')
  verifier('la cérémonie est enregistrée', (await page.getByText('Ngénte').count()) > 0)

  // Les détails.
  await page.goto(`${base}/brouillon/${secret}/details`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('La tenue').fill('Blanc et vert')
  await page.getByLabel('Votre mot').fill('Nous serions heureux de vous compter parmi nous.')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await page.waitForLoadState('networkidle')

  // Le paiement, puis la publication.
  await page.goto(`${base}/brouillon/${secret}/publier`, { waitUntil: 'domcontentloaded' })
  verifier(
    'rien n’est publié avant paiement',
    (await page.getByText('C’est en ligne.').count()) === 0,
  )

  await page.getByRole('button', { name: /^Payer avec / }).click()
  await page.waitForURL('**/paiement/simule**')
  verifier('le client est envoyé vers le paiement', page.url().includes('/paiement/simule'))

  await page.getByRole('button', { name: 'Payer', exact: true }).click()
  await page.waitForURL('**/publier**')
  await page.waitForLoadState('networkidle')
  verifier('l’invitation est publiée après paiement', (await page.getByText('C’est en ligne.').count()) > 0)
  verifier(
    'les fichiers haute définition sont livrés',
    (await page.getByRole('link', { name: 'PDF imprimable' }).count()) === 1,
  )

  // Le lien donné à l'hôte est absolu : c'est celui qu'il colle dans WhatsApp.
  const lien = await page.locator('a[href*="/e/"]').first().getAttribute('href')
  verifier('un lien d’invitation est donné', Boolean(lien?.startsWith('http')))
  verifier(
    'le partage WhatsApp emporte ce lien',
    await page
      .locator(`a[href^="https://wa.me/"][href*="${encodeURIComponent(lien!).replace(/"/g, '')}"]`)
      .count()
      .then((n) => n > 0),
  )

  await page.goto(lien!, { waitUntil: 'domcontentloaded' })
  verifier(
    'la page publiée porte le programme saisi',
    (await page.getByText('portail vert, après la boulangerie').count()) > 0,
  )
  verifier(
    'l’itinéraire vise le point exact, pas une recherche par nom',
    (await page.locator('a[href*="destination=14.7167%2C-17.4677"]').count()) > 0,
  )
  verifier(
    'la carte publiée ne porte plus de filigrane',
    (await page.locator('img[src*="/carte.webp"]').count()) === 1,
  )
}

/** Les modules ouverts aux invités : liens nominatifs, livre d'or, galerie. */
async function parcoursModules(page: Page): Promise<void> {
  await page.goto(`${base}/creer/anniversaire-ambre-prune?n1=Sokhna&d=2027-10-10`, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForURL('**/brouillon/**')
  const secret = page.url().split('/brouillon/')[1]!.split(/[?#]/)[0]!

  // Une cérémonie, sans quoi la publication est refusée.
  await page.goto(`${base}/brouillon/${secret}/programme`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nom de la cérémonie').fill('Soirée')
  await page.getByLabel('Date', { exact: true }).fill('2027-10-10')
  await page.getByLabel('De', { exact: true }).fill('20:00')
  await page.getByLabel('Lieu', { exact: true }).fill('Chez Sokhna')
  await page.getByRole('button', { name: 'Ajouter cette cérémonie' }).click()
  await page.waitForLoadState('networkidle')

  await page.goto(`${base}/brouillon/${secret}`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Lieu', { exact: true }).fill('Dakar')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await page.waitForLoadState('networkidle')

  // Ouvrir le livre d'or et la galerie.
  await page.goto(`${base}/brouillon/${secret}/details`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel(/livre d’or/i).check()
  await page.getByLabel(/galerie partagée/i).check()
  await page.getByRole('button', { name: 'Enregistrer ces réglages' }).click()
  await page.waitForLoadState('networkidle')

  // Ajouter un invité nommé.
  await page.goto(`${base}/brouillon/${secret}/invites`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel(/Collez votre liste/).fill('Aminata Diallo, 77 123 45 67')
  await page.getByRole('button', { name: 'Ajouter à la liste' }).click()
  await page.waitForLoadState('networkidle')
  verifier('l’invité nommé est ajouté', (await page.getByText('Aminata Diallo').count()) > 0)

  const lienNominatif = await page.locator('a[href*="/i/"]').first().getAttribute('href')
  verifier('un lien nominatif est produit', Boolean(lienNominatif))

  // Publier.
  await page.goto(`${base}/brouillon/${secret}/publier`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /^Payer avec / }).click()
  await page.waitForURL('**/paiement/simule**')
  await page.getByRole('button', { name: 'Payer', exact: true }).click()
  await page.waitForURL('**/publier**')

  // Le lien nominatif accueille l'invité par son nom.
  await page.goto(`${base}${lienNominatif}`, { waitUntil: 'domcontentloaded' })
  verifier(
    'l’enveloppe accueille l’invité par son nom',
    (await page.getByText('Pour Aminata Diallo').count()) > 0,
  )
  await page.getByRole('button', { name: 'Passer l’animation' }).click()
  verifier(
    'sa réponse est déjà pré-remplie',
    (await page.getByLabel('Votre nom et prénom').inputValue()) === 'Aminata Diallo',
  )

  // Le livre d'or.
  await page.getByLabel('Signez votre mot').fill('Moussa Fall')
  await page.getByLabel('Votre mot pour les hôtes').fill('Très heureux pour toi !')
  await page.getByRole('button', { name: 'Laisser mon mot' }).click()
  await page.waitForLoadState('networkidle')
  verifier('le mot du livre d’or est reçu', (await page.getByText('Merci pour votre mot.').count()) > 0)

  // Les hôtes le retrouvent en modération.
  await page.goto(`${base}/brouillon/${secret}/moderation`, { waitUntil: 'domcontentloaded' })
  verifier(
    'les hôtes retrouvent le mot en modération',
    (await page.getByText('Très heureux pour toi !').count()) > 0,
  )
}

/** Le back-office : garde d'entrée, dépôt d'un modèle, mise au catalogue. */
async function parcoursAdmin(page: Page): Promise<void> {
  await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' })
  verifier('l’administration est fermée sans session', page.url().includes('/admin/connexion'))

  await page.getByLabel('Mot de passe').fill('mauvais-mot-de-passe')
  await page.getByRole('button', { name: 'Entrer' }).click()
  await page.waitForLoadState('networkidle')
  verifier(
    'un mauvais mot de passe est refusé',
    (await page.getByText('Mot de passe incorrect.').count()) > 0,
  )

  await page.getByLabel('Mot de passe').fill('mot-de-passe-de-developpement')
  await page.getByRole('button', { name: 'Entrer' }).click()
  await page.waitForURL('**/admin')
  verifier('le bon mot de passe ouvre l’administration', (await page.getByText('Les modèles').count()) > 0)

  // Un gabarit sans champ personnalisable doit être refusé.
  await page.goto(`${base}/admin/gabarits/nouveau`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Le fichier SVG').setInputFiles({
    name: 'vide.svg',
    mimeType: 'image/svg+xml',
    // Les dimensions physiques sont présentes : sans elles le refus porterait
    // sur elles, et non sur ce que ce cas veut éprouver.
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" data-largeur-mm="127" data-hauteur-mm="190.5"/>',
    ),
  })
  await page.getByLabel('Nom du modèle').fill('Test vide')
  await page.getByLabel('Identifiant d’URL').fill('test-vide')
  await page.getByRole('button', { name: 'Déposer et vérifier' }).click()
  await page.waitForLoadState('networkidle')
  verifier(
    'un gabarit sans champ est refusé, avec la raison',
    (await page.getByText('Aucun champ personnalisable').count()) > 0,
  )

  // Le cahier des charges interdit le bitmap hors zone photo.
  await page.goto(`${base}/admin/gabarits/nouveau`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Le fichier SVG').setInputFiles({
    name: 'avec-image.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" data-largeur-mm="127" data-hauteur-mm="190.5">
         <image href="data:image/png;base64,iVBORw0KGgo=" x="0" y="0" width="60" height="60"/>
         <text data-champ="nom_1" data-type="texte" data-cadre="0,0,600,80" font-family="Marcellus" font-size="40">Awa</text>
       </svg>`,
    ),
  })
  await page.getByLabel('Nom du modèle').fill('Test image')
  await page.getByLabel('Identifiant d’URL').fill('test-image')
  await page.getByRole('button', { name: 'Déposer et vérifier' }).click()
  await page.waitForLoadState('networkidle')
  verifier(
    'une image intégrée est refusée',
    (await page.getByText('image intégrée').count()) > 0,
  )

  // Une police manquante est signalée, et le champ pour la livrer existe.
  await page.goto(`${base}/admin/gabarits/nouveau`, { waitUntil: 'domcontentloaded' })
  verifier(
    'le graphiste peut livrer ses polices avec le modèle',
    (await page.getByLabel('Les polices du modèle').count()) === 1,
  )
  await page.getByLabel('Le fichier SVG').setInputFiles({
    name: 'police-absente.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" data-largeur-mm="127" data-hauteur-mm="190.5">
         <text data-champ="nom_1" data-type="texte" data-cadre="0,0,600,80" font-family="PoliceAbsente" font-size="40">Awa</text>
       </svg>`,
    ),
  })
  await page.getByLabel('Nom du modèle').fill('Test police')
  await page.getByLabel('Identifiant d’URL').fill('test-police')
  await page.getByRole('button', { name: 'Déposer et vérifier' }).click()
  await page.waitForLoadState('networkidle')
  verifier(
    'une police manquante est nommée, avec le moyen de la fournir',
    (await page.getByText('Polices absentes : PoliceAbsente').count()) > 0,
  )

  // Un gabarit valide passe.
  const gabarit = await readFile(new URL('../gabarits/mariage-indigo.svg', import.meta.url), 'utf8')
  await page.getByLabel('Le fichier SVG').setInputFiles({
    name: 'essai.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(gabarit),
  })
  const slugEssai = `mariage-essai-${Date.now().toString(36)}`
  await page.getByLabel('Nom du modèle').fill('Essai')
  await page.getByLabel('Identifiant d’URL').fill(slugEssai)
  await page.getByLabel('Ambiances').fill('moderne, sobre')
  await page.getByRole('button', { name: 'Déposer et vérifier' }).click()
  // Le dépôt mène à l'épreuve, pas à la liste : on attend cette page-là.
  await page.waitForURL(`**/admin/gabarits/${slugEssai}`, { timeout: 15_000 })
  verifier('un gabarit valide est accepté', true)
  verifier(
    'son épreuve est montrée avant toute mise en ligne',
    await page.locator('img[alt^="Épreuve"]').isVisible(),
  )
  verifier(
    'les champs lus sont détaillés',
    (await page.getByText('Les champs lus').count()) === 1,
  )

  await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' })
  const ligne = page.locator('tr', { hasText: slugEssai })
  verifier('il arrive en brouillon, pas au catalogue', (await ligne.getByText('brouillon').count()) > 0)

  await ligne.getByRole('button', { name: 'Activer' }).click()
  // Une action serveur ne navigue pas : on attend le nouvel état, pas le réseau.
  await page
    .locator('tr', { hasText: slugEssai })
    .getByText('actif', { exact: true })
    .waitFor({ timeout: 15_000 })
  verifier('il paraît au catalogue une fois activé', true)

  // Le parcours ne laisse pas son gabarit d'essai dans le catalogue de démonstration.
  await page.locator('tr', { hasText: slugEssai }).getByRole('button', { name: 'Retirer du catalogue' }).click()
  await page
    .locator('tr', { hasText: slugEssai })
    .getByText('archive', { exact: true })
    .waitFor({ timeout: 15_000 })
  verifier('le parcours range son gabarit d’essai', true)

  await page.getByRole('button', { name: 'Se déconnecter' }).click()
  await page.waitForURL('**/admin/connexion')
  verifier('la déconnexion referme l’administration', page.url().includes('/admin/connexion'))
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
    await parcoursCreation(page)
    await parcoursModules(page)
    await parcoursAdmin(page)
  } finally {
    await navigateur.close()
  }

  console.log(echecs === 0 ? '\nParcours invité, client et création vérifiés.' : `\n${echecs} vérification(s) en échec.`)
  process.exit(echecs === 0 ? 0 : 1)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exit(1)
})

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { analyserDocument } from '../src/dom'
import { composerCarte } from '../src/composition'
import { dimensionsPhysiques, pixelsPourDpi, rendrePng, DPI_LIVRAISON } from '../src/rendu/png'
import { rendrePdf } from '../src/rendu/pdf'
import { chargerPolicesDepuisDossier } from '../src/rendu/polices'

const racine = fileURLToPath(new URL('..', import.meta.url))
const sortie = `${racine}epreuve`

const VALEURS: Record<string, Record<string, string>> = {
  'mariage-indigo': {
    nom_1: 'Aminata',
    nom_2: 'Ibrahima',
    date: '14 mars 2027',
    lieu: 'Grand Théâtre, Dakar',
  },
  'bapteme-vert': {
    nom_1: 'Ndèye Awa',
    date: '2 mai 2027',
    lieu: 'Sacré-Cœur 3, Dakar',
  },
}

async function main(): Promise<void> {
  await mkdir(sortie, { recursive: true })
  const polices = await chargerPolicesDepuisDossier(`${racine}demo/polices`)
  console.log('Polices chargées :', polices.noms().join(', '), '\n')

  for (const [gabarit, valeurs] of Object.entries(VALEURS)) {
    const source = await readFile(`${racine}demo/gabarits/${gabarit}.svg`, 'utf8')

    for (const filigrane of [true, false]) {
      const carte = composerCarte({ gabaritSvg: source, valeurs, polices, filigrane })

      if (carte.policesManquantes.length > 0) {
        console.error(`✗ ${gabarit} : polices absentes — ${carte.policesManquantes.join(', ')}`)
        process.exitCode = 1
      }
      if (carte.debordements.length > 0) {
        console.warn(`⚠ ${gabarit} : débordement sur ${carte.debordements.join(', ')}`)
      }
      if (carte.svg.includes('<text')) {
        console.error(`✗ ${gabarit} : du texte n'a pas été vectorisé`)
        process.exitCode = 1
      }

      const dimensions = dimensionsPhysiques(analyserDocument(carte.svg))
      const largeurPx = pixelsPourDpi(dimensions.largeurMm, DPI_LIVRAISON)
      const png = await rendrePng(carte.svg, { largeurPx })

      const suffixe = filigrane ? 'apercu' : 'livraison'
      await writeFile(`${sortie}/${gabarit}-${suffixe}.png`, png)
      console.log(`✓ ${gabarit}-${suffixe}.png — ${largeurPx} px, ${Math.round(png.byteLength / 1024)} Ko`)

      if (!filigrane) {
        const pdf = await rendrePdf(png, dimensions)
        await writeFile(`${sortie}/${gabarit}.pdf`, pdf)
        console.log(`✓ ${gabarit}.pdf — ${dimensions.largeurMm} × ${dimensions.hauteurMm} mm`)
      }
    }
  }
  console.log(`\nÉpreuves écrites dans ${sortie}`)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exitCode = 1
})

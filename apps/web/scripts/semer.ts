/**
 * Jeu de démonstration.
 *
 * Chaque dessin est décliné en plusieurs palettes : c'est la stratégie de
 * catalogue de la spec (§5.2) — un même gabarit sous quatre couleurs donne
 * quatre entrées visuellement distinctes, pour un travail bien moindre qu'un
 * nouveau modèle.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { analyserDocument, analyserGabarit } from '@myday/moteur'
import { bdd } from '../src/serveur/bdd/client'
import {
  ceremonies,
  evenements,
  gabarits,
  graphistes,
  invites,
  reponses,
} from '../src/serveur/bdd/schema'
import type { TypeEvenement } from '../src/lib/evenements'

const racine = fileURLToPath(new URL('..', import.meta.url))

interface Variante {
  suffixe: string
  nom: string
  couleur: string
  etiquettes: string[]
}

interface Modele {
  fichier: string
  type: TypeEvenement
  /** La couleur d'accent présente dans le fichier source. */
  couleurOrigine: string
  variantes: Variante[]
}

const MODELES: Modele[] = [
  {
    fichier: 'mariage-indigo',
    type: 'mariage',
    couleurOrigine: '#2C3A80',
    variantes: [
      { suffixe: 'indigo', nom: 'Indigo', couleur: '#2C3A80', etiquettes: ['moderne', 'sobre', 'profond'] },
      { suffixe: 'or', nom: 'Or brûlé', couleur: '#8A6D3B', etiquettes: ['traditionnel', 'dore', 'ornemente'] },
      { suffixe: 'terre', nom: 'Terre de Casamance', couleur: '#7A3B2E', etiquettes: ['traditionnel', 'profond', 'contraste'] },
      { suffixe: 'amande', nom: 'Amande', couleur: '#5F7A63', etiquettes: ['moderne', 'clair', 'floral'] },
      { suffixe: 'ardoise', nom: 'Ardoise', couleur: '#3D4450', etiquettes: ['moderne', 'sobre', 'contraste'] },
      { suffixe: 'poudre', nom: 'Poudré', couleur: '#A8626E', etiquettes: ['clair', 'pastel', 'floral'] },
    ],
  },
  {
    fichier: 'bapteme-vert',
    type: 'bapteme',
    couleurOrigine: '#1F6B4A',
    variantes: [
      { suffixe: 'feuille', nom: 'Feuille', couleur: '#1F6B4A', etiquettes: ['naturel', 'sobre', 'moderne'] },
      { suffixe: 'ciel', nom: 'Ciel', couleur: '#4A6FA5', etiquettes: ['clair', 'pastel', 'enfantin'] },
      { suffixe: 'sable', nom: 'Sable', couleur: '#8A7A5C', etiquettes: ['naturel', 'clair', 'traditionnel'] },
      { suffixe: 'rose', nom: 'Rose thé', couleur: '#B0707C', etiquettes: ['pastel', 'enfantin', 'clair'] },
      { suffixe: 'nuit', nom: 'Nuit douce', couleur: '#2F3B52', etiquettes: ['profond', 'sobre', 'moderne'] },
    ],
  },
  {
    fichier: 'anniversaire-ambre',
    type: 'anniversaire',
    couleurOrigine: '#C9700F',
    variantes: [
      { suffixe: 'ambre', nom: 'Ambre', couleur: '#C9700F', etiquettes: ['festif', 'contraste', 'moderne'] },
      { suffixe: 'prune', nom: 'Prune', couleur: '#6B3F6E', etiquettes: ['chic', 'profond', 'moderne'] },
      { suffixe: 'corail', nom: 'Corail', couleur: '#C4553D', etiquettes: ['festif', 'contraste'] },
      { suffixe: 'encre', nom: 'Encre', couleur: '#2B2B33', etiquettes: ['chic', 'sobre', 'profond'] },
      { suffixe: 'menthe', nom: 'Menthe', couleur: '#3E8C7A', etiquettes: ['clair', 'festif', 'pastel'] },
    ],
  },
]

async function main(): Promise<void> {
  // Table rase : le script doit pouvoir être relancé sans effet de bord.
  await bdd.delete(reponses)
  await bdd.delete(invites)
  await bdd.delete(ceremonies)
  await bdd.delete(evenements)
  await bdd.delete(gabarits)
  await bdd.delete(graphistes)

  const [atelier] = await bdd
    .insert(graphistes)
    .values({
      nom: 'Atelier Ndiaye',
      bio: 'Papeterie et calligraphie à Dakar depuis 2019.',
      contact: 'atelier@exemple.sn',
      partRevenu: '35.00',
    })
    .returning()

  const [studio] = await bdd
    .insert(graphistes)
    .values({
      nom: 'Studio Teranga',
      bio: 'Deux sœurs, un goût pour les motifs du bazin.',
      contact: 'studio@exemple.sn',
      partRevenu: '35.00',
    })
    .returning()

  const poses = new Map<string, string>()
  let alterne = 0

  for (const modele of MODELES) {
    const source = await readFile(`${racine}gabarits/${modele.fichier}.svg`, 'utf8')

    for (const variante of modele.variantes) {
      const svg = source.replaceAll(modele.couleurOrigine, variante.couleur)
      const champs = analyserGabarit(analyserDocument(svg))
      const slug = `${modele.type}-${variante.suffixe}`

      const [gabarit] = await bdd
        .insert(gabarits)
        .values({
          slug,
          nom: variante.nom,
          typeEvenement: modele.type,
          sourceSvg: svg,
          champs,
          etiquettes: variante.etiquettes,
          prix: 5000,
          statut: 'actif',
          nbVentes: Math.floor(Math.random() * 40),
          graphisteId: (alterne++ % 2 === 0 ? atelier! : studio!).id,
        })
        .returning()

      poses.set(slug, gabarit!.id)
      console.log(`✓ ${slug} — ${champs.length} champs`)
    }
  }

  const [evenement] = await bdd
    .insert(evenements)
    .values({
      slug: 'aminata-ibrahima',
      secretBrouillon: crypto.randomUUID(),
      titre: 'Aminata & Ibrahima',
      typeEvenement: 'mariage',
      gabaritId: poses.get('mariage-indigo')!,
      valeursChamps: {
        nom_1: 'Aminata',
        nom_2: 'Ibrahima',
        date: '14 mars 2027',
        lieu: 'Grand Théâtre, Dakar',
      },
      codeVestimentaire: 'Bazin et tons indigo',
      motDesHotes:
        'Nous serions honorés de vous compter parmi nous pour célébrer notre union. Votre présence est le plus beau des cadeaux.',
      telephoneHote: '+221771234567',
      statut: 'publie',
      publieLe: new Date(),
    })
    .returning()

  await bdd.insert(ceremonies).values([
    {
      evenementId: evenement!.id,
      rang: 1,
      nom: 'Ngénte',
      debuteLe: new Date('2027-03-13T10:00:00Z'),
      termineLe: new Date('2027-03-13T13:00:00Z'),
      lieu: 'Maison familiale Diallo',
      adresse: 'Rue 10 × Boulevard du Sud, Dakar',
      repere: 'juste après la pharmacie du Point E, portail bleu',
      latitude: 14.6928,
      longitude: -17.4635,
      codeVestimentaire: 'Blanc',
      note: 'La cérémonie traditionnelle, en petit comité familial.',
    },
    {
      evenementId: evenement!.id,
      rang: 2,
      nom: 'Takk',
      debuteLe: new Date('2027-03-14T11:00:00Z'),
      termineLe: new Date('2027-03-14T13:30:00Z'),
      lieu: 'Grande Mosquée de Dakar',
      adresse: 'Allées Papa Guèye Fall, Dakar',
      repere: 'entrée côté Allées, parking en face du marché',
      latitude: 14.6742,
      longitude: -17.4381,
      codeVestimentaire: 'Tenue de cérémonie',
    },
    {
      evenementId: evenement!.id,
      rang: 3,
      nom: 'Réception',
      debuteLe: new Date('2027-03-14T19:00:00Z'),
      termineLe: new Date('2027-03-15T02:00:00Z'),
      lieu: 'Grand Théâtre National',
      adresse: 'Boulevard Martin Luther King, Dakar',
      repere: 'en face de la corniche, après le monument',
      latitude: 14.6667,
      longitude: -17.4408,
      codeVestimentaire: 'Bazin et tons indigo',
      note: 'Dîner, orchestre et danse jusqu’au bout de la nuit.',
    },
  ])

  console.log(`\n✓ ${poses.size} modèles, événement publié : /e/${evenement!.slug}`)
  process.exit(0)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exit(1)
})

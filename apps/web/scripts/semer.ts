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
  /** La couleur qui représente la variante dans le catalogue. */
  couleur: string
  /**
   * Les teintes à substituer dans le fichier source. Un modèle orné en
   * compte plusieurs — l'encre, mais aussi les pétales — là où un modèle
   * épuré n'en a qu'une.
   */
  remplacements: Record<string, string>
  etiquettes: string[]
}

interface Modele {
  fichier: string
  type: TypeEvenement
  variantes: Variante[]
}

/** L'encre des modèles ornés, et le blanc crème de leurs roses. */
const ENCRE = '#1F4A32'
const PETALE = { clair: '#FFFFFF', moyen: '#FBF6EA', fonce: '#E6DCC6', trait: '#D9CEB4' }

function roses(clair: string, moyen: string, fonce: string, trait: string): Record<string, string> {
  return {
    [PETALE.clair]: clair,
    [PETALE.moyen]: moyen,
    [PETALE.fonce]: fonce,
    [PETALE.trait]: trait,
  }
}

const ROSES_BLANCHES: Record<string, string> = {}
const ROSES_POUDREES = roses('#FFFAF8', '#FBECE9', '#EAD3CE', '#DCC0BA')
const ROSES_CHAMPAGNE = roses('#FFFDF6', '#FAF1DC', '#E9D9B4', '#D8C69C')

/** Les variantes ornées : l'encre change, l'or reste. */
function ornees(): Variante[] {
  return [
    {
      suffixe: 'imperial',
      nom: 'Vert impérial',
      couleur: ENCRE,
      remplacements: { [ENCRE]: ENCRE, ...ROSES_BLANCHES },
      etiquettes: ['traditionnel', 'dore', 'ornemente'],
    },
    {
      suffixe: 'bordeaux',
      nom: 'Bordeaux',
      couleur: '#6E2233',
      remplacements: { [ENCRE]: '#6E2233', ...ROSES_POUDREES },
      etiquettes: ['traditionnel', 'ornemente', 'profond'],
    },
    {
      suffixe: 'nuit',
      nom: 'Bleu nuit',
      couleur: '#1E2F52',
      remplacements: { [ENCRE]: '#1E2F52', ...ROSES_BLANCHES },
      etiquettes: ['traditionnel', 'ornemente', 'sobre'],
    },
    {
      suffixe: 'casamance',
      nom: 'Terre de Casamance',
      couleur: '#7A3B2E',
      remplacements: { [ENCRE]: '#7A3B2E', ...ROSES_CHAMPAGNE },
      etiquettes: ['traditionnel', 'dore', 'contraste'],
    },
    {
      suffixe: 'ivoire',
      nom: 'Or et ivoire',
      couleur: '#6B5320',
      remplacements: { [ENCRE]: '#6B5320', ...ROSES_CHAMPAGNE },
      etiquettes: ['dore', 'ornemente', 'clair'],
    },
  ]
}

const MODELES: Modele[] = [
  { fichier: 'mariage-royal', type: 'mariage', variantes: ornees() },
  { fichier: 'bapteme-royal', type: 'bapteme', variantes: ornees() },
  { fichier: 'anniversaire-royal', type: 'anniversaire', variantes: ornees() },

  // Les modèles épurés restent : sans eux, le guide n'aurait plus rien à
  // proposer à qui cherche « moderne » ou « sobre ».
  {
    fichier: 'mariage-indigo',
    type: 'mariage',
    variantes: [
      { suffixe: 'indigo', nom: 'Indigo', couleur: '#2C3A80', remplacements: { '#2C3A80': '#2C3A80' }, etiquettes: ['moderne', 'sobre', 'profond'] },
      { suffixe: 'amande', nom: 'Amande', couleur: '#5F7A63', remplacements: { '#2C3A80': '#5F7A63' }, etiquettes: ['moderne', 'clair', 'floral'] },
      { suffixe: 'ardoise', nom: 'Ardoise', couleur: '#3D4450', remplacements: { '#2C3A80': '#3D4450' }, etiquettes: ['moderne', 'sobre', 'contraste'] },
      { suffixe: 'poudre', nom: 'Poudré', couleur: '#A8626E', remplacements: { '#2C3A80': '#A8626E' }, etiquettes: ['clair', 'pastel', 'floral'] },
    ],
  },
  {
    fichier: 'bapteme-vert',
    type: 'bapteme',
    variantes: [
      { suffixe: 'feuille', nom: 'Feuille', couleur: '#1F6B4A', remplacements: { '#1F6B4A': '#1F6B4A' }, etiquettes: ['naturel', 'sobre', 'moderne'] },
      { suffixe: 'ciel', nom: 'Ciel', couleur: '#4A6FA5', remplacements: { '#1F6B4A': '#4A6FA5' }, etiquettes: ['clair', 'pastel', 'enfantin'] },
      { suffixe: 'sable', nom: 'Sable', couleur: '#8A7A5C', remplacements: { '#1F6B4A': '#8A7A5C' }, etiquettes: ['naturel', 'clair', 'traditionnel'] },
      { suffixe: 'rose', nom: 'Rose thé', couleur: '#B0707C', remplacements: { '#1F6B4A': '#B0707C' }, etiquettes: ['pastel', 'enfantin', 'clair'] },
    ],
  },
  {
    fichier: 'anniversaire-ambre',
    type: 'anniversaire',
    variantes: [
      { suffixe: 'ambre', nom: 'Ambre', couleur: '#C9700F', remplacements: { '#C9700F': '#C9700F' }, etiquettes: ['festif', 'contraste', 'moderne'] },
      { suffixe: 'prune', nom: 'Prune', couleur: '#6B3F6E', remplacements: { '#C9700F': '#6B3F6E' }, etiquettes: ['chic', 'profond', 'moderne'] },
      { suffixe: 'encre', nom: 'Encre', couleur: '#2B2B33', remplacements: { '#C9700F': '#2B2B33' }, etiquettes: ['chic', 'sobre', 'profond'] },
      { suffixe: 'menthe', nom: 'Menthe', couleur: '#3E8C7A', remplacements: { '#C9700F': '#3E8C7A' }, etiquettes: ['clair', 'festif', 'pastel'] },
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
      let svg = source
      for (const [avant, apres] of Object.entries(variante.remplacements)) {
        if (avant !== apres) svg = svg.replaceAll(avant, apres)
      }
      const champs = analyserGabarit(analyserDocument(svg))
      // Le suffixe seul ne suffit plus : orné et épuré partagent les types.
      const slug = `${modele.fichier}-${variante.suffixe}`

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
      gabaritId: poses.get('mariage-royal-imperial')!,
      valeursChamps: {
        ceremonie: 'TAK DIACKA',
        nom_1: 'Aminata',
        famille_1: 'DIALLO',
        nom_2: 'Ibrahima',
        famille_2: 'NDIAYE',
        date: '14 mars 2027',
        lieu: 'GRAND THÉÂTRE, DAKAR',
        mot_final: 'Unis pour la vie',
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

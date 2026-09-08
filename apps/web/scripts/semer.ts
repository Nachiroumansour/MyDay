/**
 * Jeu de démonstration : un graphiste, deux gabarits, et un mariage publié à
 * trois cérémonies — de quoi voir la page invité en vrai.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { analyserDocument, analyserGabarit } from '@myday/moteur'
import { bdd } from '../src/serveur/bdd/client'
import { ceremonies, evenements, gabarits, graphistes, invites, reponses } from '../src/serveur/bdd/schema'

const racine = fileURLToPath(new URL('..', import.meta.url))

async function main(): Promise<void> {
  // Table rase : le script doit pouvoir être relancé sans effet de bord.
  await bdd.delete(reponses)
  await bdd.delete(invites)
  await bdd.delete(ceremonies)
  await bdd.delete(evenements)
  await bdd.delete(gabarits)
  await bdd.delete(graphistes)

  const [graphiste] = await bdd
    .insert(graphistes)
    .values({
      nom: 'Atelier Ndiaye',
      bio: 'Papeterie et calligraphie à Dakar depuis 2019.',
      contact: 'atelier@exemple.sn',
      partRevenu: '35.00',
    })
    .returning()

  const modeles = [
    { fichier: 'mariage-indigo', nom: 'Indigo', type: 'mariage' as const, etiquettes: ['moderne', 'sobre'] },
    { fichier: 'bapteme-vert', nom: 'Feuille', type: 'bapteme' as const, etiquettes: ['doux', 'naturel'] },
  ]

  const poses = []
  for (const modele of modeles) {
    const svg = await readFile(`${racine}gabarits/${modele.fichier}.svg`, 'utf8')
    const champs = analyserGabarit(analyserDocument(svg))
    const [gabarit] = await bdd
      .insert(gabarits)
      .values({
        slug: modele.fichier,
        nom: modele.nom,
        typeEvenement: modele.type,
        sourceSvg: svg,
        champs,
        etiquettes: modele.etiquettes,
        prix: 5000,
        statut: 'actif',
        graphisteId: graphiste!.id,
      })
      .returning()
    poses.push(gabarit!)
    console.log(`✓ gabarit ${modele.nom} — ${champs.length} champs`)
  }

  const [evenement] = await bdd
    .insert(evenements)
    .values({
      slug: 'aminata-ibrahima',
      secretBrouillon: crypto.randomUUID(),
      titre: 'Aminata & Ibrahima',
      typeEvenement: 'mariage',
      gabaritId: poses[0]!.id,
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

  console.log(`\n✓ événement publié : /e/${evenement!.slug}`)
  process.exit(0)
}

main().catch((erreur) => {
  console.error(erreur)
  process.exit(1)
})

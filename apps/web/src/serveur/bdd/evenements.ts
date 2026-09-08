import { and, asc, eq } from 'drizzle-orm'
import { bdd } from './client'
import { ceremonies, evenements, gabarits, reponses } from './schema'

export interface CeremonieVue {
  id: string
  rang: number
  nom: string
  debuteLe: Date
  termineLe: Date | null
  lieu: string
  adresse: string | null
  repere: string | null
  latitude: number | null
  longitude: number | null
  codeVestimentaire: string | null
  note: string | null
}

export interface EvenementVue {
  id: string
  slug: string
  titre: string
  typeEvenement: 'mariage' | 'bapteme' | 'anniversaire'
  codeVestimentaire: string | null
  motDesHotes: string | null
  photoUrl: string | null
  telephoneHote: string | null
  ceremonies: CeremonieVue[]
  gabarit: { sourceSvg: string; nom: string }
  valeursChamps: Record<string, string>
  recadrage: { zoom: number; focaleX: number; focaleY: number } | null
}

/**
 * L'événement tel que le voit un invité. Ne renvoie rien tant qu'il n'est pas
 * publié : un brouillon ne doit pas être atteignable par son slug.
 */
export async function evenementPublie(slug: string): Promise<EvenementVue | undefined> {
  const [ligne] = await bdd
    .select({
      id: evenements.id,
      slug: evenements.slug,
      titre: evenements.titre,
      typeEvenement: evenements.typeEvenement,
      codeVestimentaire: evenements.codeVestimentaire,
      motDesHotes: evenements.motDesHotes,
      photoUrl: evenements.photoUrl,
      telephoneHote: evenements.telephoneHote,
      valeursChamps: evenements.valeursChamps,
      recadrage: evenements.recadrage,
      gabaritSvg: gabarits.sourceSvg,
      gabaritNom: gabarits.nom,
    })
    .from(evenements)
    .innerJoin(gabarits, eq(gabarits.id, evenements.gabaritId))
    .where(and(eq(evenements.slug, slug), eq(evenements.statut, 'publie')))
    .limit(1)

  if (!ligne) return undefined

  const programme = await bdd
    .select()
    .from(ceremonies)
    .where(eq(ceremonies.evenementId, ligne.id))
    .orderBy(asc(ceremonies.rang))

  return {
    id: ligne.id,
    slug: ligne.slug,
    titre: ligne.titre,
    typeEvenement: ligne.typeEvenement,
    codeVestimentaire: ligne.codeVestimentaire,
    motDesHotes: ligne.motDesHotes,
    photoUrl: ligne.photoUrl,
    telephoneHote: ligne.telephoneHote,
    ceremonies: programme,
    gabarit: { sourceSvg: ligne.gabaritSvg, nom: ligne.gabaritNom },
    valeursChamps: (ligne.valeursChamps ?? {}) as Record<string, string>,
    recadrage: ligne.recadrage as EvenementVue['recadrage'],
  }
}

export interface NouvelleReponse {
  evenementId: string
  nom: string
  telephone: string
  present: boolean
  nbPersonnes: number
  ceremonieIds: string[]
  message?: string
}

export async function enregistrerReponse(entree: NouvelleReponse): Promise<void> {
  await bdd.insert(reponses).values({
    evenementId: entree.evenementId,
    nom: entree.nom,
    telephone: entree.telephone,
    present: entree.present,
    nbPersonnes: entree.nbPersonnes,
    ceremonieIds: entree.ceremonieIds,
    message: entree.message ?? null,
  })
}

/**
 * Un événement publié quelconque, pour montrer à un client ce que reçoivent
 * ses invités avant qu'il n'ait rien créé.
 */
export async function evenementVitrine(): Promise<{ slug: string } | undefined> {
  const [ligne] = await bdd
    .select({ slug: evenements.slug })
    .from(evenements)
    .where(eq(evenements.statut, 'publie'))
    .orderBy(asc(evenements.creeLe))
    .limit(1)
  return ligne
}

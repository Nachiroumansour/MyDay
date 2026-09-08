'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { analyserDocument, analyserGabarit, composerCarte, ErreurGabarit } from '@myday/moteur'
import { estTypeEvenement } from '@/lib/evenements'
import { exigerAdmin, fermerSessionAdmin } from '@/serveur/admin'
import {
  changerStatutGabarit,
  creerGraphiste,
  deposerGabarit,
  slugGabaritLibre,
} from '@/serveur/bdd/admin'
import { polices } from '@/serveur/polices'

function texte(donnees: FormData, cle: string): string {
  return String(donnees.get(cle) ?? '').trim()
}

export async function sortir(): Promise<void> {
  await fermerSessionAdmin()
  redirect('/admin/connexion')
}

export async function ajouterCreateur(donnees: FormData): Promise<void> {
  await exigerAdmin()
  const nom = texte(donnees, 'nom')
  const contact = texte(donnees, 'contact')
  if (nom === '' || contact === '') redirect('/admin/createurs?erreur=incomplet')

  const part = Number(texte(donnees, 'partRevenu') || '35')
  await creerGraphiste({
    nom,
    bio: texte(donnees, 'bio') || null,
    contact,
    partRevenu: (Number.isFinite(part) && part >= 0 && part <= 100 ? part : 35).toFixed(2),
  })
  revalidatePath('/admin/createurs')
}

export async function basculerGabarit(donnees: FormData): Promise<void> {
  await exigerAdmin()
  const statut = texte(donnees, 'statut')
  if (statut !== 'actif' && statut !== 'brouillon' && statut !== 'archive') return
  await changerStatutGabarit(texte(donnees, 'gabaritId'), statut)
  revalidatePath('/admin')
}

/**
 * Dépôt d'un gabarit.
 *
 * Un modèle qui ne se rend pas correctement ne peut pas être déposé : on
 * l'analyse, on le compose avec des valeurs d'exemple, et on refuse si une
 * police manque ou si un champ est mal déclaré. Le graphiste voit le problème
 * tout de suite, sans nous attendre.
 */
export async function televerserGabarit(donnees: FormData): Promise<void> {
  await exigerAdmin()

  const fichier = donnees.get('svg')
  const nom = texte(donnees, 'nom')
  const slug = texte(donnees, 'slug').toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  const typeBrut = texte(donnees, 'typeEvenement')
  const graphisteId = texte(donnees, 'graphisteId')

  // L'annotation sur la variable — et non seulement sur le retour — est ce qui
  // permet à TypeScript de tenir compte du fait que cette fonction ne rend
  // jamais la main.
  const refuser: (message: string) => never = (message) =>
    redirect(`/admin/gabarits/nouveau?erreur=${encodeURIComponent(message)}`)

  if (!(fichier instanceof File) || fichier.size === 0) refuser('Choisissez un fichier SVG.')
  if (nom === '' || slug === '') refuser('Le nom et l’identifiant sont obligatoires.')
  if (!estTypeEvenement(typeBrut)) refuser('Choisissez un type d’événement.')
  if (graphisteId === '') refuser('Choisissez un créateur.')

  if (!(await slugGabaritLibre(slug))) {
    refuser(`L’identifiant « ${slug} » est déjà pris. Choisissez-en un autre.`)
  }

  const source = await (fichier as File).text()
  if (!source.includes('<svg')) refuser('Ce fichier n’est pas un SVG.')

  let champs
  try {
    champs = analyserGabarit(analyserDocument(source))
  } catch (erreur) {
    refuser(erreur instanceof ErreurGabarit ? erreur.message : 'Ce gabarit est illisible.')
  }

  if (champs!.length === 0) {
    refuser('Aucun champ personnalisable trouvé. Ajoutez data-champ sur les éléments à remplir.')
  }

  // L'épreuve : le gabarit doit se composer sans police manquante.
  const essai = composerCarte({
    gabaritSvg: source,
    valeurs: { nom_1: 'Aminata', nom_2: 'Ibrahima', date: '14 mars 2027', lieu: 'Dakar' },
    polices: await polices(),
  })

  if (essai.policesManquantes.length > 0) {
    refuser(
      `Polices absentes : ${essai.policesManquantes.join(', ')}. Déposez les fichiers dans le dossier des polices.`,
    )
  }

  const prix = Number(texte(donnees, 'prix') || '5000')

  await deposerGabarit({
    slug,
    nom,
    typeEvenement: typeBrut,
    sourceSvg: source,
    champs: champs!,
    etiquettes: texte(donnees, 'etiquettes')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    prix: Number.isFinite(prix) && prix > 0 ? Math.round(prix) : 5000,
    graphisteId,
  })

  revalidatePath('/admin')
  redirect('/admin?depose=1')
}

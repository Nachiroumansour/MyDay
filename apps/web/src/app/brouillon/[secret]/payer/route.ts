import { redirect } from 'next/navigation'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { ouvrirPaiement, paiementReussiPour } from '@/serveur/bdd/paiements'
import { fournisseurParNom } from '@/serveur/paiement'
import { ErreurPaiement } from '@/serveur/paiement/fournisseur'
import { origine } from '@/serveur/origine'

/**
 * Ouvre une session de paiement chez le fournisseur choisi et y envoie le
 * client. Rien n'est publié ici : la publication attend la confirmation
 * authentifiée du webhook.
 */
export async function POST(
  requete: Request,
  { params }: { params: Promise<{ secret: string }> },
) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) redirect('/modeles')

  const donnees = await requete.formData()
  const fournisseur = fournisseurParNom(String(donnees.get('fournisseur') ?? ''))
  if (!fournisseur) redirect(`/brouillon/${secret}/publier?erreur=fournisseur`)

  // Un client qui a déjà payé ne repaie pas.
  if (await paiementReussiPour(brouillon.id)) {
    redirect(`/brouillon/${secret}/publier?publie=1`)
  }

  const base = origine(requete)

  let session
  try {
    session = await fournisseur.ouvrirSession({
      reference: brouillon.id,
      montant: brouillon.gabarit.prix,
      devise: 'XOF',
      intitule: `Invitation ${brouillon.titre}`,
      urlSucces: `${base}/brouillon/${secret}/publier?retour=succes`,
      urlEchec: `${base}/brouillon/${secret}/publier?retour=echec`,
    })
  } catch (erreur) {
    const message =
      erreur instanceof ErreurPaiement
        ? erreur.message
        : 'Le paiement n’a pas pu démarrer. Réessayez dans un instant.'
    redirect(`/brouillon/${secret}/publier?erreur=${encodeURIComponent(message)}`)
  }

  await ouvrirPaiement({
    evenementId: brouillon.id,
    fournisseur: fournisseur.nom,
    reference: session.reference,
    montant: brouillon.gabarit.prix,
    devise: 'XOF',
    urlPaiement: session.urlPaiement,
    charge: session.charge,
  })

  redirect(session.urlPaiement)
}

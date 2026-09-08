import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { bdd } from '@/serveur/bdd/client'
import { evenements } from '@/serveur/bdd/schema'
import { confirmerPaiement, paiementParReference } from '@/serveur/bdd/paiements'
import { confirmerParticipation } from '@/serveur/bdd/modules'
import { livrerApresPaiement } from '@/serveur/livraison'
import { fournisseurParNom } from '@/serveur/paiement'
import { origine } from '@/serveur/origine'
import { eq } from 'drizzle-orm'

/** Les webhooks ne se mettent jamais en cache. */
export const dynamic = 'force-dynamic'

/**
 * Réception des confirmations de paiement.
 *
 * Deux garde-fous. La signature est vérifiée avant toute écriture : sans elle,
 * n'importe qui pourrait déclarer un paiement réussi. Et la confirmation est
 * idempotente : les fournisseurs rejouent leurs webhooks, une seconde
 * confirmation ne doit ni republier ni relivrer.
 */
export async function POST(
  requete: Request,
  { params }: { params: Promise<{ fournisseur: string }> },
) {
  const { fournisseur: nom } = await params
  const fournisseur = fournisseurParNom(nom.replace('-', '_'))
  if (!fournisseur) return new Response('Fournisseur inconnu', { status: 404 })

  const corps = await requete.text()
  const evenement = fournisseur.lireWebhook(corps, requete.headers)

  // Signature invalide ou charge illisible : on ne dit pas laquelle.
  if (!evenement) return new Response('Refusé', { status: 400 })
  if (evenement.statut === 'ignore') return new Response('Ignoré', { status: 200 })

  // Une participation à une cagnotte n'entraîne ni publication ni livraison :
  // elle est simplement confirmée.
  const participation = await confirmerParticipation(evenement.reference, evenement.statut)
  if (participation) return new Response('Reçu', { status: 200 })

  const paiement = await paiementParReference(evenement.reference)
  if (!paiement) return new Response('Paiement inconnu', { status: 404 })

  const premiere = await confirmerPaiement(evenement.reference, evenement.statut, evenement.charge)
  if (!premiere || evenement.statut !== 'reussi') {
    return new Response('Déjà traité', { status: 200 })
  }

  const [ligne] = await bdd
    .select({ secret: evenements.secretBrouillon })
    .from(evenements)
    .where(eq(evenements.id, paiement.evenementId))
    .limit(1)

  if (ligne && (await brouillonParSecret(ligne.secret))) {
    await livrerApresPaiement(ligne.secret, origine(requete))
  }

  return new Response('Reçu', { status: 200 })
}

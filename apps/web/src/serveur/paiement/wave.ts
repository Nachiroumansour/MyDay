import { montantEnUnitesFournisseur } from './montant'
import { signatureValide } from './signature'
import {
  ErreurPaiement,
  type DemandePaiement,
  type EvenementWebhook,
  type FournisseurPaiement,
  type SessionPaiement,
} from './fournisseur'

/**
 * Wave Mobile Money.
 *
 * Wave ouvre une session de paiement, redirige le client vers son application,
 * puis notifie notre webhook. La signature du webhook est un HMAC-SHA256 avec
 * un secret distinct de la clé d'API.
 *
 * Non vérifié en conditions réelles : l'accès marchand exige un KYC entreprise
 * et une homologation. Le bac à sable de Wave accepte les numéros de test
 * +221 70 000 00 00 (succès), 01 (échec) et 02 (expiration).
 */
const BASE = process.env.WAVE_API_BASE ?? 'https://api.wave.com/v1'

interface SessionWave {
  id: string
  wave_launch_url: string
  checkout_status?: string
  client_reference?: string
}

export const wave: FournisseurPaiement = {
  nom: 'wave',
  libelle: 'Wave',

  configure() {
    return Boolean(process.env.WAVE_CLE_API && process.env.WAVE_SECRET_WEBHOOK)
  },

  async ouvrirSession(demande: DemandePaiement): Promise<SessionPaiement> {
    const reponse = await fetch(`${BASE}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WAVE_CLE_API}`,
        'Content-Type': 'application/json',
        // Rejouer la même demande ne doit pas créer deux sessions.
        'Idempotency-Key': demande.reference,
      },
      body: JSON.stringify({
        amount: montantEnUnitesFournisseur(demande.montant, demande.devise),
        currency: demande.devise,
        error_url: demande.urlEchec,
        success_url: demande.urlSucces,
        client_reference: demande.reference,
      }),
    })

    if (!reponse.ok) {
      throw new ErreurPaiement(
        `Wave a refusé la session (${reponse.status}) : ${await reponse.text()}`,
      )
    }

    const session = (await reponse.json()) as SessionWave
    return { reference: session.id, urlPaiement: session.wave_launch_url, charge: session }
  },

  lireWebhook(corps: string, entetes: Headers): EvenementWebhook | undefined {
    const signature = entetes.get('wave-signature') ?? entetes.get('x-wave-signature')
    if (!signatureValide(corps, signature, process.env.WAVE_SECRET_WEBHOOK)) return undefined

    const charge = JSON.parse(corps) as { type?: string; data?: SessionWave }
    const session = charge.data
    if (!session?.id) return undefined

    const statut =
      charge.type === 'checkout.session.completed' && session.checkout_status !== 'expired'
        ? 'reussi'
        : charge.type === 'checkout.session.payment_failed'
          ? 'echoue'
          : 'ignore'

    return { reference: session.id, statut, charge }
  },
}

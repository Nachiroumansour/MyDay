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
 * Orange Money — API Web Payment.
 *
 * Le parcours diffère de Wave : on obtient d'abord un jeton OAuth, puis on
 * ouvre une transaction qui renvoie une URL de paiement. Le client valide par
 * un code à usage unique généré depuis le menu Orange Money.
 *
 * Non vérifié en conditions réelles : l'accès marchand passe par l'opérateur
 * local et une homologation.
 */
const BASE = process.env.ORANGE_API_BASE ?? 'https://api.orange.com'

interface TransactionOrange {
  pay_token: string
  payment_url: string
  notif_token?: string
}

async function jeton(): Promise<string> {
  const identifiants = Buffer.from(
    `${process.env.ORANGE_ID_CLIENT}:${process.env.ORANGE_SECRET_CLIENT}`,
  ).toString('base64')

  const reponse = await fetch(`${BASE}/oauth/v3/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${identifiants}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!reponse.ok) {
    throw new ErreurPaiement(`Orange Money a refusé l’authentification (${reponse.status}).`)
  }

  return ((await reponse.json()) as { access_token: string }).access_token
}

export const orangeMoney: FournisseurPaiement = {
  nom: 'orange_money',
  libelle: 'Orange Money',

  configure() {
    return Boolean(
      process.env.ORANGE_ID_CLIENT &&
        process.env.ORANGE_SECRET_CLIENT &&
        process.env.ORANGE_CLE_MARCHAND &&
        process.env.ORANGE_SECRET_WEBHOOK,
    )
  },

  async ouvrirSession(demande: DemandePaiement): Promise<SessionPaiement> {
    const reponse = await fetch(`${BASE}/orange-money-webpay/dev/v1/webpayment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await jeton()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_key: process.env.ORANGE_CLE_MARCHAND,
        currency: demande.devise,
        order_id: demande.reference,
        amount: Number(montantEnUnitesFournisseur(demande.montant, demande.devise)),
        return_url: demande.urlSucces,
        cancel_url: demande.urlEchec,
        notif_url: `${new URL(demande.urlSucces).origin}/webhooks/orange-money`,
        lang: 'fr',
        reference: demande.intitule,
      }),
    })

    if (!reponse.ok) {
      throw new ErreurPaiement(
        `Orange Money a refusé la transaction (${reponse.status}) : ${await reponse.text()}`,
      )
    }

    const transaction = (await reponse.json()) as TransactionOrange
    return {
      reference: transaction.pay_token,
      urlPaiement: transaction.payment_url,
      charge: transaction,
    }
  },

  lireWebhook(corps: string, entetes: Headers): EvenementWebhook | undefined {
    const signature = entetes.get('x-orange-signature') ?? entetes.get('x-signature')
    if (!signatureValide(corps, signature, process.env.ORANGE_SECRET_WEBHOOK)) return undefined

    const charge = JSON.parse(corps) as { status?: string; pay_token?: string }
    if (!charge.pay_token) return undefined

    const statut =
      charge.status === 'SUCCESS'
        ? 'reussi'
        : charge.status === 'FAILED'
          ? 'echoue'
          : charge.status === 'CANCELLED'
            ? 'annule'
            : 'ignore'

    return { reference: charge.pay_token, statut, charge }
  },
}

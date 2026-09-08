import { signatureValide } from './signature'
import type {
  DemandePaiement,
  EvenementWebhook,
  FournisseurPaiement,
  SessionPaiement,
} from './fournisseur'

/**
 * Fournisseur de développement.
 *
 * Il rejoue le parcours complet — session, redirection, webhook signé — sans
 * argent réel, pour que le reste du produit soit exerçable avant l'obtention
 * des accès marchands. Il n'est disponible qu'en dehors de la production.
 */
export const SECRET_SIMULE = 'secret-de-developpement'

export const simule: FournisseurPaiement = {
  nom: 'simule',
  libelle: 'Paiement simulé (développement)',

  configure() {
    return process.env.NODE_ENV !== 'production' || process.env.PAIEMENT_SIMULE === '1'
  },

  async ouvrirSession(demande: DemandePaiement): Promise<SessionPaiement> {
    const reference = `sim_${demande.reference}`
    const url = new URL('/paiement/simule', demande.urlSucces)
    url.searchParams.set('reference', reference)
    url.searchParams.set('montant', String(demande.montant))
    url.searchParams.set('intitule', demande.intitule)
    url.searchParams.set('succes', demande.urlSucces)
    url.searchParams.set('echec', demande.urlEchec)

    return { reference, urlPaiement: url.toString(), charge: { simule: true } }
  },

  lireWebhook(corps: string, entetes: Headers): EvenementWebhook | undefined {
    if (!signatureValide(corps, entetes.get('x-simule-signature'), SECRET_SIMULE)) {
      return undefined
    }
    const charge = JSON.parse(corps) as { reference?: string; statut?: string }
    if (!charge.reference) return undefined

    return {
      reference: charge.reference,
      statut: charge.statut === 'reussi' ? 'reussi' : 'echoue',
      charge,
    }
  },
}

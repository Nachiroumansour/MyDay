/**
 * L'interface commune aux fournisseurs de paiement.
 *
 * Wave et Orange Money au lancement, la carte bancaire pour la diaspora
 * ensuite. Tout le reste du produit ne connaît que cette interface : brancher
 * un fournisseur de plus ne touche à rien d'autre.
 */
export type NomFournisseur = 'wave' | 'orange_money' | 'simule'

export interface DemandePaiement {
  /** Notre identifiant d'événement, renvoyé tel quel par le fournisseur. */
  reference: string
  montant: number
  devise: string
  intitule: string
  /** Où renvoyer le client après un paiement réussi. */
  urlSucces: string
  /** Où le renvoyer s'il abandonne ou échoue. */
  urlEchec: string
}

export interface SessionPaiement {
  /** Référence chez le fournisseur : notre clé d'idempotence. */
  reference: string
  /** L'adresse vers laquelle envoyer le client. */
  urlPaiement: string
  charge: unknown
}

export interface EvenementWebhook {
  /** La référence de session que nous avait donnée le fournisseur. */
  reference: string
  statut: 'reussi' | 'echoue' | 'annule' | 'ignore'
  charge: unknown
}

export interface FournisseurPaiement {
  nom: NomFournisseur
  /** Étiquette montrée au client. */
  libelle: string
  /** Vrai quand les identifiants sont présents et le fournisseur utilisable. */
  configure(): boolean
  ouvrirSession(demande: DemandePaiement): Promise<SessionPaiement>
  /** Vérifie la signature et traduit la charge utile en événement de domaine. */
  lireWebhook(corps: string, entetes: Headers): EvenementWebhook | undefined
}

export class ErreurPaiement extends Error {}

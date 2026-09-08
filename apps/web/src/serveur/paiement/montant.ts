/** Devises sans sous-unité : un montant s'y exprime en unités entières. */
const SANS_SOUS_UNITE = new Set(['XOF', 'XAF', 'JPY', 'KRW'])

export function montantAffichable(montant: number, devise = 'XOF'): string {
  if (devise === 'XOF') return `${montant.toLocaleString('fr-FR')} F CFA`
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(montant)
}

/**
 * Le montant tel que l'attend le fournisseur.
 * Le franc CFA n'a pas de centime : envoyer 500000 pour 5000 francs
 * multiplierait la facture par cent.
 */
export function montantEnUnitesFournisseur(montant: number, devise: string): string {
  return SANS_SOUS_UNITE.has(devise) ? String(montant) : String(Math.round(montant * 100))
}

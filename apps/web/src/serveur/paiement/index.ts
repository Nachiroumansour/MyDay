import type { FournisseurPaiement, NomFournisseur } from './fournisseur'
import { orangeMoney } from './orange-money'
import { simule } from './simule'
import { wave } from './wave'

const TOUS: FournisseurPaiement[] = [wave, orangeMoney, simule]

/** Les fournisseurs réellement utilisables, dans l'ordre d'affichage. */
export function fournisseursDisponibles(): FournisseurPaiement[] {
  const reels = TOUS.filter((f) => f.nom !== 'simule' && f.configure())
  // Le simulé n'apparaît que si aucun fournisseur réel n'est branché : il ne
  // doit jamais s'afficher à côté d'un vrai moyen de paiement.
  return reels.length > 0 ? reels : TOUS.filter((f) => f.nom === 'simule' && f.configure())
}

export function fournisseurParNom(nom: string): FournisseurPaiement | undefined {
  return fournissseurValide(nom) ? TOUS.find((f) => f.nom === nom && f.configure()) : undefined
}

function fournissseurValide(nom: string): nom is NomFournisseur {
  return nom === 'wave' || nom === 'orange_money' || nom === 'simule'
}

export * from './fournisseur'
export { montantAffichable } from './montant'

import { formaterDateCourte } from '@/lib/dates'
import { libelleEvenement } from '@/lib/evenements'
import { exigerAdmin } from '@/serveur/admin'
import { listerCommandes } from '@/serveur/bdd/admin'
import { montantAffichable } from '@/serveur/paiement'
import { Onglets } from '../onglets'
import styles from '../admin.module.css'

export const dynamic = 'force-dynamic'

export default async function Commandes() {
  await exigerAdmin()
  const commandes = await listerCommandes()
  const payees = commandes.filter((c) => c.statutPaiement === 'reussi')
  const recettes = payees.reduce((somme, c) => somme + (c.montant ?? 0), 0)

  return (
    <div className={styles.coquille}>
      <h1 className={styles.titre}>Les commandes</h1>
      <Onglets />

      <p className={styles.introduction}>
        {payees.length} invitation{payees.length > 1 ? 's' : ''} payée
        {payees.length > 1 ? 's' : ''}, {montantAffichable(recettes)} encaissés.
      </p>

      <div className={styles.tableau}>
        <table>
          <thead>
            <tr>
              <th>Invitation</th>
              <th>Type</th>
              <th>Modèle</th>
              <th>Statut</th>
              <th>Paiement</th>
              <th>Créée</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((commande) => (
              <tr key={`${commande.id}-${commande.statutPaiement ?? 'sans'}`}>
                <td>
                  {commande.titre}
                  <br />
                  <a className={styles.lienAction} href={`/e/${commande.slug}`}>
                    /e/{commande.slug}
                  </a>
                </td>
                <td>{libelleEvenement(commande.typeEvenement)}</td>
                <td>{commande.gabaritNom}</td>
                <td>
                  <span
                    className={
                      commande.statut === 'publie' ? styles.pastilleActive : styles.pastille
                    }
                  >
                    {commande.statut}
                  </span>
                </td>
                <td>
                  {commande.statutPaiement
                    ? `${commande.statutPaiement} · ${montantAffichable(commande.montant ?? 0)}`
                    : '—'}
                </td>
                <td>{formaterDateCourte(commande.creeLe)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

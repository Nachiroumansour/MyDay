import { libelleEvenement } from '@/lib/evenements'
import { exigerAdmin } from '@/serveur/admin'
import { listerGabarits } from '@/serveur/bdd/admin'
import { basculerGabarit, sortir } from './actions'
import { Onglets } from './onglets'
import styles from './admin.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminModeles({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await exigerAdmin()
  const requete = await searchParams
  const modeles = await listerGabarits()

  return (
    <div className={styles.coquille}>
      <div className={styles.tete}>
        <h1 className={styles.titre}>Les modèles</h1>
        <form action={sortir}>
          <button type="submit" className={styles.lienAction}>
            Se déconnecter
          </button>
        </form>
      </div>

      <Onglets />


      <div className={styles.tableau}>
        <table>
          <thead>
            <tr>
              <th>Modèle</th>
              <th>Type</th>
              <th>Créateur</th>
              <th>Prix</th>
              <th>Ventes</th>
              <th>Statut</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {modeles.map((modele) => (
              <tr key={modele.id}>
                <td>
                  {modele.nom}
                  <br />
                  <span className={styles.aide}>{modele.slug}</span>
                </td>
                <td>{libelleEvenement(modele.typeEvenement)}</td>
                <td>{modele.graphisteNom}</td>
                <td>{modele.prix.toLocaleString('fr-FR')} F</td>
                <td>{modele.nbVentes}</td>
                <td>
                  <span
                    className={modele.statut === 'actif' ? styles.pastilleActive : styles.pastille}
                  >
                    {modele.statut}
                  </span>
                </td>
                <td>
                  <div className={styles.actionsLigne}>
                    {modele.statut !== 'actif' && (
                      <form action={basculerGabarit}>
                        <input type="hidden" name="gabaritId" value={modele.id} />
                        <input type="hidden" name="statut" value="actif" />
                        <button type="submit" className={styles.lienAction}>
                          Activer
                        </button>
                      </form>
                    )}
                    {modele.statut === 'actif' && (
                      <form action={basculerGabarit}>
                        <input type="hidden" name="gabaritId" value={modele.id} />
                        <input type="hidden" name="statut" value="archive" />
                        <button type="submit" className={styles.lienAction}>
                          Retirer du catalogue
                        </button>
                      </form>
                    )}
                    <a className={styles.lienAction} href={`/admin/gabarits/${modele.slug}`}>
                      Épreuve
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

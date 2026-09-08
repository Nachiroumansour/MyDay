import { exigerAdmin } from '@/serveur/admin'
import { listerGraphistes } from '@/serveur/bdd/admin'
import { ajouterCreateur } from '../actions'
import { Onglets } from '../onglets'
import styles from '../admin.module.css'

export const dynamic = 'force-dynamic'

export default async function Createurs({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await exigerAdmin()
  const requete = await searchParams
  const createurs = await listerGraphistes()

  return (
    <div className={styles.coquille}>
      <h1 className={styles.titre}>Les créateurs</h1>
      <Onglets />

      {requete.erreur && <p className={styles.erreur}>Le nom et le contact sont obligatoires.</p>}

      <div className={styles.tableau}>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Contact</th>
              <th>Part</th>
              <th>Présentation</th>
            </tr>
          </thead>
          <tbody>
            {createurs.map((createur) => (
              <tr key={createur.id}>
                <td>{createur.nom}</td>
                <td>{createur.contact}</td>
                <td>{Number(createur.partRevenu).toFixed(0)} %</td>
                <td>{createur.bio ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={ajouterCreateur} className={styles.formulaire}>
        <h2 className={styles.titre} style={{ fontSize: 20 }}>
          Ajouter un créateur
        </h2>
        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="nom">Nom</label>
          <input id="nom" name="nom" className="saisie" required />
        </div>
        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="contact">Contact</label>
          <input id="contact" name="contact" className="saisie" required />
        </div>
        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="bio">Présentation</label>
          <textarea id="bio" name="bio" className="saisie" rows={2} />
          <p className={styles.aide}>Une phrase, affichée sur l’accueil.</p>
        </div>
        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="partRevenu">Part du revenu (%)</label>
          <input id="partRevenu" name="partRevenu" type="number" min={0} max={100} defaultValue={35} className="saisie" />
        </div>
        <button type="submit" className="bouton" style={{ alignSelf: 'flex-start' }}>
          Ajouter
        </button>
      </form>
    </div>
  )
}

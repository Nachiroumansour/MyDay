import { TYPES_EVENEMENT, libelleEvenement } from '@/lib/evenements'
import { exigerAdmin } from '@/serveur/admin'
import { listerGraphistes } from '@/serveur/bdd/admin'
import { televerserGabarit } from '../../actions'
import { Onglets } from '../../onglets'
import styles from '../../admin.module.css'

export const dynamic = 'force-dynamic'

export default async function NouveauGabarit({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await exigerAdmin()
  const requete = await searchParams
  const createurs = await listerGraphistes()
  const erreur = typeof requete.erreur === 'string' ? requete.erreur : undefined

  return (
    <div className={styles.coquille}>
      <h1 className={styles.titre}>Déposer un modèle</h1>
      <Onglets />

      <p className={styles.introduction}>
        Le gabarit est vérifié à l’envoi : ses champs sont lus, il est composé avec des
        valeurs d’exemple, et il est refusé si une police manque ou si un champ est mal
        déclaré. Le cahier de contraintes est dans <code>docs/cahier-des-charges-graphistes.md</code>.
      </p>

      {erreur && <p className={styles.erreur}>{erreur}</p>}

      {createurs.length === 0 ? (
        <p className={styles.erreur}>
          Aucun créateur enregistré. Ajoutez-en un d’abord.
        </p>
      ) : (
        <form action={televerserGabarit} encType="multipart/form-data" className={styles.formulaire}>
          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="svg">
              Le fichier SVG
            </label>
            <input id="svg" name="svg" type="file" accept=".svg,image/svg+xml" className="saisie" required />
          </div>

          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="nom">
              Nom du modèle
            </label>
            <input id="nom" name="nom" className="saisie" placeholder="Indigo" required />
          </div>

          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="slug">
              Identifiant d’URL
            </label>
            <input id="slug" name="slug" className="saisie" placeholder="mariage-indigo" required />
          </div>

          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="typeEvenement">
              Type d’événement
            </label>
            <select id="typeEvenement" name="typeEvenement" className="saisie" required>
              {TYPES_EVENEMENT.map((type) => (
                <option key={type} value={type}>
                  {libelleEvenement(type)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="graphisteId">
              Créateur
            </label>
            <select id="graphisteId" name="graphisteId" className="saisie" required>
              {createurs.map((createur) => (
                <option key={createur.id} value={createur.id}>
                  {createur.nom}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="etiquettes">
              Ambiances
            </label>
            <input
              id="etiquettes"
              name="etiquettes"
              className="saisie"
              placeholder="moderne, sobre, profond"
            />
            <p className={styles.aide}>Séparées par des virgules. Elles servent au guidage.</p>
          </div>

          <div className={styles.champ}>
            <label className="etiquette-champ" htmlFor="prix">
              Prix en francs CFA
            </label>
            <input id="prix" name="prix" type="number" min={500} step={500} defaultValue={5000} className="saisie" />
          </div>

          <button type="submit" className="bouton" style={{ alignSelf: 'flex-start' }}>
            Déposer et vérifier
          </button>
        </form>
      )}
    </div>
  )
}

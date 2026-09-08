import styles from './erreur.module.css'

export default function Introuvable() {
  return (
    <main className="contenu">
      <div className={styles.bloc}>
        <h1 className={styles.titre}>Cette page n’existe pas.</h1>
        <p className={styles.texte}>
          Le lien est peut-être incomplet, ou l’invitation a été retirée par ses hôtes.
        </p>
        <div className={styles.actions}>
          <a className="bouton" href="/">
            Retour à l’accueil
          </a>
          <a className="bouton-contour" href="/modeles">
            Voir les modèles
          </a>
        </div>
      </div>
    </main>
  )
}

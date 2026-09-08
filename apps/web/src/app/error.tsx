'use client'

import styles from './erreur.module.css'

export default function Erreur({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="contenu">
      <div className={styles.bloc}>
        <h1 className={styles.titre}>Quelque chose s’est mal passé.</h1>
        <p className={styles.texte}>
          Rien n’est perdu : votre travail est enregistré au fur et à mesure. Réessayez, et
          si cela se reproduit, écrivez-nous.
        </p>
        <div className={styles.actions}>
          <button type="button" className="bouton" onClick={reset}>
            Réessayer
          </button>
          <a className="bouton-contour" href="/">
            Retour à l’accueil
          </a>
        </div>
      </div>
    </main>
  )
}

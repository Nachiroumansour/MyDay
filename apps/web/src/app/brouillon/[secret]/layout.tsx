import { notFound } from 'next/navigation'
import { libelleEvenement } from '@/lib/evenements'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { Apercu } from './apercu'
import { CarteVivante } from './carte-vivante'
import { Etapes } from './etapes'
import styles from './editeur.module.css'

export default async function EditeurLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ secret: string }>
}) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  return (
    <>
      <div className={styles.bandeau}>
        <div className={`contenu ${styles.bandeauInterieur}`}>
          <div>
            <span className={styles.bandeauEtiquette}>Éditeur en direct</span>
            <h1 className={styles.bandeauTitre}>
              {brouillon.titre} · {libelleEvenement(brouillon.typeEvenement)}
            </h1>
          </div>
          <div className={styles.bandeauActions}>
            <a className="bouton-contour" href={`/brouillon/${secret}/publier`}>
              Publier
            </a>
          </div>
        </div>
      </div>

      <main className="contenu">
        <Etapes secret={secret} />
        {/* L'aperçu et les champs vivent de part et d'autre de cette mise en
            page : le contexte les relie sans rendre la page cliente. */}
        <CarteVivante secret={secret} valeursInitiales={brouillon.valeursChamps}>
          <div className={styles.coquille}>
            <Apercu secret={secret} />
            <div className={styles.colonneChamps}>{children}</div>
          </div>
        </CarteVivante>
      </main>
    </>
  )
}

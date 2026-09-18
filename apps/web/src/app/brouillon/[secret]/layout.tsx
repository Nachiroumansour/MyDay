import { notFound } from 'next/navigation'
import { analyserDocument, exemplesGabarit, proportions } from '@myday/moteur'
import { libelleEvenement } from '@/lib/evenements'
import { libelleChamp } from '@/lib/redaction'
import { zonesTactiles } from '@/lib/zones'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { Apercu } from './apercu'
import { CarteVivante, type ChampEditable } from './carte-vivante'
import { Etapes } from './etapes'
import { FeuilleChamp } from './feuille-champ'
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

  // Tout ce qu'il faut pour éditer depuis la carte, calculé une fois ici :
  // les zones à toucher, et pour chaque champ son libellé et son exemple.
  const document = analyserDocument(brouillon.gabarit.sourceSvg)
  const zones = zonesTactiles(brouillon.champs, proportions(document))
  const exemples = exemplesGabarit(document)
  const parId = new Map(brouillon.champs.map((champ) => [champ.id, champ]))
  const editables: ChampEditable[] = zones.flatMap((zone) => {
    const champ = parId.get(zone.id)
    if (!champ) return []
    return [
      {
        id: champ.id,
        libelle: libelleChamp(champ.id, brouillon.typeEvenement),
        type: champ.type,
        ...(champ.maxLongueur ? { maxLongueur: champ.maxLongueur } : {}),
        ...(champ.facultatif ? { facultatif: true } : {}),
        ...(exemples[champ.id] ? { exemple: exemples[champ.id] } : {}),
      },
    ]
  })

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
            {brouillon.statut === 'publie' ? (
              <a className="bouton-contour" href={`/e/${brouillon.slug}`}>
                Voir l’invitation
              </a>
            ) : (
              <a className="bouton-contour" href={`/brouillon/${secret}/publier`}>
                Partager
              </a>
            )}
          </div>
        </div>
      </div>

      <main className="contenu">
        <Etapes secret={secret} publie={brouillon.statut === 'publie'} />
        {/* L'aperçu et les champs vivent de part et d'autre de cette mise en
            page : le contexte les relie sans rendre la page cliente. */}
        <CarteVivante
          secret={secret}
          valeursInitiales={brouillon.valeursChamps}
          champs={editables}
        >
          <div className={styles.coquille}>
            <Apercu secret={secret} zones={zones} />
            <div className={styles.colonneChamps}>{children}</div>
          </div>
          <FeuilleChamp />
        </CarteVivante>
      </main>
    </>
  )
}

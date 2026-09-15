import { notFound } from 'next/navigation'
import { analyserDocument, exemplesGabarit } from '@myday/moteur'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { grouperChamps, manquants } from '@/lib/redaction'
import { Champ } from './champs'
import { Progression } from './progression'
import { retirerPhoto, sauverPhoto } from './actions'
import styles from './editeur.module.css'

export default async function EtapeCarte({
  params,
  searchParams,
}: {
  params: Promise<{ secret: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { secret } = await params
  const requete = await searchParams
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  const aRemplir = manquants(brouillon.champs, brouillon.valeursChamps)
  const aSaisir = brouillon.champs.filter((champ) => champ.type !== 'image' && !champ.facultatif)
  const faits = aSaisir.length - aRemplir.length
  const zonePhoto = brouillon.champs.find((champ) => champ.type === 'image')
  const erreur = typeof requete.erreur === 'string' ? requete.erreur : undefined

  const groupes = grouperChamps(brouillon.champs)
  const exemples = exemplesGabarit(analyserDocument(brouillon.gabarit.sourceSvg))

  return (
    <div className={styles.etapeCarte}>
      <div className={styles.enTeteEtape}>
        <div>
          <h1 className={styles.titre}>Votre carte</h1>
          <p className={styles.introduction}>
            Écrivez, la carte suit. Tout s’enregistre tout seul — les prénoms affichés
            sont ceux du modèle, ils s’effacent dès que vous écrivez les vôtres.
          </p>
        </div>
        <Progression faits={faits} total={aSaisir.length} />
      </div>

      {groupes.map((groupe) => (
        <section key={groupe.titre} className={styles.groupe}>
          <h2 className={styles.groupeTitre}>{groupe.titre}</h2>
          <div className={styles.groupeCorps}>
            {groupe.rangees.map((rangee) => (
              <div
                key={rangee.champs.map((c) => c.id).join('-')}
                className={rangee.champs.length > 1 ? styles.rangeeDouble : styles.rangeeSimple}
              >
                {rangee.champs.map((champ) => (
                  <Champ
                    key={champ.id}
                    champ={champ}
                    type={brouillon.typeEvenement}
                    {...(exemples[champ.id] ? { exemple: exemples[champ.id] } : {})}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      {zonePhoto && (
        <section id="photo" className={styles.formulaire}>
          <h2 className={styles.titre} style={{ fontSize: 20 }}>
            Votre photo
          </h2>
          <p className={styles.introduction}>
            Facultative. Elle remplit le cadre sans se déformer — réglez le zoom et le
            centrage si besoin.
          </p>

          {erreur && <p className={styles.avertissement}>{erreur}</p>}

          <form action={sauverPhoto} className={styles.formulaire}>
            <input type="hidden" name="secret" value={secret} />

            {brouillon.photoUrl && (
              <img className={styles.photoApercu} src={brouillon.photoUrl} alt="Votre photo" />
            )}

            <div className={styles.champ}>
              <label className="etiquette-champ" htmlFor="photo">
                Choisir une photo
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="saisie"
              />
              <p className={styles.compteur}>JPEG, PNG ou WebP, 8 Mo maximum.</p>
            </div>

            {brouillon.photoUrl && (
              <div className={styles.curseurs}>
                <label className={styles.curseur}>
                  Zoom
                  <input
                    name="zoom"
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    defaultValue={brouillon.recadrage?.zoom ?? 1}
                  />
                </label>
                <label className={styles.curseur}>
                  Horizontal
                  <input
                    name="focaleX"
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    defaultValue={brouillon.recadrage?.focaleX ?? 0.5}
                  />
                </label>
                <label className={styles.curseur}>
                  Vertical
                  <input
                    name="focaleY"
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    defaultValue={brouillon.recadrage?.focaleY ?? 0.5}
                  />
                </label>
              </div>
            )}

            <div className={styles.actions}>
              <button type="submit" className="bouton-contour">
                {brouillon.photoUrl ? 'Mettre à jour la photo' : 'Ajouter la photo'}
              </button>
            </div>
          </form>

          {brouillon.photoUrl && (
            <form action={retirerPhoto}>
              <input type="hidden" name="secret" value={secret} />
              <button type="submit" className={styles.lienDanger}>
                Retirer la photo
              </button>
            </form>
          )}
        </section>
      )}

      <div className={styles.actions}>
        <a className="bouton" href={`/brouillon/${secret}/programme`}>
          Passer au programme
        </a>
      </div>
    </div>
  )
}

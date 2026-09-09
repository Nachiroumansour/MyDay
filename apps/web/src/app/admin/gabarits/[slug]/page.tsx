import { notFound } from 'next/navigation'
import { analyserDocument, analyserGabarit, dimensionsPhysiques } from '@myday/moteur'
import { libelleEvenement } from '@/lib/evenements'
import { libelleChamp } from '@/lib/redaction'
import { exigerAdmin } from '@/serveur/admin'
import { gabaritAdminParSlug } from '@/serveur/bdd/admin'
import { basculerGabarit } from '../../actions'
import { Onglets } from '../../onglets'
import styles from '../../admin.module.css'
import propre from './page.module.css'

/**
 * L'épreuve d'un gabarit fraîchement déposé.
 *
 * Déposer sans voir ce qu'on a déposé, c'est ne rien vérifier : les contrôles
 * automatiques disent qu'un fichier est recevable, jamais qu'il est beau ni
 * que son texte tient dans son cadre. Cet écran montre la carte rendue, et à
 * côté ce que le moteur y a lu — pour que les deux puissent se contredire
 * sous les yeux de quelqu'un.
 */
export const dynamic = 'force-dynamic'

const LIBELLES_TYPE: Record<string, string> = {
  texte: 'Texte',
  texte_long: 'Texte long',
  date: 'Date',
  image: 'Photo',
}

export default async function Epreuve({ params }: { params: Promise<{ slug: string }> }) {
  await exigerAdmin()
  const { slug } = await params
  const gabarit = await gabaritAdminParSlug(slug)
  if (!gabarit) notFound()

  // Les champs sont relus dans le fichier plutôt que dans la colonne : c'est
  // le dessin qui fait foi, comme partout ailleurs dans l'application.
  const document = analyserDocument(gabarit.sourceSvg)
  const champs = analyserGabarit(document)
  const { largeurMm, hauteurMm } = dimensionsPhysiques(document)
  const enLigne = gabarit.statut === 'actif'

  return (
    <div className={styles.coquille}>
      <div className={styles.tete}>
        <div>
          <h1 className={styles.titre}>{gabarit.nom}</h1>
          <p className={styles.introduction}>
            {libelleEvenement(gabarit.typeEvenement)} · {gabarit.graphisteNom} ·{' '}
            <code>{gabarit.slug}</code>
          </p>
        </div>
        <span className={enLigne ? styles.pastilleActive : styles.pastille}>
          {enLigne ? 'Au catalogue' : gabarit.statut === 'archive' ? 'Archivé' : 'Brouillon'}
        </span>
      </div>

      <Onglets />

      <p className={styles.succes}>
        Le modèle a passé les contrôles. Regardez l’épreuve avant de le mettre au catalogue :
        rien n’a vérifié qu’il est beau, ni qu’un texte long tient dans son cadre.
      </p>

      <div className={propre.deux}>
        <div className={propre.epreuve}>
          {/* Les textes d'exemple du graphiste, pas des valeurs inventées. */}
          <img
            src={`/admin/gabarits/${gabarit.slug}/epreuve.webp?l=900`}
            alt={`Épreuve du modèle ${gabarit.nom}`}
            className={propre.carte}
          />
          <p className={styles.aide}>
            {largeurMm} × {hauteurMm} mm à l’impression · {gabarit.prix.toLocaleString('fr-FR')} F CFA
          </p>
        </div>

        <div className={propre.colonne}>
          <h2 className={propre.sousTitre}>Les champs lus</h2>
          <ul className={propre.champs}>
            {champs.map((champ) => (
              <li key={champ.id} className={propre.champ}>
                <span className={propre.champNom}>
                  {libelleChamp(champ.id, gabarit.typeEvenement)}
                </span>
                <span className={styles.aide}>
                  <code>{champ.id}</code> · {LIBELLES_TYPE[champ.type] ?? champ.type}
                  {champ.maxLongueur ? ` · ${champ.maxLongueur} signes au plus` : ''}
                  {champ.facultatif ? ' · facultatif' : ''}
                </span>
              </li>
            ))}
          </ul>

          {gabarit.etiquettes.length > 0 && (
            <>
              <h2 className={propre.sousTitre}>Ambiances</h2>
              <div className={styles.actionsLigne}>
                {gabarit.etiquettes.map((etiquette) => (
                  <span key={etiquette} className={styles.pastille}>
                    {etiquette}
                  </span>
                ))}
              </div>
            </>
          )}

          <form action={basculerGabarit} className={propre.decision}>
            <input type="hidden" name="gabaritId" value={gabarit.id} />
            <input type="hidden" name="statut" value={enLigne ? 'brouillon' : 'actif'} />
            <button type="submit" className={enLigne ? 'bouton-contour' : 'bouton'}>
              {enLigne ? 'Retirer du catalogue' : 'Mettre au catalogue'}
            </button>
          </form>
          <p className={styles.aide}>
            Tant qu’il n’est pas au catalogue, aucun client ne le voit.
          </p>
        </div>
      </div>
    </div>
  )
}

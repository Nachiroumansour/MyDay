import { BarreIdentite } from '@/composants/barre-identite'
import { Vignette } from '@/composants/vignette'
import { estTypeEvenement, libelleEvenement, TYPES_EVENEMENT } from '@/lib/evenements'
import { lireIdentite, versParametres } from '@/lib/identite'
import { libelleEtiquette, nommerStyle } from '@/lib/guidage'
import { catalogue, etiquettesDisponibles } from '@/serveur/bdd/catalogue'
import styles from './page.module.css'

export const revalidate = 3600

type Requete = Record<string, string | string[] | undefined>

/** Le libellé et la teinte du badge de chaque type de fête. */
const BADGES = {
  mariage: { libelle: 'Mariage (takk)', teinte: '#FFDBCF', encre: '#822801' },
  bapteme: { libelle: 'Baptême (ngénte)', teinte: '#FED65B', encre: '#574500' },
  anniversaire: { libelle: 'Réception & gala', teinte: '#FFD9DD', encre: '#7C2A3B' },
} as const

function premier(requete: Requete, cle: string): string | undefined {
  const valeur = requete[cle]
  return Array.isArray(valeur) ? valeur[0] : valeur
}

/** Reconstruit une URL de galerie en changeant un seul filtre. */
function lienFiltre(
  base: { type?: string; tags: string[]; identite: string },
  changement: { type?: string | null; tag?: string | null },
): string {
  const params = new URLSearchParams()
  const type = changement.type === null ? undefined : (changement.type ?? base.type)
  if (type) params.set('type', type)

  let tags = base.tags
  if (changement.tag === null) tags = []
  else if (changement.tag) {
    tags = base.tags.includes(changement.tag)
      ? base.tags.filter((t) => t !== changement.tag)
      : [...base.tags, changement.tag]
  }
  for (const tag of tags) params.append('t', tag)
  if (base.identite) params.set('__', '')

  const chaine = params.toString().replace(/&?__=$/, '')
  const morceaux = [chaine, base.identite].filter(Boolean)
  return `/modeles${morceaux.length ? `?${morceaux.join('&')}` : ''}`
}

function formaterPrix(montant: number): string {
  return `${montant.toLocaleString('fr-FR')} F CFA`
}

export default async function Galerie({ searchParams }: { searchParams: Promise<Requete> }) {
  const requete = await searchParams
  const identite = lireIdentite(requete)
  const parametres = versParametres(identite)

  const typeBrut = premier(requete, 'type')
  const type = typeBrut && estTypeEvenement(typeBrut) ? typeBrut : undefined

  const tagsBruts = requete.t
  const tags = (Array.isArray(tagsBruts) ? tagsBruts : tagsBruts ? [tagsBruts] : []).filter(Boolean)

  const [modeles, etiquettes] = await Promise.all([
    catalogue({ ...(type ? { type } : {}), ...(tags.length ? { etiquettes: tags } : {}) }),
    etiquettesDisponibles(type),
  ])

  const base = { ...(type ? { type } : {}), tags, identite: parametres }

  return (
    <main className="contenu">
      <div className={styles.tete}>
        <div>
          <p className="sur-titre">Catalogue exclusif</p>
          <h1 className={styles.titre}>
            {tags.length > 0
              ? nommerStyle(tags)
              : type
                ? `Nos ${libelleEvenement(type).toLowerCase()}s`
                : 'La galerie des cérémonies'}
          </h1>
          <p className={styles.intro}>
            Des invitations dessinées à Dakar pour vos mariages, baptêmes et réceptions.
            Écrivez vos prénoms : chaque modèle s’affiche aussitôt avec.
          </p>
        </div>

        <a className={styles.guidage} href={`/guide${parametres ? `?${parametres}` : ''}`}>
          <span className={styles.guidagePastille} aria-hidden="true">
            ✦
          </span>
          <span>
            <span className={styles.guidageTitre}>Vous hésitez sur le style ?</span>
            <span className={styles.guidageLien}>Lancer le test visuel →</span>
          </span>
        </a>
      </div>

      <div style={{ paddingBottom: 24 }}>
        <BarreIdentite identite={identite} action="/modeles" compact />
      </div>

      <div className={styles.filtres}>
        <div className={styles.rangee}>
          <a
            className={`pilule ${type ? '' : 'pilule-active'}`}
            href={lienFiltre(base, { type: null })}
          >
            Tous ({modeles.length})
          </a>
          {TYPES_EVENEMENT.map((candidat) => (
            <a
              key={candidat}
              className={`pilule ${type === candidat ? 'pilule-active' : ''}`}
              href={lienFiltre(base, { type: candidat })}
            >
              {BADGES[candidat].libelle}
            </a>
          ))}
        </div>

        {etiquettes.length > 0 && (
          <div className={styles.rangee}>
            <span className={styles.etiquetteFiltre}>Ambiance</span>
            {etiquettes.map((etiquette) => (
              <a
                key={etiquette}
                className={`pilule ${tags.includes(etiquette) ? 'pilule-active' : ''}`}
                href={lienFiltre(base, { tag: etiquette })}
              >
                {libelleEtiquette(etiquette)}
              </a>
            ))}
          </div>
        )}
      </div>

      <p className={styles.compte}>
        {modeles.length} modèle{modeles.length > 1 ? 's' : ''}
        {identite.nom1 ? ', déjà à vos noms' : ''}
      </p>

      {modeles.length === 0 ? (
        <div className={styles.vide}>
          <p>Aucun modèle avec ces filtres. Retirez-en un pour en voir plus.</p>
          <a className="bouton-contour" href={lienFiltre(base, { tag: null })}>
            Retirer les filtres
          </a>
        </div>
      ) : (
        <ul className={styles.grille}>
          {modeles.map((gabarit, rang) => {
            const badge = BADGES[gabarit.typeEvenement]
            return (
              <li key={gabarit.id}>
                <a
                  className={styles.modele}
                  href={`/modeles/${gabarit.slug}${parametres ? `?${parametres}` : ''}`}
                >
                  <span
                    className={styles.modeleVisuel}
                    style={{
                      ['--teinte-badge' as string]: badge.teinte,
                      ['--sur-badge' as string]: badge.encre,
                    }}
                  >
                    <span className={styles.modeleBadge}>{badge.libelle}</span>
                    <Vignette
                      gabarit={gabarit}
                      identite={identite}
                      largeur={480}
                      priorite={rang < 3}
                    />
                  </span>

                  <span className={styles.modeleCorps}>
                    <span className={styles.modeleAmbiance}>
                      {gabarit.etiquettes.slice(0, 2).map(libelleEtiquette).join(' · ') || '—'}
                    </span>
                    <span className={styles.modeleNom}>{gabarit.nom}</span>
                    <span className={styles.modeleAuteur}>Par {gabarit.graphisteNom}</span>

                    <span className={styles.modelePied}>
                      <span>
                        <span className={styles.modelePrixLibelle}>À partir de</span>
                        <span className={styles.modelePrix}>{formaterPrix(gabarit.prix)}</span>
                      </span>
                      <span className={styles.modeleAction}>Personnaliser →</span>
                    </span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}

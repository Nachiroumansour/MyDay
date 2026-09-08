import { BarreIdentite } from '@/composants/barre-identite'
import { Vignette } from '@/composants/vignette'
import {
  couleurEvenement,
  estTypeEvenement,
  libelleEvenement,
  TYPES_EVENEMENT,
} from '@/lib/evenements'
import { lireIdentite, versParametres } from '@/lib/identite'
import { libelleEtiquette, nommerStyle } from '@/lib/guidage'
import { catalogue, etiquettesDisponibles } from '@/serveur/bdd/catalogue'
import styles from './page.module.css'

export const revalidate = 3600

type Requete = Record<string, string | string[] | undefined>

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

  const chaine = params.toString()
  return `/modeles${chaine || base.identite ? '?' : ''}${chaine}${
    base.identite ? `${chaine ? '&' : ''}${base.identite}` : ''
  }`
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
  const couleur = type ? couleurEvenement(type) : undefined

  return (
    <main className="contenu" style={couleur ? { ['--evenement' as string]: couleur } : undefined}>
      <div className={styles.tete}>
        <h1 className={styles.titre}>
          {tags.length > 0 ? nommerStyle(tags) : type ? libelleEvenement(type) : 'Tous les modèles'}
        </h1>
        <BarreIdentite identite={identite} action="/modeles" compact />
      </div>

      <div className={styles.filtres}>
        <div className={styles.rangee}>
          <a
            className={type ? styles.pastille : styles.pastilleActive}
            href={lienFiltre(base, { type: null })}
          >
            Tous
          </a>
          {TYPES_EVENEMENT.map((candidat) => (
            <a
              key={candidat}
              className={type === candidat ? styles.pastilleActive : styles.pastille}
              href={lienFiltre(base, { type: candidat })}
              style={{ ['--evenement' as string]: couleurEvenement(candidat) }}
            >
              {libelleEvenement(candidat)}
            </a>
          ))}
          <a className={`${styles.aide} lien-sobre`} href="/guide">
            Aidez-moi à choisir
          </a>
        </div>

        {etiquettes.length > 0 && (
          <div className={styles.rangee}>
            {etiquettes.map((etiquette) => (
              <a
                key={etiquette}
                className={tags.includes(etiquette) ? styles.pastilleActive : styles.pastille}
                href={lienFiltre(base, { tag: etiquette })}
              >
                {libelleEtiquette(etiquette)}
              </a>
            ))}
          </div>
        )}
      </div>

      <p className={styles.compte} style={{ paddingTop: 20 }}>
        {modeles.length} modèle{modeles.length > 1 ? 's' : ''}
        {identite.nom1 ? `, déjà à vos noms` : ''}
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
          {modeles.map((gabarit, rang) => (
            <li key={gabarit.id}>
              <a
                className={styles.modele}
                href={`/modeles/${gabarit.slug}${parametres ? `?${parametres}` : ''}`}
              >
                <Vignette
                  gabarit={gabarit}
                  identite={identite}
                  largeur={480}
                  priorite={rang < 4}
                />
                <span className={styles.nom}>{gabarit.nom}</span>
                <span className={styles.auteur}>{gabarit.graphisteNom}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

import type { TypeEvenement } from '@/lib/evenements'
import { festivite, grainsAmbiance, type ZoneAmbiance } from '@/lib/festivite'
import styles from './ambiance.module.css'

/**
 * L'ambiance d'une fête : pétales, bulles ou confettis qui dérivent.
 *
 * Composant serveur, sans une ligne de JavaScript : les grains sont calculés
 * une fois et animés par CSS. Le conteneur parent doit être en
 * `position: relative`.
 */
export function Ambiance({
  type,
  nombre = 18,
  intensite = 1,
  zone = 'partout',
  teinte,
}: {
  type: TypeEvenement
  nombre?: number
  /** Multiplie l'opacité : 0,5 pour une ambiance très discrète. */
  intensite?: number
  /** « bords » tient les grains à l'écart de la colonne de texte. */
  zone?: ZoneAmbiance
  /** À forcer en blanc sur un aplat coloré, où la couleur de la fête
      deviendrait invisible sur elle-même. */
  teinte?: string
}) {
  const fete = festivite(type)
  const grains = grainsAmbiance(type, nombre, zone)

  return (
    <span className={styles.scene} aria-hidden="true">
      {grains.map((grain, rang) => (
        <span
          key={rang}
          className={`${styles.grain} ${styles[fete.forme]}`}
          style={{
            left: `${grain.gauche}%`,
            width: fete.forme === 'confetti' ? grain.taille * 0.45 : grain.taille,
            height: grain.taille,
            background: teinte ?? fete.couleur,
            border: fete.forme === 'bulle' ? `1.5px solid ${teinte ?? fete.couleur}` : undefined,
            // Négatif : l'animation démarre en cours de cycle, donc des grains
            // sont visibles dès le premier instant.
            animationDelay: `-${grain.delai}s`,
            animationDuration: `${grain.duree}s`,
            ['--opacite' as string]: String(
              Math.round(grain.opacite * intensite * 100) / 100,
            ),
          }}
        />
      ))}
    </span>
  )
}

/**
 * L'éclosion : une gerbe qui part du centre au moment où quelque chose
 * s'ouvre. Elle dure deux secondes et demie, puis disparaît.
 */
export function Eclosion({ type, nombre = 22 }: { type: TypeEvenement; nombre?: number }) {
  const fete = festivite(type)
  const grains = grainsAmbiance(type, nombre)

  return (
    <span className={styles.eclosion} aria-hidden="true">
      {grains.map((grain, rang) => (
        <span
          key={rang}
          className={styles.eclat}
          style={{
            width: fete.forme === 'confetti' ? grain.taille * 0.5 : grain.taille,
            height: grain.taille,
            background: fete.couleur,
            animationDelay: `${(rang % 6) * 40}ms`,
            ['--angle' as string]: `${(rang / nombre) * 360}deg`,
            ['--portee' as string]: `${-90 - grain.taille * 4}px`,
          }}
        />
      ))}
    </span>
  )
}

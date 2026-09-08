/** @jsxImportSource preact */

import type { TypeEvenement } from '@/lib/evenements'
import { festivite, grainsAmbiance, type ZoneAmbiance } from '@/lib/festivite'

/**
 * L'ambiance de la page invitation.
 *
 * Jumelle du composant des pages du créateur, mais sans CSS Modules : cette
 * page est rendue en HTML statique avec sa feuille de style en ligne. Tout est
 * en CSS — la page reste à zéro JavaScript.
 */
export function Ambiance({
  type,
  nombre = 16,
  intensite = 1,
  zone = 'partout',
  teinte,
}: {
  type: TypeEvenement
  nombre?: number
  intensite?: number
  zone?: ZoneAmbiance
  /** À forcer en blanc sur un aplat coloré. */
  teinte?: string
}) {
  const fete = festivite(type)
  const grains = grainsAmbiance(type, nombre, zone)

  return (
    <span className="scene" aria-hidden="true">
      {grains.map((grain, rang) => (
        <span
          key={rang}
          className={`grain ${fete.forme}`}
          style={{
            left: `${grain.gauche}%`,
            width: fete.forme === 'confetti' ? grain.taille * 0.45 : grain.taille,
            height: grain.taille,
            background: teinte ?? fete.couleur,
            border: fete.forme === 'bulle' ? `1.5px solid ${teinte ?? fete.couleur}` : undefined,
            // Négatif : des grains sont visibles dès le premier instant.
            animationDelay: `-${grain.delai}s`,
            animationDuration: `${grain.duree}s`,
            ['--opacite' as string]: String(Math.round(grain.opacite * intensite * 100) / 100),
          }}
        />
      ))}
    </span>
  )
}

/**
 * L'éclosion : la gerbe qui part du cachet au moment où l'enveloppe s'ouvre.
 * Elle ne se déclenche que sous `data-etat="ouverture"`, dure deux secondes et
 * demie, puis disparaît. Une boucle infinie fatiguerait en dix secondes.
 */
export function Eclosion({
  type,
  nombre = 20,
  classe = 'eclosion',
}: {
  type: TypeEvenement
  nombre?: number
  classe?: string
}) {
  const fete = festivite(type)
  const grains = grainsAmbiance(type, nombre)

  return (
    <span className={classe} aria-hidden="true">
      {grains.map((grain, rang) => (
        <span
          key={rang}
          className="eclat"
          style={{
            width: fete.forme === 'confetti' ? grain.taille * 0.5 : grain.taille,
            height: grain.taille,
            background: fete.couleur,
            animationDelay: `${(rang % 6) * 45}ms`,
            ['--angle' as string]: `${(rang / nombre) * 360}deg`,
            ['--portee' as string]: `${-100 - grain.taille * 4}px`,
          }}
        />
      ))}
    </span>
  )
}

import type { TypeEvenement } from '@/lib/evenements'
import { couleurEvenement } from '@/lib/evenements'

/**
 * Le symbole : un carton d'invitation incliné à 9°, marqué d'un disque — le
 * jour — au-dessus de deux lignes de texte. Il prend la couleur de la fête en
 * cours, l'encre hors contexte d'événement.
 */
export function Marque({ type, taille = 26 }: { type?: TypeEvenement; taille?: number }) {
  const couleur = type ? couleurEvenement(type) : 'var(--encre)'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <svg width={taille} height={taille} viewBox="0 0 40 40" aria-hidden="true">
        <g transform="rotate(-9 20 20)">
          <rect x="11" y="5" width="18" height="27" rx="2.5" fill={couleur} />
          <circle cx="20" cy="14" r="3.6" fill="var(--fond)" />
          <rect x="13.5" y="21.5" width="13" height="1.7" rx="0.85" fill="var(--fond)" />
          <rect
            x="13.5"
            y="25.5"
            width="8.5"
            height="1.7"
            rx="0.85"
            fill="var(--fond)"
            opacity="0.65"
          />
        </g>
      </svg>
      <span
        style={{
          fontSize: taille * 0.73,
          fontWeight: 600,
          letterSpacing: '-0.035em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: 'var(--encre)' }}>My</span>
        <span style={{ color: couleur }}>Day</span>
      </span>
    </span>
  )
}

/**
 * Les icônes de l'interface, dessinées au trait dans l'esprit du logo :
 * traits francs, angles nets, rien de rond ni de mignon.
 *
 * Elles prennent la couleur du texte qui les entoure, donc la couleur de
 * l'événement en cours quand elles s'y trouvent.
 */
const commun = {
  width: 30,
  height: 30,
  viewBox: '0 0 26 26',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** Le carton qu'on choisit. */
export function IconeCarte() {
  return (
    <svg {...commun}>
      <rect x="5" y="3" width="16" height="20" rx="1.5" />
      <path d="M9 9h8M9 13h8M9 17h5" />
    </svg>
  )
}

/** La plume qui remplit. */
export function IconePlume() {
  return (
    <svg {...commun}>
      <path d="M4 22c0-7 5-14 13-16-1 9-6 14-13 16Z" />
      <path d="M8 18c3-1 5-3 6-6" />
    </svg>
  )
}

/** Le partage : une enveloppe qui part. */
export function IconeEnvoi() {
  return (
    <svg {...commun}>
      <path d="M3 5h20v16H3z" />
      <path d="M3 5l10 8 10-8" />
    </svg>
  )
}

/** Le cachet de cire. */
export function IconeCachet() {
  return (
    <svg {...commun}>
      <circle cx="13" cy="13" r="8" />
      <circle cx="13" cy="13" r="4" />
    </svg>
  )
}

/** Le lieu, avec son repère. */
export function IconeLieu() {
  return (
    <svg {...commun}>
      <path d="M13 23s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
      <circle cx="13" cy="11" r="2.5" />
    </svg>
  )
}

/** Les réponses des invités. */
export function IconeReponses() {
  return (
    <svg {...commun}>
      <path d="M4 6h18v12H10l-6 4V6Z" />
      <path d="M9 12l2.5 2.5L17 9" />
    </svg>
  )
}

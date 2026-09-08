/** @jsxImportSource preact */

/**
 * Les quelques icônes de la page invitation, dessinées en ligne.
 *
 * La maquette utilise une police d'icônes ; la charger coûterait une requête
 * et une trentaine de kilo-octets sur la page que tous les invités ouvrent en
 * 3G. Six tracés suffisent.
 */
const commun = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconeEnveloppe() {
  return (
    <svg {...commun}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 6.5 12 13l9.5-6.5" />
    </svg>
  )
}

export function IconeAnneau() {
  return (
    <svg {...commun}>
      <circle cx="12" cy="14.5" r="6" />
      <path d="M9 6.5 12 3l3 3.5-3 2z" />
    </svg>
  )
}

export function IconeColombe() {
  return (
    <svg {...commun}>
      <path d="M3 13c4 0 6-2 8-5 1.5 4 4.5 6 9 6-2 4-5.5 6-9.5 6C6 20 3 17 3 13Z" />
      <circle cx="16.5" cy="7.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function IconeCoupe() {
  return (
    <svg {...commun}>
      <path d="M7 3h10l-1.5 7a3.5 3.5 0 0 1-7 0Z" />
      <path d="M12 13.5V21M8.5 21h7" />
    </svg>
  )
}

export function IconeLieu() {
  return (
    <svg {...commun} width="15" height="15">
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

export function IconeTenue() {
  return (
    <svg {...commun}>
      <path d="M9 3.5 12 6l3-2.5M12 6v2.5" />
      <path d="M12 8.5 4.5 14v6h15v-6L12 8.5Z" />
    </svg>
  )
}

export function IconeCoche() {
  return (
    <svg {...commun}>
      <path d="M5 12.5 10 17.5 19.5 7" />
    </svg>
  )
}

export interface Destination {
  lieu: string
  adresse?: string | null
  latitude?: number | null
  longitude?: number | null
}

function coordonnees(d: Destination): string | undefined {
  if (typeof d.latitude !== 'number' || typeof d.longitude !== 'number') return undefined
  return `${d.latitude},${d.longitude}`
}

function libelle(d: Destination): string {
  return d.adresse ? `${d.lieu}, ${d.adresse}` : d.lieu
}

/** Ouvre l'itinéraire dans Google Maps, l'application dominante à Dakar. */
export function lienGoogleMaps(d: Destination): string {
  const cible = coordonnees(d) ?? libelle(d)
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cible)}`
}

export function lienWaze(d: Destination): string {
  const point = coordonnees(d)
  return point
    ? `https://waze.com/ul?ll=${encodeURIComponent(point)}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(libelle(d))}&navigate=yes`
}

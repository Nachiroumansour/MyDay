/**
 * Origine absolue du site. WhatsApp et Facebook ne résolvent pas une URL
 * d'image relative : sans elle, aucun aperçu de partage ne s'affiche.
 */
export function origine(requete: Request): string {
  if (process.env.NEXT_PUBLIC_ORIGINE) return process.env.NEXT_PUBLIC_ORIGINE
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  const url = new URL(requete.url)
  return `${url.protocol}//${url.host}`
}

/**
 * La même origine, pour une page rendue par le serveur.
 *
 * Quand la variable n'est pas renseignée — un poste de développement lancé sur
 * un autre port que prévu, par exemple — on la déduit des en-têtes de la
 * requête plutôt que de rendre un lien relatif : un lien relatif collé dans une
 * conversation WhatsApp ne mène nulle part.
 */
export async function origineDePage(): Promise<string> {
  if (process.env.NEXT_PUBLIC_ORIGINE) return process.env.NEXT_PUBLIC_ORIGINE
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  const { headers } = await import('next/headers')
  const entetes = await headers()
  const hote = entetes.get('x-forwarded-host') ?? entetes.get('host') ?? 'localhost:3000'
  const protocole = entetes.get('x-forwarded-proto') ?? (hote.startsWith('localhost') ? 'http' : 'https')
  return `${protocole}://${hote}`
}

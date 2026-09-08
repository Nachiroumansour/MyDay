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

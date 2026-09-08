import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Session d'administration, signée plutôt que stockée.
 *
 * Le back-office sert deux graphistes et l'équipe : une table de sessions
 * serait un chantier pour rien. Un jeton signé, court, suffit — et il ne peut
 * pas être forgé sans le secret.
 *
 * Un secret absent fait échouer la lecture. Le contraire — tout laisser passer
 * faute de configuration — ouvrirait l'administration à tout le monde.
 */
export interface Session {
  sujet: string
  expireLe: number
}

function base64url(valeur: string | Buffer): string {
  return Buffer.from(valeur)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function signature(charge: string, secret: string): string {
  return base64url(createHmac('sha256', secret).update(charge).digest())
}

export function signerSession(sujet: string, secret: string, dureeSecondes: number): string {
  const charge = base64url(
    JSON.stringify({ sujet, expireLe: Math.floor(Date.now() / 1000) + dureeSecondes }),
  )
  return `${charge}.${signature(charge, secret)}`
}

export function lireSession(
  jeton: string | undefined,
  secret: string | undefined,
): Session | undefined {
  if (!jeton || !secret) return undefined

  const [charge, fournie] = jeton.split('.')
  if (!charge || !fournie) return undefined

  const attendue = signature(charge, secret)
  if (fournie.length !== attendue.length) return undefined
  if (!timingSafeEqual(Buffer.from(fournie), Buffer.from(attendue))) return undefined

  try {
    const session = JSON.parse(
      Buffer.from(charge.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(),
    ) as Session
    if (session.expireLe * 1000 < Date.now()) return undefined
    return session
  } catch {
    return undefined
  }
}

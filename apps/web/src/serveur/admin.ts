import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { timingSafeEqual, createHash } from 'node:crypto'
import { lireSession, signerSession } from './session'

const COOKIE = 'myday_admin'
const DUREE = 12 * 60 * 60

function secret(): string | undefined {
  return process.env.ADMIN_SECRET_SESSION
}

/** Compare deux mots de passe à temps constant, quelle que soit leur longueur. */
function memeMotDePasse(fourni: string, attendu: string): boolean {
  const a = createHash('sha256').update(fourni).digest()
  const b = createHash('sha256').update(attendu).digest()
  return timingSafeEqual(a, b)
}

export function motDePasseValide(fourni: string): boolean {
  const attendu = process.env.ADMIN_MOT_DE_PASSE
  // Sans mot de passe configuré, l'administration reste fermée.
  if (!attendu || attendu.length < 12) return false
  return memeMotDePasse(fourni, attendu)
}

export async function ouvrirSessionAdmin(sujet: string): Promise<void> {
  const cle = secret()
  if (!cle) return
  const magasin = await cookies()
  magasin.set(COOKIE, signerSession(sujet, cle, DUREE), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DUREE,
  })
}

export async function fermerSessionAdmin(): Promise<void> {
  const magasin = await cookies()
  magasin.delete(COOKIE)
}

export async function sessionAdmin(): Promise<{ sujet: string } | undefined> {
  const magasin = await cookies()
  return lireSession(magasin.get(COOKIE)?.value, secret())
}

/** Garde d'entrée du back-office : à appeler en tête de chaque page admin. */
export async function exigerAdmin(): Promise<{ sujet: string }> {
  const session = await sessionAdmin()
  if (!session) redirect('/admin/connexion')
  return session
}

export function administrationConfiguree(): boolean {
  return Boolean(
    process.env.ADMIN_SECRET_SESSION &&
      process.env.ADMIN_MOT_DE_PASSE &&
      process.env.ADMIN_MOT_DE_PASSE.length >= 12,
  )
}

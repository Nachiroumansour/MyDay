import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { motDePasseValide, ouvrirSessionAdmin, sessionAdmin } from '@/serveur/admin'
import { limiteurConnexion } from '@/serveur/limitation'
import styles from '../admin.module.css'

export const dynamic = 'force-dynamic'

export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (await sessionAdmin()) redirect('/admin')
  const requete = await searchParams

  async function entrer(donnees: FormData): Promise<void> {
    'use server'
    // Sans plafond, le mot de passe serait devinable par force brute.
    const entetes = await headers()
    const appelant = entetes.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnu'
    if (!limiteurConnexion.autorise(appelant)) redirect('/admin/connexion?erreur=trop')

    const motDePasse = String(donnees.get('motDePasse') ?? '')
    if (!motDePasseValide(motDePasse)) redirect('/admin/connexion?erreur=1')
    await ouvrirSessionAdmin('equipe')
    redirect('/admin')
  }

  return (
    <div className={styles.coquille} style={{ maxWidth: 420 }}>
      <h1 className={styles.titre}>Administration</h1>
      {requete.erreur === 'trop' ? (
        <p className={styles.erreur}>Trop de tentatives. Réessayez dans quelques minutes.</p>
      ) : (
        requete.erreur && <p className={styles.erreur}>Mot de passe incorrect.</p>
      )}
      <form action={entrer} className={styles.formulaire}>
        <div className={styles.champ}>
          <label className="etiquette-champ" htmlFor="motDePasse">
            Mot de passe
          </label>
          <input
            id="motDePasse"
            name="motDePasse"
            type="password"
            className="saisie"
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="bouton" style={{ alignSelf: 'flex-start' }}>
          Entrer
        </button>
      </form>
    </div>
  )
}

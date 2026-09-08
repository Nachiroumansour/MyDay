import { administrationConfiguree } from '@/serveur/admin'
import styles from './admin.module.css'

/** L'administration n'est jamais mise en cache. */
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!administrationConfiguree()) {
    return (
      <main className="contenu" style={{ paddingTop: 48, maxWidth: 640 }}>
        <h1 className={styles.titre}>Administration fermée</h1>
        <p className={styles.introduction} style={{ marginTop: 12 }}>
          Elle s’ouvre en renseignant <code>ADMIN_MOT_DE_PASSE</code> (douze caractères au
          moins) et <code>ADMIN_SECRET_SESSION</code>. Sans eux, elle reste inaccessible —
          plutôt qu’ouverte à tout le monde.
        </p>
      </main>
    )
  }

  return <main className="contenu">{children}</main>
}

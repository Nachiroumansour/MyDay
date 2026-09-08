import { notFound } from 'next/navigation'
import { couleurEvenement } from '@/lib/evenements'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { Apercu } from './apercu'
import { Etapes } from './etapes'
import styles from './editeur.module.css'

export default async function EditeurLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ secret: string }>
}) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) notFound()

  return (
    <main
      className="contenu"
      style={{ ['--evenement' as string]: couleurEvenement(brouillon.typeEvenement) }}
    >
      <Etapes secret={secret} />
      <div className={styles.coquille}>
        <div className={styles.colonneApercu}>
          <Apercu secret={secret} />
        </div>
        <div>{children}</div>
      </div>
    </main>
  )
}

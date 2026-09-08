import { createHmac } from 'node:crypto'
import { redirect } from 'next/navigation'
import { montantAffichable } from '@/serveur/paiement'
import { SECRET_SIMULE } from '@/serveur/paiement/simule'
import { origine as origineDe } from '@/serveur/origine'
import { headers } from 'next/headers'

/**
 * Cette page lit la configuration à chaque requête : mise en cache, son
 * garde-fou serait figé à l'état du build.
 */
export const dynamic = 'force-dynamic'

/**
 * Page de paiement de développement.
 *
 * Elle rejoue le parcours réel — le client choisit d'aboutir ou d'échouer, et
 * un webhook signé part vers notre propre route. Elle n'existe pas en
 * production.
 */
export default async function PaiementSimule({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (process.env.NODE_ENV === 'production' && process.env.PAIEMENT_SIMULE !== '1') {
    redirect('/')
  }

  const requete = await searchParams
  const lire = (cle: string) => {
    const valeur = requete[cle]
    return (Array.isArray(valeur) ? valeur[0] : valeur) ?? ''
  }

  async function decider(donnees: FormData): Promise<void> {
    'use server'
    const reference = String(donnees.get('reference'))
    const statut = String(donnees.get('statut'))
    const succes = String(donnees.get('succes'))
    const echec = String(donnees.get('echec'))

    const entetes = await headers()
    const base = origineDe(
      new Request(`https://${entetes.get('host') ?? 'localhost'}/`),
    )

    const corps = JSON.stringify({ reference, statut })
    await fetch(`${base}/webhooks/simule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-simule-signature': createHmac('sha256', SECRET_SIMULE).update(corps).digest('hex'),
      },
      body: corps,
    })

    redirect(statut === 'reussi' ? succes : echec)
  }

  return (
    <main className="contenu" style={{ maxWidth: 520, paddingTop: 64, paddingBottom: 64 }}>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.025em' }}>Paiement simulé</h1>
      <p className="legende" style={{ marginTop: 12 }}>
        Cette page remplace Wave et Orange Money le temps du développement. Aucun argent ne
        change de main.
      </p>

      <p style={{ marginTop: 28, fontSize: 20, fontWeight: 600 }}>
        {montantAffichable(Number(lire('montant') || 0))}
      </p>
      <p className="legende">{lire('intitule')}</p>

      <form action={decider} style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
        <input type="hidden" name="reference" value={lire('reference')} />
        <input type="hidden" name="succes" value={lire('succes')} />
        <input type="hidden" name="echec" value={lire('echec')} />
        <button type="submit" name="statut" value="reussi" className="bouton">
          Payer
        </button>
        <button type="submit" name="statut" value="echoue" className="bouton-contour">
          Refuser le paiement
        </button>
      </form>
    </main>
  )
}

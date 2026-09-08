import { redirect } from 'next/navigation'
import { evenementPublie } from '@/serveur/bdd/evenements'
import { ouvrirParticipation } from '@/serveur/bdd/modules'
import { normaliserTelephone } from '@/lib/rsvp'
import { fournisseursDisponibles } from '@/serveur/paiement'
import { origine } from '@/serveur/origine'

const MONTANT_MIN = 500
const MONTANT_MAX = 5_000_000

/**
 * Participation à la cagnotte.
 *
 * L'argent transite par le même fournisseur de paiement que les publications.
 * Le reversement aux hôtes reste hors périmètre : encaisser pour le compte
 * d'un tiers soulève des questions de conformité et de trésorerie qui
 * dépassent le code (spec §13). Les participations sont donc encaissées et
 * présentées aux hôtes, pas reversées automatiquement.
 */
export async function POST(
  requete: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const evenement = await evenementPublie(slug)
  if (!evenement?.cagnotteOuverte) redirect(`/e/${slug}`)

  const donnees = await requete.formData()
  const contributeur = String(donnees.get('contributeur') ?? '').trim().slice(0, 80)
  const montant = Math.round(Number(donnees.get('montant') ?? 0))
  const message = String(donnees.get('message') ?? '').trim().slice(0, 300)

  if (contributeur === '' || montant < MONTANT_MIN || montant > MONTANT_MAX) {
    redirect(`/e/${slug}#participer`)
  }

  const [fournisseur] = fournisseursDisponibles()
  if (!fournisseur) redirect(`/e/${slug}#participer`)

  const base = origine(requete)
  const reference = `don_${crypto.randomUUID()}`

  const session = await fournisseur.ouvrirSession({
    reference,
    montant,
    devise: 'XOF',
    intitule: `Participation — ${evenement.titre}`,
    urlSucces: `${base}/e/${slug}?don=merci#participer`,
    urlEchec: `${base}/e/${slug}#participer`,
  })

  await ouvrirParticipation({
    evenementId: evenement.id,
    contributeur,
    telephone: normaliserTelephone(String(donnees.get('telephone') ?? '')) ?? null,
    montant,
    message: message || null,
    reference: session.reference,
  })

  redirect(session.urlPaiement)
}

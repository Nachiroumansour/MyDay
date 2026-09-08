import { genererIcs } from '@/lib/agenda'
import { evenementPublie } from '@/serveur/bdd/evenements'

export async function GET(
  requete: Request,
  { params }: { params: Promise<{ slug: string; ceremonieId: string }> },
) {
  const { slug, ceremonieId } = await params
  const evenement = await evenementPublie(slug)
  const ceremonie = evenement?.ceremonies.find((c) => c.id === ceremonieId)
  if (!evenement || !ceremonie) return new Response('Introuvable', { status: 404 })

  const lieu = ceremonie.adresse ? `${ceremonie.lieu}, ${ceremonie.adresse}` : ceremonie.lieu

  const ics = genererIcs({
    identifiant: ceremonie.id,
    titre: `${ceremonie.nom} — ${evenement.titre}`,
    debut: ceremonie.debuteLe,
    fin: ceremonie.termineLe,
    lieu,
    ...(ceremonie.repere ? { description: `Repère : ${ceremonie.repere}` } : {}),
    url: new URL(`/e/${evenement.slug}`, requete.url).toString(),
  })

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${ceremonie.nom.toLowerCase().replace(/\W+/g, '-')}.ics"`,
    },
  })
}

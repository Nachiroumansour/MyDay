import { exporterCsv } from '@/lib/statistiques'
import { brouillonParSecret } from '@/serveur/bdd/brouillons'
import { reponsesPour } from '@/serveur/bdd/evenements'

export const dynamic = 'force-dynamic'

export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ secret: string }> },
) {
  const { secret } = await params
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return new Response('Introuvable', { status: 404 })

  const csv = exporterCsv(await reponsesPour(brouillon.id), brouillon.ceremonies)
  const nom = brouillon.titre.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')

  return new Response(`﻿${csv}`, {
    headers: {
      // Le BOM garantit que les accents s'affichent dans Excel.
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="reponses-${nom}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}

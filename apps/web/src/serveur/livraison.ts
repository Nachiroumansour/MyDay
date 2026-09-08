import { composerCarte, rendrePdf, rendrePng, DPI_LIVRAISON, pixelsPourDpi } from '@myday/moteur'
import { dimensionsImage } from '@/lib/image'
import { brouillonParSecret, publierBrouillon } from './bdd/brouillons'
import { enregistrerFichiers, journaliserLivraison } from './bdd/paiements'
import { polices } from './polices'
import { enregistrerFichier, lireMedia } from './stockage'
import { envoyerInvitationLivree, whatsappConfigure } from './whatsapp'

/**
 * Ce qui se passe quand un paiement est confirmé : l'invitation est publiée,
 * les fichiers haute définition sont produits, et le tout part sur WhatsApp.
 *
 * Aucune de ces étapes n'est déclenchée avant confirmation authentifiée du
 * paiement (critère d'acceptation 8 de la spec).
 */
export async function livrerApresPaiement(secret: string, origine: string): Promise<void> {
  const brouillon = await brouillonParSecret(secret)
  if (!brouillon) return

  await publierBrouillon(secret)

  // La photo voyage en data-URI : resvg ne va pas chercher les URL.
  let photo
  if (brouillon.photoUrl) {
    const media = await lireMedia(brouillon.photoUrl.replace('/media/', ''))
    const dimensions = media && dimensionsImage(media.octets)
    if (media && dimensions) {
      photo = {
        source: `data:${media.type};base64,${Buffer.from(media.octets).toString('base64')}`,
        largeur: dimensions.largeur,
        hauteur: dimensions.hauteur,
        ...(brouillon.recadrage ? { recadrage: brouillon.recadrage } : {}),
      }
    }
  }

  const carte = composerCarte({
    gabaritSvg: brouillon.gabarit.sourceSvg,
    valeurs: brouillon.valeursChamps,
    polices: await polices(),
    // Le client a payé : plus de filigrane.
    filigrane: false,
    ...(photo ? { photo } : {}),
  })

  const png = await rendrePng(carte.svg, {
    largeurPx: pixelsPourDpi(carte.dimensions.largeurMm, DPI_LIVRAISON),
  })
  const pdf = await rendrePdf(png, carte.dimensions)

  const [fichierPng, fichierPdf] = await Promise.all([
    enregistrerFichier(png, 'png'),
    enregistrerFichier(pdf, 'pdf'),
  ])

  await enregistrerFichiers(brouillon.id, { png: fichierPng.url, pdf: fichierPdf.url })

  if (!brouillon.telephoneHote) return

  const resultat = whatsappConfigure()
    ? await envoyerInvitationLivree({
        telephone: brouillon.telephoneHote,
        titre: brouillon.titre,
        lienInvitation: `${origine}/e/${brouillon.slug}`,
        urlPng: `${origine}${fichierPng.url}`,
        urlPdf: `${origine}${fichierPdf.url}`,
      })
    : { envoye: false, erreur: 'WhatsApp n’est pas configuré.' }

  await journaliserLivraison({
    evenementId: brouillon.id,
    canal: 'whatsapp',
    destinataire: brouillon.telephoneHote,
    statut: resultat.envoye ? 'envoyee' : 'echouee',
    ...(resultat.erreur ? { erreur: resultat.erreur } : {}),
  })
}

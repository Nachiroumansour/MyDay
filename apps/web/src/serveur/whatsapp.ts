/**
 * Livraison par WhatsApp (Cloud API de Meta).
 *
 * Non vérifiée en conditions réelles : l'API exige un compte Meta Business
 * vérifié et un numéro d'expédition homologué, démarche à mener en parallèle du
 * développement. Sans identifiants, l'envoi est journalisé et signalé comme
 * non configuré — le produit reste utilisable, avec le repli par lien de
 * téléchargement que prévoit la spec (§6.4).
 */
const BASE = process.env.WHATSAPP_API_BASE ?? 'https://graph.facebook.com/v21.0'

export interface ResultatEnvoi {
  envoye: boolean
  erreur?: string
}

export function whatsappConfigure(): boolean {
  return Boolean(process.env.WHATSAPP_ID_NUMERO && process.env.WHATSAPP_JETON)
}

/** WhatsApp attend un numéro international sans le « + ». */
function destinataire(telephone: string): string {
  return telephone.replace(/\D/g, '')
}

async function envoyer(corps: unknown): Promise<ResultatEnvoi> {
  const reponse = await fetch(`${BASE}/${process.env.WHATSAPP_ID_NUMERO}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_JETON}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(corps),
  })

  if (!reponse.ok) return { envoye: false, erreur: `${reponse.status} ${await reponse.text()}` }
  return { envoye: true }
}

export async function envoyerInvitationLivree(entree: {
  telephone: string
  titre: string
  lienInvitation: string
  urlPng: string
  urlPdf: string
}): Promise<ResultatEnvoi> {
  if (!whatsappConfigure()) {
    return { envoye: false, erreur: 'WhatsApp n’est pas configuré.' }
  }

  const numero = destinataire(entree.telephone)

  const texte = await envoyer({
    messaging_product: 'whatsapp',
    to: numero,
    type: 'text',
    text: {
      preview_url: true,
      body: [
        `Votre invitation « ${entree.titre} » est en ligne.`,
        '',
        `Le lien à partager : ${entree.lienInvitation}`,
        '',
        'Votre carte en haute définition et son PDF imprimable suivent.',
      ].join('\n'),
    },
  })
  if (!texte.envoye) return texte

  const image = await envoyer({
    messaging_product: 'whatsapp',
    to: numero,
    type: 'image',
    image: { link: entree.urlPng, caption: 'Votre carte en haute définition' },
  })
  if (!image.envoye) return image

  return envoyer({
    messaging_product: 'whatsapp',
    to: numero,
    type: 'document',
    document: {
      link: entree.urlPdf,
      filename: `${entree.titre.replace(/[^\w -]/g, '')}.pdf`,
      caption: 'Le PDF, prêt à imprimer',
    },
  })
}

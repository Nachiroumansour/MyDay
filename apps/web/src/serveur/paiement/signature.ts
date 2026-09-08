import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Vérifie la signature d'un webhook de paiement.
 *
 * Sans cette vérification, n'importe qui pourrait déclarer un paiement réussi
 * et repartir avec une invitation publiée et ses fichiers en haute définition.
 * La comparaison est à temps constant : une comparaison naïve laisse fuiter la
 * signature attendue, octet par octet.
 *
 * Un secret absent fait échouer la vérification. Le contraire — tout laisser
 * passer faute de configuration — est la façon la plus courante de se faire
 * vider une boutique.
 */
export function signatureValide(
  corps: string,
  signature: string | undefined | null,
  secret: string | undefined,
): boolean {
  if (!signature || !secret) return false

  const fournie = signature.replace(/^sha256=/, '')
  const attendue = createHmac('sha256', secret).update(corps, 'utf8').digest('hex')

  if (fournie.length !== attendue.length) return false

  return timingSafeEqual(Buffer.from(fournie, 'utf8'), Buffer.from(attendue, 'utf8'))
}

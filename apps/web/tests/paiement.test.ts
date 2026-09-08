import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { signatureValide } from '../src/serveur/paiement/signature'
import { montantAffichable, montantEnUnitesFournisseur } from '../src/serveur/paiement/montant'

describe('signatureValide', () => {
  const secret = 'whsec_exemple'
  const corps = '{"type":"checkout.session.completed"}'
  const bonne = createHmac('sha256', secret).update(corps).digest('hex')

  it('accepte une signature juste', () => {
    expect(signatureValide(corps, bonne, secret)).toBe(true)
  })

  it('refuse une signature fausse', () => {
    expect(signatureValide(corps, 'a'.repeat(64), secret)).toBe(false)
  })

  it('refuse une signature de la mauvaise longueur', () => {
    expect(signatureValide(corps, 'abc', secret)).toBe(false)
  })

  it('refuse un corps modifié', () => {
    expect(signatureValide('{"type":"autre"}', bonne, secret)).toBe(false)
  })

  it('refuse une signature absente', () => {
    expect(signatureValide(corps, undefined, secret)).toBe(false)
  })

  it('accepte le préfixe « sha256= » que certains fournisseurs ajoutent', () => {
    expect(signatureValide(corps, `sha256=${bonne}`, secret)).toBe(true)
  })

  it('refuse quand le secret est absent, plutôt que de tout laisser passer', () => {
    expect(signatureValide(corps, bonne, undefined)).toBe(false)
  })
})

describe('montants', () => {
  it('affiche un montant en francs CFA', () => {
    // Le séparateur de milliers français est une espace fine insécable.
    expect(montantAffichable(5000)).toBe('5\u202f000 F CFA')
  })

  it('n’ajoute pas de décimales : le franc CFA n’en a pas', () => {
    expect(montantAffichable(1234)).not.toContain(',')
  })

  it('envoie le franc CFA sans sous-unité au fournisseur', () => {
    expect(montantEnUnitesFournisseur(5000, 'XOF')).toBe('5000')
  })

  it('convertit en centimes pour une devise qui en a', () => {
    expect(montantEnUnitesFournisseur(50, 'EUR')).toBe('5000')
  })
})

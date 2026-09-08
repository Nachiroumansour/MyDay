import { describe, expect, it } from 'vitest'
import { lireSession, signerSession } from '../src/serveur/session'

const SECRET = 'un-secret-de-test-assez-long-pour-etre-credible'

describe('session administrateur', () => {
  it('relit une session qu’elle vient de signer', () => {
    const jeton = signerSession('atelier@exemple.sn', SECRET, 3600)
    expect(lireSession(jeton, SECRET)?.sujet).toBe('atelier@exemple.sn')
  })

  it('refuse une charge réécrite sans être resignée', () => {
    const jeton = signerSession('atelier@exemple.sn', SECRET, 3600)
    const [, signature] = jeton.split('.')

    // On remplace le sujet par un autre, en gardant la signature d'origine :
    // c'est exactement ce que tenterait un attaquant.
    const chargeForgee = Buffer.from(
      JSON.stringify({ sujet: 'pirate@exemple.sn', expireLe: 9_999_999_999 }),
    )
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    expect(lireSession(`${chargeForgee}.${signature}`, SECRET)).toBeUndefined()
  })

  it('refuse une signature tronquée', () => {
    const jeton = signerSession('atelier@exemple.sn', SECRET, 3600)
    expect(lireSession(jeton.slice(0, -4), SECRET)).toBeUndefined()
  })

  it('refuse un jeton signé d’un autre secret', () => {
    const jeton = signerSession('atelier@exemple.sn', 'autre-secret', 3600)
    expect(lireSession(jeton, SECRET)).toBeUndefined()
  })

  it('refuse un jeton expiré', () => {
    const jeton = signerSession('atelier@exemple.sn', SECRET, -1)
    expect(lireSession(jeton, SECRET)).toBeUndefined()
  })

  it('refuse un jeton informe', () => {
    expect(lireSession('nimporte-quoi', SECRET)).toBeUndefined()
    expect(lireSession('', SECRET)).toBeUndefined()
    expect(lireSession(undefined, SECRET)).toBeUndefined()
  })

  it('refuse quand le secret est absent, plutôt que de tout laisser passer', () => {
    const jeton = signerSession('atelier@exemple.sn', SECRET, 3600)
    expect(lireSession(jeton, undefined)).toBeUndefined()
  })
})

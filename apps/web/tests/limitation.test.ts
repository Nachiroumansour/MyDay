import { describe, expect, it } from 'vitest'
import { creerLimiteur } from '../src/serveur/limitation'

describe('creerLimiteur', () => {
  it('laisse passer sous le plafond', () => {
    const limiteur = creerLimiteur({ plafond: 3, fenetreMs: 1000 })
    expect(limiteur.autorise('a')).toBe(true)
    expect(limiteur.autorise('a')).toBe(true)
    expect(limiteur.autorise('a')).toBe(true)
  })

  it('refuse au-delà du plafond', () => {
    const limiteur = creerLimiteur({ plafond: 2, fenetreMs: 1000 })
    limiteur.autorise('a')
    limiteur.autorise('a')
    expect(limiteur.autorise('a')).toBe(false)
  })

  it('compte chaque clé séparément', () => {
    const limiteur = creerLimiteur({ plafond: 1, fenetreMs: 1000 })
    expect(limiteur.autorise('a')).toBe(true)
    expect(limiteur.autorise('b')).toBe(true)
  })

  it('oublie après la fenêtre', () => {
    let maintenant = 0
    const limiteur = creerLimiteur({ plafond: 1, fenetreMs: 1000, horloge: () => maintenant })
    expect(limiteur.autorise('a')).toBe(true)
    expect(limiteur.autorise('a')).toBe(false)
    maintenant = 1001
    expect(limiteur.autorise('a')).toBe(true)
  })

  it('borne sa mémoire au lieu de croître indéfiniment', () => {
    let maintenant = 0
    const limiteur = creerLimiteur({ plafond: 1, fenetreMs: 100, horloge: () => maintenant })

    // Deux mille clés distinctes, toutes périmées aussitôt : sans purge, la
    // carte en garderait deux mille.
    for (let i = 0; i < 2000; i += 1) {
      maintenant += 200
      limiteur.autorise(`cle-${i}`)
    }

    expect(limiteur.taille()).toBeLessThan(250)
  })
})

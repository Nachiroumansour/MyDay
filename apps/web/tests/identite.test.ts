import { describe, expect, it } from 'vitest'
import { lireIdentite, valeursDepuisIdentite, versParametres } from '../src/lib/identite'

describe('lireIdentite', () => {
  it('lit les prénoms et la date', () => {
    expect(lireIdentite({ n1: 'Awa', n2: 'Moussa', d: '2027-03-14' })).toEqual({
      nom1: 'Awa',
      nom2: 'Moussa',
      date: '2027-03-14',
    })
  })

  it('accepte un seul prénom', () => {
    expect(lireIdentite({ n1: 'Fatou' })).toEqual({ nom1: 'Fatou' })
  })

  it('ne retient rien quand rien n’est fourni', () => {
    expect(lireIdentite({})).toEqual({})
  })

  it('nettoie les espaces superflus', () => {
    expect(lireIdentite({ n1: '  Awa  ' }).nom1).toBe('Awa')
  })

  it('écarte un prénom trop long plutôt que de casser la carte', () => {
    expect(lireIdentite({ n1: 'A'.repeat(60) }).nom1).toBeUndefined()
  })

  it('écarte les caractères de contrôle', () => {
    expect(lireIdentite({ n1: 'Awa\u0007\u001f' }).nom1).toBe('Awa')
  })

  it('refuse une date qui n’en est pas une', () => {
    expect(lireIdentite({ d: 'demain' }).date).toBeUndefined()
    expect(lireIdentite({ d: '2027-13-45' }).date).toBeUndefined()
  })

  it('refuse un 31 février', () => {
    expect(lireIdentite({ d: '2027-02-31' }).date).toBeUndefined()
  })

  it('accepte une valeur répétée en ne gardant que la première', () => {
    expect(lireIdentite({ n1: ['Awa', 'Autre'] }).nom1).toBe('Awa')
  })
})

describe('versParametres', () => {
  it('reconstruit la chaîne de requête', () => {
    expect(versParametres({ nom1: 'Awa', nom2: 'Moussa', date: '2027-03-14' })).toBe(
      'n1=Awa&n2=Moussa&d=2027-03-14',
    )
  })

  it('omet ce qui est absent', () => {
    expect(versParametres({ nom1: 'Fatou' })).toBe('n1=Fatou')
  })

  it('rend une chaîne vide pour une identité vide', () => {
    expect(versParametres({})).toBe('')
  })

  it('encode les caractères spéciaux', () => {
    expect(versParametres({ nom1: 'Marie José' })).toBe('n1=Marie%20Jos%C3%A9')
  })

  it('fait l’aller-retour sans perte', () => {
    const identite = { nom1: 'Ndèye Awa', nom2: 'Ibrahima', date: '2027-03-14' }
    expect(lireIdentite(new URLSearchParams(versParametres(identite)))).toEqual(identite)
  })
})

describe('valeursDepuisIdentite', () => {
  it('remplit les champs de la carte', () => {
    expect(valeursDepuisIdentite({ nom1: 'Awa', nom2: 'Moussa', date: '2027-03-14' })).toEqual({
      nom_1: 'Awa',
      nom_2: 'Moussa',
      date: '14 mars 2027',
    })
  })

  it('n’invente rien quand l’identité est vide', () => {
    expect(valeursDepuisIdentite({})).toEqual({})
  })

  it('écrit la date en français', () => {
    expect(valeursDepuisIdentite({ date: '2027-12-01' }).date).toBe('1 décembre 2027')
  })
})

describe('un seul champ pour deux prénoms', () => {
  it('scinde « Amina & Lamine »', () => {
    expect(lireIdentite({ n1: 'Amina & Lamine' })).toEqual({
      nom1: 'Amina',
      nom2: 'Lamine',
    })
  })

  it('scinde aussi sur « et »', () => {
    expect(lireIdentite({ n1: 'Awa et Moussa' })).toEqual({ nom1: 'Awa', nom2: 'Moussa' })
  })

  it('laisse un prénom seul intact', () => {
    expect(lireIdentite({ n1: 'Sokhna' })).toEqual({ nom1: 'Sokhna' })
  })

  it('n’est pas trompé par un prénom composé', () => {
    expect(lireIdentite({ n1: 'Marie-José' })).toEqual({ nom1: 'Marie-José' })
  })

  it('fait toujours l’aller-retour', () => {
    const identite = lireIdentite({ n1: 'Amina & Lamine', d: '2027-03-14' })
    expect(lireIdentite(new URLSearchParams(versParametres(identite)))).toEqual(identite)
  })
})

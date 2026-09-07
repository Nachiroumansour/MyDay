import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { composerCarte } from '../src/composition.js'
import { chargerPolicesDepuisDossier } from '../src/rendu/polices.js'

const racine = fileURLToPath(new URL('..', import.meta.url))
const polices = await chargerPolicesDepuisDossier(`${racine}demo/polices`)
const gabarit = await readFile(`${racine}demo/gabarits/mariage-indigo.svg`, 'utf8')

describe('composerCarte', () => {
  it('écrit les valeurs du client dans la carte', () => {
    const carte = composerCarte({
      gabaritSvg: gabarit,
      valeurs: { nom_1: 'Aminata', nom_2: 'Ibrahima', lieu: 'Saly', date: '2 mai 2027' },
      polices,
    })
    // Le texte est vectorisé : on vérifie que le gabarit d'origine a disparu.
    expect(carte.svg).not.toContain('>Awa<')
    expect(carte.svg).not.toContain('>Dakar<')
    expect(carte.svg).toContain('<path')
  })

  it('expose les champs découverts dans le gabarit', () => {
    const carte = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices })
    expect(carte.champs.map((c) => c.id)).toEqual([
      'nom_1', 'nom_2', 'zone_photo', 'date', 'lieu',
    ])
  })

  it('ne laisse aucun texte non vectorisé', () => {
    const carte = composerCarte({ gabaritSvg: gabarit, valeurs: { nom_1: 'Aminata' }, polices })
    expect(carte.svg).not.toContain('<text')
    expect(carte.policesManquantes).toEqual([])
  })

  it('signale un prénom trop long au lieu de le laisser déborder', () => {
    const carte = composerCarte({
      gabaritSvg: gabarit,
      valeurs: { nom_1: 'Aminata Ndèye Coumba Marie José Sokhna Bousso' },
      polices,
    })
    expect(carte.debordements).toContain('nom_1')
  })

  it('réduit la taille du texte sans le signaler quand il finit par tenir', () => {
    const carte = composerCarte({ gabaritSvg: gabarit, valeurs: { nom_1: 'Mariama' }, polices })
    expect(carte.debordements).toEqual([])
  })

  it('insère la photo quand elle est fournie', () => {
    const carte = composerCarte({
      gabaritSvg: gabarit,
      valeurs: {},
      photo: { source: 'data:image/jpeg;base64,AAA', largeur: 1200, hauteur: 900 },
      polices,
    })
    expect(carte.svg).toContain('<image')
    expect(carte.svg).toContain('clip-path')
  })

  it('n’appose le filigrane que sur demande', () => {
    const sans = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices })
    const avec = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices, filigrane: true })
    expect(sans.svg).not.toContain('data-filigrane')
    expect(avec.svg).toContain('data-filigrane')
  })

  it('vectorise aussi le filigrane, pour qu’il ne puisse pas disparaître au rendu', () => {
    const avec = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices, filigrane: true })
    expect(avec.svg).not.toContain('<text')
    expect(avec.svg).toContain('data-filigrane')
  })

  it('remonte la taille physique du gabarit', () => {
    const carte = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices })
    expect(carte.dimensions).toEqual({ largeurMm: 127, hauteurMm: 190.5 })
  })

  it('signale une police absente du catalogue', async () => {
    const vide = await chargerPolicesDepuisDossier(`${racine}demo/gabarits`)
    const carte = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices: vide })
    expect(carte.policesManquantes).toEqual(expect.arrayContaining(['Marcellus', 'GreatVibes']))
  })
})

describe('zone photo laissée vide', () => {
  it('ne laisse aucun rectangle noir sur la carte', () => {
    const carte = composerCarte({ gabaritSvg: gabarit, valeurs: {}, polices })
    expect(carte.svg).not.toContain('data-type="image"')
    expect(carte.svg).not.toContain('<image')
  })

  it('garde la zone quand une photo est fournie', () => {
    const carte = composerCarte({
      gabaritSvg: gabarit,
      valeurs: {},
      photo: { source: 'data:image/jpeg;base64,AAA', largeur: 800, hauteur: 800 },
      polices,
    })
    expect(carte.svg).toContain('<image')
  })
})

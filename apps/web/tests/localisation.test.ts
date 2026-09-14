import { describe, expect, it } from 'vitest'
import { estLienCourt, extraireCoordonnees, formaterPoint } from '../src/lib/localisation'

const GRAND_THEATRE = { latitude: 14.6741, longitude: -17.4406 }

describe('extraireCoordonnees', () => {
  it('lit le point d’un lien de lieu Google Maps', () => {
    expect(
      extraireCoordonnees(
        'https://www.google.com/maps/place/Grand+Th%C3%A9%C3%A2tre/@14.6741,-17.4406,17z/data=!4m6!3m5!1s0x0:0x0!8m2!3d14.6741!4d-17.4406',
      ),
    ).toEqual(GRAND_THEATRE)
  })

  it('lit le point d’un lien sans bloc de données', () => {
    expect(extraireCoordonnees('https://www.google.com/maps/@14.6741,-17.4406,18z')).toEqual(
      GRAND_THEATRE,
    )
  })

  it('lit un lien construit à la main', () => {
    expect(extraireCoordonnees('https://maps.google.com/?q=14.6741,-17.4406')).toEqual(
      GRAND_THEATRE,
    )
    expect(extraireCoordonnees('https://maps.google.com/?ll=14.6741,-17.4406&z=17')).toEqual(
      GRAND_THEATRE,
    )
  })

  it('accepte des coordonnées tapées à la main', () => {
    expect(extraireCoordonnees('14.6741, -17.4406')).toEqual(GRAND_THEATRE)
    expect(extraireCoordonnees('  14.6741,-17.4406  ')).toEqual(GRAND_THEATRE)
  })

  it('lit un lien dont les virgules sont encodées', () => {
    expect(extraireCoordonnees('https://maps.google.com/?q=14.6741%2C-17.4406')).toEqual(
      GRAND_THEATRE,
    )
  })

  it('préfère le lieu à la position de la caméra', () => {
    // Le `@` cadre la vue, `!3d!4d` désigne le lieu : les deux diffèrent quand
    // l'utilisateur a fait glisser la carte avant de partager.
    expect(
      extraireCoordonnees('https://www.google.com/maps/place/X/@14.70,-17.50,17z/data=!3d14.6741!4d-17.4406'),
    ).toEqual(GRAND_THEATRE)
  })

  it('ne rend rien d’une recherche sans point', () => {
    expect(extraireCoordonnees('https://www.google.com/maps/search/mosquée+dakar')).toBeUndefined()
  })

  it('ne rend rien d’un texte quelconque', () => {
    expect(extraireCoordonnees('Grand Théâtre, Dakar')).toBeUndefined()
    expect(extraireCoordonnees('')).toBeUndefined()
  })

  it('écarte le point nul, qui trahit une extraction ratée', () => {
    expect(extraireCoordonnees('https://maps.google.com/?q=0,0')).toBeUndefined()
  })

  it('écarte des coordonnées hors du monde', () => {
    expect(extraireCoordonnees('https://maps.google.com/?q=91.2,-17.4')).toBeUndefined()
    expect(extraireCoordonnees('https://maps.google.com/?q=14.6,-181')).toBeUndefined()
  })
})

describe('estLienCourt', () => {
  it('reconnaît un lien de partage à déplier', () => {
    expect(estLienCourt('https://maps.app.goo.gl/aBcDeF123')).toBe(true)
  })

  it('ne déplie pas un lien qui porte déjà le point', () => {
    expect(estLienCourt('https://maps.google.com/?q=14.6741,-17.4406')).toBe(false)
  })

  it('ne déplie pas n’importe quelle adresse', () => {
    expect(estLienCourt('https://exemple.test/x')).toBe(false)
    expect(estLienCourt('14.6741, -17.4406')).toBe(false)
  })
})

describe('formaterPoint', () => {
  it('rend le point lisible pour l’hôte', () => {
    expect(formaterPoint(GRAND_THEATRE)).toBe('14.67410, -17.44060')
  })
})

describe('resoudrePoint', () => {
  it('lit un lien long sans sortir sur le réseau', async () => {
    const { resoudrePoint } = await import('../src/serveur/localisation')
    const appels: string[] = []
    const vraiFetch = globalThis.fetch
    globalThis.fetch = (async (url: RequestInfo | URL) => {
      appels.push(String(url))
      throw new Error('aucune requête ne devrait partir')
    }) as typeof fetch

    try {
      expect(await resoudrePoint('https://maps.google.com/?q=14.6741,-17.4406')).toEqual(
        GRAND_THEATRE,
      )
      expect(appels).toEqual([])
    } finally {
      globalThis.fetch = vraiFetch
    }
  })

  it('déplie un lien court jusqu’au point', async () => {
    const { resoudrePoint } = await import('../src/serveur/localisation')
    const vraiFetch = globalThis.fetch
    globalThis.fetch = (async () =>
      new Response(null, {
        status: 302,
        headers: { location: 'https://www.google.com/maps/place/X/@14.6741,-17.4406,17z' },
      })) as typeof fetch

    try {
      expect(await resoudrePoint('https://maps.app.goo.gl/aBcDeF')).toEqual(GRAND_THEATRE)
    } finally {
      globalThis.fetch = vraiFetch
    }
  })

  it('rend la main sans point plutôt que d’échouer quand le réseau lâche', async () => {
    const { resoudrePoint } = await import('../src/serveur/localisation')
    const vraiFetch = globalThis.fetch
    globalThis.fetch = (async () => {
      throw new Error('réseau coupé')
    }) as typeof fetch

    try {
      expect(await resoudrePoint('https://maps.app.goo.gl/aBcDeF')).toBeUndefined()
    } finally {
      globalThis.fetch = vraiFetch
    }
  })

  it('ne rend rien d’un champ laissé vide', async () => {
    const { resoudrePoint } = await import('../src/serveur/localisation')
    expect(await resoudrePoint('   ')).toBeUndefined()
  })
})

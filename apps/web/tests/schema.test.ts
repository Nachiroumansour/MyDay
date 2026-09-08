import { getTableColumns, getTableName } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import {
  ceremonies,
  evenements,
  gabarits,
  graphistes,
  invites,
  reponses,
  typeEvenementEnum,
} from '../src/serveur/bdd/schema'
import { TYPES_EVENEMENT } from '../src/lib/evenements'

describe('schéma de la base', () => {
  it('déclare les six tables du bloc 1', () => {
    expect([graphistes, gabarits, evenements, ceremonies, invites, reponses].map(getTableName))
      .toEqual(['graphistes', 'gabarits', 'evenements', 'ceremonies', 'invites', 'reponses'])
  })

  it('aligne les types d’événement de la base sur ceux de l’application', () => {
    expect([...typeEvenementEnum.enumValues]).toEqual([...TYPES_EVENEMENT])
  })

  it('protège le brouillon par un secret unique', () => {
    const colonne = getTableColumns(evenements).secretBrouillon
    expect(colonne.notNull).toBe(true)
    expect(colonne.isUnique).toBe(true)
  })

  it('donne à chaque invité un jeton unique pour son lien nominatif', () => {
    const colonne = getTableColumns(invites).jeton
    expect(colonne.notNull).toBe(true)
    expect(colonne.isUnique).toBe(true)
  })

  it('enregistre le repère parlé de chaque cérémonie', () => {
    // Au Sénégal l'adresse formelle ne guide personne, le repère guide tout le
    // monde : il est de premier rang, pas une note secondaire.
    const colonnes = getTableColumns(ceremonies)
    expect(colonnes.repere).toBeDefined()
    expect(colonnes.lieu.notNull).toBe(true)
  })

  it('ordonne les cérémonies d’un même événement', () => {
    expect(getTableColumns(ceremonies).rang.notNull).toBe(true)
  })

  it('permet à une réponse de couvrir plusieurs cérémonies', () => {
    expect(getTableColumns(reponses).ceremonieIds).toBeDefined()
  })

  it('n’exige ni compte ni adresse électronique pour répondre', () => {
    const colonnes = getTableColumns(reponses)
    expect(colonnes.nom.notNull).toBe(true)
    expect(colonnes.telephone.notNull).toBe(true)
    expect('email' in colonnes).toBe(false)
  })

  it('rattache une réponse à un invité sans l’exiger', () => {
    // Le lien générique partagé en groupe WhatsApp n'a pas d'invité connu.
    expect(getTableColumns(reponses).inviteId.notNull).toBe(false)
  })
})

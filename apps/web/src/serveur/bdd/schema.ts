import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

const identifiant = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

export const typeEvenementEnum = pgEnum('type_evenement', [
  'mariage',
  'bapteme',
  'anniversaire',
])

export const statutGabaritEnum = pgEnum('statut_gabarit', ['brouillon', 'actif', 'archive'])

export const statutEvenementEnum = pgEnum('statut_evenement', ['brouillon', 'publie', 'archive'])

export const statutPaiementEnum = pgEnum('statut_paiement', [
  'en_attente',
  'reussi',
  'echoue',
  'annule',
])

export const fournisseurEnum = pgEnum('fournisseur_paiement', [
  'wave',
  'orange_money',
  'simule',
])

export const statutLivraisonEnum = pgEnum('statut_livraison', [
  'en_attente',
  'envoyee',
  'echouee',
])

export const graphistes = pgTable('graphistes', {
  id: identifiant(),
  nom: text('nom').notNull(),
  bio: text('bio'),
  photoUrl: text('photo_url'),
  contact: text('contact').notNull(),
  /** Part du prix de vente reversée, en pourcentage. */
  partRevenu: numeric('part_revenu', { precision: 5, scale: 2 }).notNull(),
  creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
})

export const gabarits = pgTable(
  'gabarits',
  {
    id: identifiant(),
    slug: text('slug').notNull().unique(),
    nom: text('nom').notNull(),
    typeEvenement: typeEvenementEnum('type_evenement').notNull(),
    sourceSvg: text('source_svg').notNull(),
    apercuUrl: text('apercu_url'),
    /** Champs découverts par le moteur : identifiant, type, cadre, longueur. */
    champs: jsonb('champs').notNull(),
    etiquettes: text('etiquettes').array().notNull().default([]),
    prix: integer('prix').notNull(),
    statut: statutGabaritEnum('statut').notNull().default('brouillon'),
    nbVentes: integer('nb_ventes').notNull().default(0),
    graphisteId: text('graphiste_id')
      .notNull()
      .references(() => graphistes.id),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    modifieLe: timestamp('modifie_le', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('gabarits_type_statut').on(table.typeEvenement, table.statut)],
)

export const evenements = pgTable(
  'evenements',
  {
    id: identifiant(),
    slug: text('slug').notNull().unique(),
    /** Secret d'URL du brouillon : aucun compte n'est demandé avant le paiement. */
    secretBrouillon: text('secret_brouillon').notNull().unique(),
    titre: text('titre').notNull(),
    typeEvenement: typeEvenementEnum('type_evenement').notNull(),
    gabaritId: text('gabarit_id')
      .notNull()
      .references(() => gabarits.id),
    valeursChamps: jsonb('valeurs_champs').notNull(),
    photoUrl: text('photo_url'),
    /** Zoom et point focal choisis au doigt par le client. */
    recadrage: jsonb('recadrage'),
    codeVestimentaire: text('code_vestimentaire'),
    motDesHotes: text('mot_des_hotes'),
    statut: statutEvenementEnum('statut').notNull().default('brouillon'),
    publieLe: timestamp('publie_le', { withTimezone: true }),
    telephoneHote: text('telephone_hote'),
    /** Fichiers livrés, produits une fois le paiement confirmé. */
    fichierPng: text('fichier_png'),
    fichierPdf: text('fichier_pdf'),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    modifieLe: timestamp('modifie_le', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('evenements_statut').on(table.statut)],
)

export const paiements = pgTable(
  'paiements',
  {
    id: identifiant(),
    evenementId: text('evenement_id')
      .notNull()
      .references(() => evenements.id, { onDelete: 'cascade' }),
    fournisseur: fournisseurEnum('fournisseur').notNull(),
    /** Référence de la session chez le fournisseur : la clé d'idempotence. */
    reference: text('reference').notNull().unique(),
    montant: integer('montant').notNull(),
    devise: text('devise').notNull().default('XOF'),
    statut: statutPaiementEnum('statut').notNull().default('en_attente'),
    urlPaiement: text('url_paiement'),
    /** Charge utile du fournisseur, gardée telle quelle pour les litiges. */
    charge: jsonb('charge'),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    confirmeLe: timestamp('confirme_le', { withTimezone: true }),
  },
  (table) => [index('paiements_evenement').on(table.evenementId, table.statut)],
)

export const livraisons = pgTable(
  'livraisons',
  {
    id: identifiant(),
    evenementId: text('evenement_id')
      .notNull()
      .references(() => evenements.id, { onDelete: 'cascade' }),
    canal: text('canal').notNull(),
    destinataire: text('destinataire').notNull(),
    statut: statutLivraisonEnum('statut').notNull().default('en_attente'),
    erreur: text('erreur'),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    envoyeeLe: timestamp('envoyee_le', { withTimezone: true }),
  },
  (table) => [index('livraisons_evenement').on(table.evenementId)],
)

export const ceremonies = pgTable(
  'ceremonies',
  {
    id: identifiant(),
    evenementId: text('evenement_id')
      .notNull()
      .references(() => evenements.id, { onDelete: 'cascade' }),
    /** Ordre d'affichage dans le programme. */
    rang: integer('rang').notNull(),
    nom: text('nom').notNull(),
    debuteLe: timestamp('debute_le', { withTimezone: true }).notNull(),
    termineLe: timestamp('termine_le', { withTimezone: true }),
    lieu: text('lieu').notNull(),
    adresse: text('adresse'),
    /** Le repère parlé — « en face de la station Total de Sacré-Cœur 3 ». */
    repere: text('repere'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    codeVestimentaire: text('code_vestimentaire'),
    note: text('note'),
  },
  (table) => [uniqueIndex('ceremonies_evenement_rang').on(table.evenementId, table.rang)],
)

export const invites = pgTable(
  'invites',
  {
    id: identifiant(),
    evenementId: text('evenement_id')
      .notNull()
      .references(() => evenements.id, { onDelete: 'cascade' }),
    nomComplet: text('nom_complet').notNull(),
    telephone: text('telephone'),
    /** Jeton court et non devinable du lien nominatif. */
    jeton: text('jeton').notNull().unique(),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('invites_evenement').on(table.evenementId)],
)

export const reponses = pgTable(
  'reponses',
  {
    id: identifiant(),
    evenementId: text('evenement_id')
      .notNull()
      .references(() => evenements.id, { onDelete: 'cascade' }),
    /** Nul quand la réponse vient du lien générique partagé en groupe. */
    inviteId: text('invite_id')
      .unique()
      .references(() => invites.id, { onDelete: 'cascade' }),
    nom: text('nom').notNull(),
    telephone: text('telephone').notNull(),
    present: boolean('present').notNull(),
    nbPersonnes: integer('nb_personnes').notNull().default(1),
    /** Cérémonies auxquelles l'invité assistera. */
    ceremonieIds: text('ceremonie_ids').array().notNull().default([]),
    message: text('message'),
    creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
    modifieLe: timestamp('modifie_le', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('reponses_evenement_present').on(table.evenementId, table.present),
    // Un invité qui répond une seconde fois corrige sa réponse : il ne
    // compte pas deux fois dans le total attendu.
    uniqueIndex('reponses_evenement_telephone').on(table.evenementId, table.telephone),
  ],
)

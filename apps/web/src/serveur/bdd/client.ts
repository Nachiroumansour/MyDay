import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error(
    'DATABASE_URL est absente. Copiez apps/web/.env.example vers apps/web/.env.',
  )
}

// Next recharge les modules à chaud en développement : sans ce cache, chaque
// rechargement ouvrirait un nouveau pool de connexions.
const global_ = globalThis as unknown as { connexion?: ReturnType<typeof postgres> }

const connexion = global_.connexion ?? postgres(url, { max: 10 })
if (process.env.NODE_ENV !== 'production') global_.connexion = connexion

export const bdd = drizzle(connexion, { schema })

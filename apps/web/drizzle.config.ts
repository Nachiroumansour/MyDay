import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/serveur/bdd/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://myday:myday@localhost:5435/myday',
  },
})

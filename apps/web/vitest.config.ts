import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Le même alias que TypeScript et Next : sans lui, aucun module de
  // `src/serveur` n'est testable, puisqu'ils s'importent tous en `@/`.
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})

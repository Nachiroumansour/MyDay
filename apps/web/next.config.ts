import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@myday/moteur'],
  // Module natif : il ne doit pas passer par le bundler.
  serverExternalPackages: ['@resvg/resvg-js'],
  // Les polices sont lues sur le disque au rendu : elles doivent suivre le
  // déploiement, que le bundler ne détecte pas tout seul.
  outputFileTracingIncludes: {
    '/**': ['./polices/**'],
  },

  async headers() {
    return [
      {
        source: '/:chemin*',
        headers: [
          // Empêche un navigateur de deviner un type et d'exécuter ce qui
          // devrait être une image.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Une invitation ne doit pas pouvoir être encadrée par un tiers.
          { key: 'X-Frame-Options', value: 'DENY' },
          // L'adresse d'un brouillon est un secret : elle ne doit pas fuir
          // dans le référent d'un site tiers.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

export default config

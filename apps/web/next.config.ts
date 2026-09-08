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
}

export default config

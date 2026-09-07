import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@myday/moteur'],
  serverExternalPackages: ['@resvg/resvg-js'],
}

export default config

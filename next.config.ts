import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    globalNotFound: true,
  },
  images: {
    // Chaque photo envoyée a un nom unique : son contenu ne change jamais.
    minimumCacheTTL: 31536000,
  },
  // Le français vit à la racine : / est servi par la page /fr, et /fr renvoie vers /.
  async redirects() {
    return [{ source: '/fr', destination: '/', permanent: true }]
  },
  async rewrites() {
    return [{ source: '/', destination: '/fr' }]
  },
}

export default nextConfig

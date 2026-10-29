import type { NextConfig } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL manque : copie .env.example en .env.local, ou ajoute-la dans Vercel')
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    globalNotFound: true,
  },
  images: {
    // Chaque photo envoyée a un nom unique : son contenu ne change jamais.
    minimumCacheTTL: 31536000,
    // Seules les photos du bucket media sont optimisées, aucune autre adresse.
    remotePatterns: [new URL(`${supabaseUrl}/storage/v1/object/public/media/**`)],
  },
  // L'admin n'apparaît jamais dans les moteurs de recherche (en plus de la balise robots de ses pages).
  async headers() {
    return [{ source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
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

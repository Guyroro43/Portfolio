import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseEnv } from '@/lib/supabase/env'

/**
 * Rafraîchit la session de l'admin avant chaque page de /admin (jeton expiré, cookies à réécrire).
 * Ce n'est pas un contrôle d'accès : chaque page et chaque Server Action vérifie elle-même
 * (lib/admin/auth.ts). Le site public ne passe jamais par ici.
 */
export async function proxy(request: NextRequest) {
  const { url, key } = supabaseEnv()
  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
        // Une réponse qui pose une session ne doit jamais être gardée en cache.
        for (const [header, value] of Object.entries(headers)) response.headers.set(header, value)
      },
    },
  })

  await supabase.auth.getClaims()
  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Aperçu du brouillon (cookie de Next.js, posé par le bouton Aperçu) : la session de l'admin
    // doit aussi se rafraîchir sur les pages du site. Les visiteurs n'ont pas ce cookie.
    { source: '/', has: [{ type: 'cookie', key: '__prerender_bypass' }] },
    { source: '/en', has: [{ type: 'cookie', key: '__prerender_bypass' }] },
  ],
}

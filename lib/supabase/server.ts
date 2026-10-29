import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseEnv } from './env'

/**
 * Client Supabase avec la session de l'admin, lue dans les cookies.
 * Un nouveau client par requête : pages, Server Actions et routes de l'admin.
 */
export async function createSessionClient() {
  const { url, key } = supabaseEnv()
  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // Une page ne peut pas écrire de cookie : proxy.ts s'en charge à la requête suivante.
        // Les Server Actions et les routes, elles, peuvent.
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options)
        } catch {}
      },
    },
  })
}

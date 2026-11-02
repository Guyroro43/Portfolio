import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase du navigateur, avec la session de l'admin (cookies) : il envoie les photos
 * directement dans le bucket media, sous les règles RLS du stockage. Admin seulement.
 */
export function createAdminBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Configuration Supabase manquante')
  return createBrowserClient(url, key)
}

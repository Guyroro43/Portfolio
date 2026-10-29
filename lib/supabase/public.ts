import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase sans session, avec la clé publishable.
 * Il ne voit que ce que les règles RLS ouvrent aux visiteurs : la version publiée et les photos.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY manque (voir .env.example)')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

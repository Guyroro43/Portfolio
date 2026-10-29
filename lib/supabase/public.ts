import { createClient } from '@supabase/supabase-js'
import { supabaseEnv } from './env'

/**
 * Client Supabase sans session, avec la clé publishable.
 * Il ne voit que ce que les règles RLS ouvrent aux visiteurs : la version publiée.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv()
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

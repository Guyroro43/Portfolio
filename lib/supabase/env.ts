/**
 * Adresse du projet Supabase et clé publishable. Elles sont publiques par nature :
 * la sécurité repose sur les règles RLS (supabase/migrations).
 */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY manque (voir .env.example)')
  }
  return { url, key }
}

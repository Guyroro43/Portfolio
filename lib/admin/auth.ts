import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createSessionClient } from '@/lib/supabase/server'

/** Le seul compte autorisé : ADMIN_EMAIL, la même adresse que is_admin() dans Supabase. */
export function isAdminEmail(email: string | null | undefined): boolean {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!admin) throw new Error('ADMIN_EMAIL manque (voir .env.example)')
  return !!email && email.trim().toLowerCase() === admin
}

/**
 * Session de l'admin, vérifiée : getClaims() contrôle la signature du jeton (jamais getSession()
 * côté serveur), puis l'email doit être ADMIN_EMAIL. Lue une seule fois par affichage de page.
 */
const readAdmin = cache(async () => {
  const supabase = await createSessionClient()
  const { data, error } = await supabase.auth.getClaims()
  const email = data?.claims.email
  if (error || !email || !isAdminEmail(email)) return null
  return { email, supabase }
})

/** L'admin connecté, ou null. Pour les pages de connexion, qui renvoient vers l'admin si c'est déjà fait. */
export async function getAdmin() {
  return readAdmin()
}

/** À appeler en tête de chaque page et de chaque Server Action de l'admin. */
export async function requireAdmin() {
  const admin = await readAdmin()
  if (!admin) redirect('/admin/login')
  return admin
}

import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { createSessionClient } from '@/lib/supabase/server'

/**
 * Arrivée depuis le lien de l'email « Mot de passe oublié ».
 * token_hash : modèle d'email modifié dans Supabase, marche sur n'importe quel appareil.
 * code : modèle d'origine, marche seulement dans le navigateur qui a fait la demande.
 * Le lien ouvre une session, puis mène au choix du nouveau mot de passe. Aucune autre destination.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const tokenHash = params.get('token_hash')
  const code = params.get('code')
  const supabase = await createSessionClient()

  let ok = false
  if (tokenHash && params.get('type') === 'recovery') {
    ok = !(await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash })).error
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error
  }

  redirect(ok ? '/admin/nouveau-mot-de-passe' : '/admin/login?erreur=lien')
}

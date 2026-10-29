'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { isAdminEmail, requireAdmin } from '@/lib/admin/auth'
import { createSessionClient } from '@/lib/supabase/server'

export type FormState = { error: string | null; email?: string; sent?: boolean }

const email = z.string().trim().toLowerCase().pipe(z.email().max(254))

const TOO_MANY = 'Trop de tentatives. Attends quelques minutes, puis réessaie.'
const UNAVAILABLE = 'Supabase ne répond pas pour le moment. Réessaie dans un instant.'

function isRateLimited(error: { status?: number; code?: string }) {
  return error.status === 429 || error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit'
}

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ email, password: z.string().min(1).max(200) })
    .safeParse({ email: formData.get('email'), password: formData.get('password') })
  const typedEmail = String(formData.get('email') ?? '').slice(0, 254)
  if (!parsed.success) return { error: 'Entre ton email et ton mot de passe.', email: typedEmail }

  const supabase = await createSessionClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    if (isRateLimited(error)) return { error: TOO_MANY, email: typedEmail }
    if (error.code === 'invalid_credentials') return { error: 'Email ou mot de passe incorrect.', email: typedEmail }
    return { error: UNAVAILABLE, email: typedEmail }
  }
  // Un autre compte ne devrait pas exister (inscriptions fermées). S'il existe, il ressort aussitôt.
  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut()
    return { error: 'Email ou mot de passe incorrect.', email: typedEmail }
  }
  redirect('/admin')
}

export async function signOut() {
  const supabase = await createSessionClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function requestPasswordReset(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = email.safeParse(formData.get('email'))
  if (!parsed.success) return { error: 'Entre une adresse email valide.' }

  // Rien ne part pour une autre adresse. La réponse est la même dans les deux cas.
  if (isAdminEmail(parsed.data)) {
    const requestHeaders = await headers()
    const origin = requestHeaders.get('origin') ?? `https://${requestHeaders.get('host')}`
    const supabase = await createSessionClient()
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      // Supabase n'accepte que les adresses de sa liste « Redirect URLs ».
      redirectTo: `${origin}/admin/auth/confirm`,
    })
    if (error) return { error: isRateLimited(error) ? TOO_MANY : UNAVAILABLE }
  }
  return { error: null, sent: true }
}

export async function updatePassword(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin()
  const password = String(formData.get('password') ?? '')
  if (password.length < 12) return { error: 'Choisis au moins 12 caractères.' }
  if (password.length > 200) return { error: 'Choisis au plus 200 caractères.' }
  if (password !== formData.get('confirm')) return { error: 'Les deux mots de passe ne sont pas identiques.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (error.code === 'same_password') return { error: 'Choisis un mot de passe différent de l’ancien.' }
    if (error.code === 'weak_password') return { error: 'Ce mot de passe est trop simple. Allonge-le ou mélange les caractères.' }
    return { error: isRateLimited(error) ? TOO_MANY : UNAVAILABLE }
  }
  redirect('/admin')
}

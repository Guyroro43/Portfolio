'use client'

import { Mail } from 'lucide-react'
import { useActionState } from 'react'
import { AuthError, AuthSubmit, authInput, authLabel } from '@/components/admin/auth-fields'
import { requestPasswordReset, type FormState } from '@/app/admin/actions'

export function ResetForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, { error: null })

  if (state.sent) {
    return (
      <p role="status" className="rounded-xl border border-white/12 bg-night px-4 py-3.5 text-sm leading-relaxed text-side">
        Si cette adresse est celle de l’admin, un email vient de partir. Ouvre le lien qu’il contient pour choisir un
        nouveau mot de passe. Pense à regarder dans les spams.
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={authLabel}>
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" spellCheck={false} className={authInput} />
      </div>

      <AuthError message={state.error} />

      <AuthSubmit pending={pending}>
        <Mail size={18} aria-hidden="true" />
        {pending ? 'Envoi…' : 'Recevoir le lien'}
      </AuthSubmit>

      <a href="/admin/login" className="inline-flex min-h-11 items-center justify-center text-[13px] text-ocre">
        Je me souviens, me connecter
      </a>
    </form>
  )
}

'use client'

import { KeyRound } from 'lucide-react'
import { useActionState } from 'react'
import { AuthError, AuthSubmit, authInput, authLabel } from '@/components/admin/auth-fields'
import { updatePassword, type FormState } from '../actions'

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(updatePassword, { error: null })

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={authLabel}>
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          aria-describedby="password-hint"
          className={authInput}
        />
        <p id="password-hint" className="text-xs text-side-faint">
          12 caractères au moins. Une phrase de quelques mots marche très bien.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className={authLabel}>
          Encore une fois
        </label>
        <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={authInput} />
      </div>

      <AuthError message={state.error} />

      <AuthSubmit pending={pending}>
        <KeyRound size={18} aria-hidden="true" />
        {pending ? 'Enregistrement…' : 'Enregistrer et entrer'}
      </AuthSubmit>
    </form>
  )
}

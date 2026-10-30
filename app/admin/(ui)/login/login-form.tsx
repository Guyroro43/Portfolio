'use client'

import { Lock } from 'lucide-react'
import { useActionState } from 'react'
import { AuthError, AuthSubmit, authInput, authLabel } from '@/components/admin/auth-fields'
import { signIn, type FormState } from '@/app/admin/actions'

export function LoginForm({ notice }: { notice: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, { error: notice })

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={authLabel}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          spellCheck={false}
          defaultValue={state.email}
          className={authInput}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="password" className={authLabel}>
            Mot de passe
          </label>
          <a href="/admin/mot-de-passe-oublie" className="text-[13px] text-ocre">
            Mot de passe oublié ?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={authInput}
        />
      </div>

      <AuthError message={state.error} />

      <AuthSubmit pending={pending}>
        <Lock size={18} aria-hidden="true" />
        {pending ? 'Connexion…' : 'Se connecter'}
      </AuthSubmit>
    </form>
  )
}

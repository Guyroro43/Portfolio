import type { Metadata } from 'next'
import { AuthShell } from '@/components/admin/auth-shell'
import { ResetForm } from './reset-form'

export const metadata: Metadata = { title: 'Mot de passe oublié' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="admin" lead="Entre ton email : tu recevras un lien pour choisir un nouveau mot de passe.">
      <ResetForm />
    </AuthShell>
  )
}

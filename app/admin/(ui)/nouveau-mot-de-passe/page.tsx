import type { Metadata } from 'next'
import { AuthShell } from '@/components/admin/auth-shell'
import { requireAdmin } from '@/lib/admin/auth'
import { PasswordForm } from './password-form'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Nouveau mot de passe' }

// On arrive ici par le lien de l'email, qui vient d'ouvrir une session.
export default async function NewPasswordPage() {
  await requireAdmin()

  return (
    <AuthShell title="admin" lead="Choisis ton nouveau mot de passe.">
      <PasswordForm />
    </AuthShell>
  )
}

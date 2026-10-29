import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/admin/auth-shell'
import { getAdmin } from '@/lib/admin/auth'
import { LoginForm } from './login-form'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Connexion' }

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  if (await getAdmin()) redirect('/admin')
  const { erreur } = await searchParams

  return (
    <AuthShell title="admin" lead="Accès réservé. Connecte-toi pour modifier ton site.">
      <LoginForm
        notice={erreur === 'lien' ? 'Ce lien a expiré ou a déjà servi. Demande un nouvel email depuis « Mot de passe oublié ».' : null}
      />
    </AuthShell>
  )
}

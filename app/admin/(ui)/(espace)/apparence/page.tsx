import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import { ComingSoon } from '@/components/admin/coming-soon'
import { requireAdmin } from '@/lib/admin/auth'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Apparence' }

export default async function AppearancePage() {
  await requireAdmin()

  return (
    <>
      <AdminHeader title="Apparence" />
      <ComingSoon title="Couleurs et polices">
        Ici, tu choisiras les six couleurs et les deux polices du site, avec un contrôle de lisibilité. Cet écran arrive
        à l’étape 8.
      </ComingSoon>
    </>
  )
}

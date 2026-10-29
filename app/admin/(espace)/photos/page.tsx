import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import { ComingSoon } from '@/components/admin/coming-soon'
import { requireAdmin } from '@/lib/admin/auth'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Photos' }

export default async function PhotosPage() {
  await requireAdmin()

  return (
    <>
      <AdminHeader title="Photos" />
      <ComingSoon title="Tes photos">
        Ici, tu enverras tes photos, tu les recadreras et tu écriras leurs légendes en français et en anglais. Cet écran
        arrive à l’étape 9.
      </ComingSoon>
    </>
  )
}

import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import { SiteTextsEditor } from '@/components/admin/site-texts-editor'
import { getSiteContent } from '@/lib/admin/content'
import { partHash } from '@/lib/admin/draft'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/(ui)/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Textes du site' }

export default async function SiteTextsPage() {
  const { draft } = await getSiteContent()
  return (
    <>
      <AdminHeader title="Textes du site" />
      <SiteTextsEditor site={draft.site} hash={partHash(draft.site)} />
    </>
  )
}

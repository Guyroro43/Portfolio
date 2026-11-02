import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import { ThemeEditor } from '@/components/admin/theme-editor'
import { getSiteContent } from '@/lib/admin/content'
import { partHash } from '@/lib/admin/draft'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/(ui)/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Apparence' }

export default async function AppearancePage() {
  const { draft } = await getSiteContent()
  const visible = draft.sections.filter((s) => s.visible)
  // L'aperçu montre les trois fonds : le haut de page (sombre), puis une section claire et une indigo.
  const [first, ...rest] = [
    visible.find((s) => s.type === 'hero') ?? visible[0],
    visible.find((s) => s.tone === 'light'),
    visible.find((s) => s.tone === 'indigo'),
  ].filter((s) => s !== undefined)

  return (
    <>
      <AdminHeader title="Apparence" />
      {first && (
        <ThemeEditor
          content={draft}
          theme={draft.theme}
          hash={partHash(draft.theme)}
          focus={{ sectionId: first.id, also: rest.map((s) => s.id) }}
        />
      )}
    </>
  )
}

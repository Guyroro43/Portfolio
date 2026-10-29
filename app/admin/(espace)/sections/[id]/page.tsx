import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { ComingSoon } from '@/components/admin/coming-soon'
import { getSiteContent } from '@/lib/admin/content'
import { sectionSummary } from '@/lib/admin/summary'
import { t } from '@/lib/i18n'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Section' }

export default async function SectionPage({ params }: PageProps<'/admin/sections/[id]'>) {
  const { id } = await params
  const { draft } = await getSiteContent()
  const section = draft.sections.find((s) => s.id === id)
  if (!section) notFound()

  return (
    <>
      <AdminHeader title={t(section.label, 'fr')} />
      <ComingSoon title={sectionSummary(section)}>
        Ici, tu modifieras les textes de cette section en français et en anglais, avec l’aperçu à côté. Cet écran
        arrive à l’étape 6.
      </ComingSoon>
    </>
  )
}

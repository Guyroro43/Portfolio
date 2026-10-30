import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { SectionEditor } from '@/components/admin/section-editor'
import { getSiteContent } from '@/lib/admin/content'
import { sectionHash } from '@/lib/admin/draft'
import { t } from '@/lib/i18n'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/(ui)/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Section' }

export default async function SectionPage({ params }: PageProps<'/admin/sections/[id]'>) {
  const { id } = await params
  const { draft } = await getSiteContent()
  const section = draft.sections.find((s) => s.id === id)
  if (!section) notFound()

  return (
    <>
      <AdminHeader title={t(section.label, 'fr')} trail={[{ href: '/admin', label: 'Sections' }]} />
      {/* key : en passant d'une section à l'autre, l'éditeur repart de zéro. */}
      <SectionEditor key={section.id} content={draft} section={section} hash={sectionHash(section)} />
    </>
  )
}

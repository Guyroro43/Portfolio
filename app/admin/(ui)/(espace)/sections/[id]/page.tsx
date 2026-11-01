import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { CardsSectionEditor } from '@/components/admin/cards-editor'
import { DeleteSection, SectionEditor } from '@/components/admin/section-editor'
import { getSiteContent } from '@/lib/admin/content'
import { sectionHash } from '@/lib/admin/draft'
import { getMediaLibrary } from '@/lib/admin/media'
import type { Section } from '@/lib/content/schema'
import { t } from '@/lib/i18n'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/(ui)/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Section' }

export default async function SectionPage({ params }: PageProps<'/admin/sections/[id]'>) {
  const { id } = await params
  const { draft, published } = await getSiteContent()
  const section = draft.sections.find((s) => s.id === id)
  if (!section) notFound()
  const media = await getMediaLibrary()
  const name = t(section.label, 'fr')

  return (
    <>
      <AdminHeader title={name} trail={[{ href: '/admin', label: 'Sections' }]} />
      {/* key : en passant d'une section à l'autre, l'éditeur repart de zéro. */}
      {section.type === 'cards' ? (
        <CardsSectionEditor
          key={section.id}
          content={draft}
          section={section}
          hash={sectionHash(section)}
          media={media}
          publishedIds={publishedCardIds(published.sections.find((s) => s.id === id))}
          deleteButton={<DeleteSection id={section.id} name={name} />}
        />
      ) : (
        <SectionEditor key={section.id} content={draft} section={section} hash={sectionHash(section)} media={media} />
      )}
    </>
  )
}

/** Cartes déjà en ligne : les autres portent le badge « Brouillon, pas encore en ligne ». */
function publishedCardIds(section: Section | undefined): string[] {
  return section?.type === 'cards' ? section.data.items.map((item) => item.id) : []
}

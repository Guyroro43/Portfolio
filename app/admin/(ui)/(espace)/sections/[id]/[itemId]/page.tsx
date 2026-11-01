import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { CardEditor } from '@/components/admin/cards-editor'
import { getSiteContent } from '@/lib/admin/content'
import { sectionHash } from '@/lib/admin/draft'
import { getMediaLibrary } from '@/lib/admin/media'
import { t } from '@/lib/i18n'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/(ui)/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Carte' }

export default async function CardPage({ params }: PageProps<'/admin/sections/[id]/[itemId]'>) {
  const { id, itemId } = await params
  const { draft } = await getSiteContent()
  const section = draft.sections.find((s) => s.id === id)
  if (section?.type !== 'cards') notFound()
  const card = section.data.items.find((item) => item.id === itemId)
  if (!card) notFound()

  return (
    <>
      <AdminHeader
        title={t(card.title, 'fr') || 'Nouvelle carte'}
        trail={[
          { href: '/admin', label: 'Sections' },
          { href: `/admin/sections/${section.id}`, label: t(section.label, 'fr') },
        ]}
      />
      <CardEditor
        key={`${section.id}/${itemId}`}
        content={draft}
        section={section}
        itemId={itemId}
        hash={sectionHash(section)}
        media={await getMediaLibrary()}
      />
    </>
  )
}

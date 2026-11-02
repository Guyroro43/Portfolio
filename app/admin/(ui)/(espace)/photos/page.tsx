import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import { MediaLibrary } from '@/components/admin/media-library'
import { getSiteContent } from '@/lib/admin/content'
import { getMediaLibrary } from '@/lib/admin/media'
import { mediaUsage } from '@/lib/admin/usage'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/(ui)/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Photos' }

export default async function PhotosPage() {
  const [{ draft }, library] = await Promise.all([getSiteContent(), getMediaLibrary()])
  // Les plus récentes d'abord : une photo qu'on vient d'envoyer apparaît en tête.
  const photos = Object.entries(library)
    .map(([id, entry]) => ({ id, entry }))
    .reverse()

  return (
    <>
      <AdminHeader title="Photos" />
      <MediaLibrary photos={photos} usage={mediaUsage(draft)} />
    </>
  )
}

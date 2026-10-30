import { requireAdmin } from '@/lib/admin/auth'
import { getMediaLibrary } from '@/lib/admin/media'
import { PreviewFrame } from './preview-frame'

export const instant = false

/** Le contenu arrive de la page d'édition, par message, à chaque frappe. Ici, seulement les photos. */
export default async function PreviewPage() {
  await requireAdmin()
  return <PreviewFrame media={await getMediaLibrary()} />
}

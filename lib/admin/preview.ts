import { cache } from 'react'
import { contentSchema, mediaEntrySchema, publishedSchema, type Published } from '@/lib/content/schema'
import { createSessionClient } from '@/lib/supabase/server'
import { isAdminEmail } from './auth'
import { buildPublished } from './published'

/**
 * Le brouillon, prêt à s'afficher comme la version publiée, pour l'aperçu du site en mode brouillon.
 * Lu avec la session de l'admin (les règles RLS le refusent à tout autre compte) ; null sinon,
 * et le site affiche alors la version publiée. Pas de redirection : on est sur une page publique.
 * Une seule lecture par affichage, même si la page, les métadonnées et le thème le demandent.
 */
export const getDraftPreview = cache(async (): Promise<Published | null> => {
  const supabase = await createSessionClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!isAdminEmail(claims?.claims.email)) return null

  const [{ data: draft }, { data: rows }] = await Promise.all([
    supabase.from('site_content').select('content').eq('key', 'draft').maybeSingle(),
    supabase.from('media').select('id, path, width, height, crop, caption, alt'),
  ])
  if (!draft || !rows) return null

  // Une ligne de photo mal formée est ignorée plutôt que de faire planter l'aperçu.
  const library = Object.fromEntries(
    rows.flatMap(({ id, ...row }) => {
      const entry = mediaEntrySchema.safeParse(row)
      return entry.success ? [[id, entry.data]] : []
    }),
  )
  const content = contentSchema.safeParse(draft.content)
  if (!content.success) return null
  const preview = publishedSchema.safeParse(buildPublished(content.data, library))
  return preview.success ? preview.data : null
})

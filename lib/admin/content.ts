import { cache } from 'react'
import { contentSchema, publishedSchema, type Content } from '@/lib/content/schema'
import { requireAdmin } from './auth'

/**
 * Brouillon et version publiée, lus avec la session de l'admin (les règles RLS refusent le
 * brouillon à tout autre compte). Vérifie la session elle-même : on ne peut pas l'appeler sans être admin.
 */
export const getSiteContent = cache(async () => {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase.from('site_content').select('key, content, updated_at')
  if (error) throw new Error(`Lecture du contenu impossible : ${error.message}`)

  const draft = data.find((row) => row.key === 'draft')
  const published = data.find((row) => row.key === 'published')
  if (!draft || !published) throw new Error('Brouillon ou version publiée introuvable : lance « npm run seed »')

  return {
    draft: contentSchema.parse(draft.content),
    // Gardée telle quelle (texte) : la publication la compare à la microseconde près.
    draftUpdatedAt: String(draft.updated_at),
    published: publishedSchema.parse(published.content),
    publishedAt: String(published.updated_at),
  }
})

/** Vrai si le brouillon diffère de la version publiée. Le détail par section arrive avec la publication. */
export function hasUnpublishedChanges(draft: Content, published: Content): boolean {
  const comparable = (content: Content) =>
    JSON.stringify({ site: content.site, theme: content.theme, sections: content.sections })
  return comparable(draft) !== comparable(published)
}

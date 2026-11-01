import { cache } from 'react'
import { contentSchema, publishedSchema } from '@/lib/content/schema'
import { requireAdmin } from './auth'
import { listChanges } from './changes'

/**
 * Brouillon et version publiée, lus avec la session de l'admin (les règles RLS refusent le
 * brouillon à tout autre compte). Vérifie la session elle-même : on ne peut pas l'appeler sans être admin.
 */
export const getSiteContent = cache(async () => {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase.from('site_content').select('key, content, updated_at')
  if (error) throw new Error(`Lecture du contenu impossible : ${error.message}`)

  const draftRow = data.find((row) => row.key === 'draft')
  const publishedRow = data.find((row) => row.key === 'published')
  if (!draftRow || !publishedRow) throw new Error('Brouillon ou version publiée introuvable : lance « npm run seed »')

  const draft = contentSchema.parse(draftRow.content)
  const published = publishedSchema.parse(publishedRow.content)
  return {
    draft,
    published,
    publishedAt: String(publishedRow.updated_at),
    /** « Pas encore publié », section par section. */
    changes: listChanges(draft, published),
  }
})

/** Les 10 dernières versions publiées, de la plus récente à la plus ancienne (sans leur contenu). */
export const getVersions = cache(async () => {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase.from('site_versions').select('id, published_at').order('published_at', { ascending: false })
  if (error) throw new Error(`Lecture des versions impossible : ${error.message}`)
  return data.map((row) => ({ id: Number(row.id), publishedAt: String(row.published_at) }))
})

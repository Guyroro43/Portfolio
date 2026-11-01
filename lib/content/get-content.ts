import { cacheLife, cacheTag } from 'next/cache'
import { draftMode } from 'next/headers'
import { getDraftPreview } from '@/lib/admin/preview'
import { createPublicClient } from '@/lib/supabase/public'
import { publishedSchema, type Published } from './schema'

/**
 * Contenu du site. Pour les visiteurs : la version publiée, gardée en cache jusqu'à la prochaine
 * publication. En mode brouillon (bouton Aperçu de l'admin) : le brouillon, lu à chaque requête.
 * Pendant la génération des pages, le mode brouillon est toujours désactivé.
 */
export async function getContent(): Promise<Published> {
  const { isEnabled } = await draftMode()
  if (isEnabled) {
    const preview = await getDraftPreview()
    if (preview) return preview
  }
  return getPublished()
}

/**
 * Version publiée, lue dans Supabase une fois au moment de générer les pages, puis gardée en cache
 * jusqu'à la prochaine publication (updateTag('site-content')).
 * Si Supabase ne répond pas lors d'un rafraîchissement, l'ancienne page reste servie.
 */
async function getPublished(): Promise<Published> {
  'use cache'
  cacheTag('site-content')
  cacheLife('max')

  const { data, error } = await createPublicClient()
    .from('site_content')
    .select('content')
    .eq('key', 'published')
    .single()
  if (error) throw new Error(`Lecture de la version publiée impossible : ${error.message}`)
  return publishedSchema.parse(data.content)
}

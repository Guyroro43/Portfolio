import { cacheLife, cacheTag } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { publishedSchema, type Published } from './schema'

/**
 * Contenu publié du site, lu dans Supabase une fois au moment de générer les pages, puis gardé
 * en cache jusqu'à la prochaine publication (updateTag('site-content')).
 * Si Supabase ne répond pas lors d'un rafraîchissement, l'ancienne page reste servie.
 */
export async function getContent(): Promise<Published> {
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

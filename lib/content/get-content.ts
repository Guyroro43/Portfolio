import { cacheLife, cacheTag } from 'next/cache'
import media from '@/content/media.json'
import seed from '@/content/seed.json'
import { publishedSchema, type Published } from './schema'

/**
 * Contenu publié du site. Lu une fois au moment de générer les pages, puis gardé en cache
 * jusqu'à la prochaine publication (updateTag('site-content')).
 * Étapes 2 et 3 : lu depuis content/. À l'étape 4, lu depuis Supabase.
 */
export async function getContent(): Promise<Published> {
  'use cache'
  cacheTag('site-content')
  cacheLife('max')
  return publishedSchema.parse({ ...seed, media })
}

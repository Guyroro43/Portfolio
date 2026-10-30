import { cache } from 'react'
import { mediaEntrySchema, type Published } from '@/lib/content/schema'
import { requireAdmin } from './auth'

/** Toutes les photos de la table media (lisible par l'admin seulement), par identifiant. */
export const getMediaLibrary = cache(async (): Promise<Published['media']> => {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('media')
    .select('id, path, width, height, crop, caption, alt')
    .order('created_at')
  if (error) throw new Error(`Lecture des photos impossible : ${error.message}`)
  return Object.fromEntries(data.map(({ id, ...entry }) => [id, mediaEntrySchema.parse(entry)]))
})

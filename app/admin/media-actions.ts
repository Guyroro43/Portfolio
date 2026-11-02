'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/auth'
import { mutateDraft, type DraftResult } from '@/lib/admin/draft'
import { firstIssue } from '@/lib/admin/errors'
import { fileExists, removeOrphanFiles } from '@/lib/admin/media-files'
import { sectionId } from '@/lib/admin/new-section'
import { withoutMedia } from '@/lib/admin/usage'
import { mediaEntrySchema } from '@/lib/content/schema'

const id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/)
const file = z.object({
  path: mediaEntrySchema.shape.path,
  width: z.number().int().positive().max(4000),
  height: z.number().int().positive().max(4000),
})
const details = mediaEntrySchema.pick({ caption: true, alt: true, crop: true })

/**
 * Nouvelle photo : le navigateur l'a compressée puis envoyée dans le bucket. On crée sa ligne,
 * avec un identifiant tiré du nom du fichier. Légende et description restent à écrire.
 */
export async function addMedia(input: unknown): Promise<DraftResult<{ id: string }>> {
  const { supabase } = await requireAdmin()
  const parsed = file.extend({ name: z.string().max(200) }).safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const { name, ...entry } = parsed.data
  if (!(await fileExists(supabase, entry.path))) return { ok: false, error: 'Le fichier n’est pas arrivé. Réessaie l’envoi.' }

  const { data: rows, error: readError } = await supabase.from('media').select('id')
  if (readError) return { ok: false, error: 'Lecture des photos impossible.' }
  const mediaId = sectionId(name.replace(/\.[a-z0-9]+$/i, ''), new Set(rows.map((row) => row.id)))

  const empty = { fr: '', en: '' }
  const { error } = await supabase.from('media').insert({ id: mediaId, ...entry, crop: null, caption: empty, alt: empty })
  if (error) return { ok: false, error: 'Enregistrement de la photo impossible.' }
  refresh()
  return { ok: true, id: mediaId }
}

/** Légende, description et cadrage. Ils passent en ligne à la prochaine publication. */
export async function updateMedia(mediaId: unknown, input: unknown): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const parsedId = id.safeParse(mediaId)
  const parsed = details.safeParse(input)
  if (!parsedId.success || !parsed.success) return { ok: false, error: parsed.success ? 'Photo inconnue.' : firstIssue(parsed.error) }

  const { data, error } = await supabase.from('media').update(parsed.data).eq('id', parsedId.data).select('id')
  if (error || data.length !== 1) return { ok: false, error: 'Enregistrement impossible. Réessaie dans un instant.' }
  return { ok: true }
}

/** Remplacer le fichier : la photo garde son identifiant, donc tous ses emplacements. Le cadrage repart de zéro. */
export async function replaceMediaFile(mediaId: unknown, input: unknown): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const parsedId = id.safeParse(mediaId)
  const parsed = file.safeParse(input)
  if (!parsedId.success || !parsed.success) return { ok: false, error: 'Fichier invalide.' }
  if (!(await fileExists(supabase, parsed.data.path))) return { ok: false, error: 'Le fichier n’est pas arrivé. Réessaie l’envoi.' }

  const { data, error } = await supabase
    .from('media')
    .update({ ...parsed.data, crop: null })
    .eq('id', parsedId.data)
    .select('id')
  if (error || data.length !== 1) return { ok: false, error: 'Remplacement impossible.' }
  refresh()
  return { ok: true }
}

/**
 * Supprimer une photo : elle est d'abord retirée de tous ses emplacements dans le brouillon,
 * puis sa ligne disparaît. Le fichier reste tant que la version en ligne s'en sert : il est
 * effacé à la publication suivante (lib/admin/media-files.ts).
 */
export async function deleteMedia(mediaId: unknown): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const parsedId = id.safeParse(mediaId)
  if (!parsedId.success) return { ok: false, error: 'Photo inconnue.' }

  const cleared = await mutateDraft(supabase, (draft) => ({ content: withoutMedia(draft, parsedId.data), result: {} }))
  if (!cleared.ok) return cleared

  const { error } = await supabase.from('media').delete().eq('id', parsedId.data)
  if (error) return { ok: false, error: 'Suppression impossible. Réessaie dans un instant.' }
  await removeOrphanFiles(supabase)
  refresh()
  return { ok: true }
}

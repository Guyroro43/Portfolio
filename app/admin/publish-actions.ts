'use server'

import { refresh, updateTag } from 'next/cache'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/auth'
import { revertChange as revert } from '@/lib/admin/changes'
import { mutateDraft, type DraftResult } from '@/lib/admin/draft'
import { getMediaLibrary } from '@/lib/admin/media'
import { buildPublished } from '@/lib/admin/published'
import { contentSchema, publishedSchema } from '@/lib/content/schema'

/** Bouton Aperçu : le site s'ouvre en mode brouillon (cookie de Next.js), pour ce navigateur seulement. */
export async function enterPreview() {
  await requireAdmin()
  ;(await draftMode()).enable()
  redirect('/')
}

/** Bouton Quitter du bandeau d'aperçu. Sans danger pour quiconque : il ne fait que couper l'aperçu. */
export async function exitPreview() {
  ;(await draftMode()).disable()
  redirect('/admin')
}

/**
 * Publier : le brouillon, avec la copie des photos qu'il utilise, devient la version en ligne.
 * publish_site() fait tout dans une transaction (version publiée, historique, 10 versions gardées)
 * et refuse si le brouillon a changé depuis sa lecture : on relit alors une fois.
 */
export async function publishSite(): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const library = await getMediaLibrary()

  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: row, error: readError } = await supabase
      .from('site_content')
      .select('content, updated_at')
      .eq('key', 'draft')
      .single()
    if (readError) return { ok: false, error: 'Lecture du brouillon impossible. Réessaie dans un instant.' }

    const draft = contentSchema.safeParse(row.content)
    if (!draft.success) return { ok: false, error: 'Le brouillon contient une erreur : ouvre la section concernée pour la corriger.' }
    const published = publishedSchema.safeParse(buildPublished(draft.data, library))
    if (!published.success) {
      const missing = published.error.issues.find((issue) => issue.message.startsWith('Photo introuvable'))
      return { ok: false, error: missing ? `${missing.message} : choisis une autre photo avant de publier.` : 'Le brouillon contient une erreur.' }
    }

    // La date est renvoyée telle que lue (texte) : la fonction la compare à la microseconde près.
    const { error } = await supabase.rpc('publish_site', { p_content: published.data, p_draft_updated_at: row.updated_at })
    if (!error) {
      // Les pages publiques se régénèrent à la prochaine visite ; l'admin se met à jour tout de suite.
      updateTag('site-content')
      refresh()
      return { ok: true }
    }
    if (error.hint !== 'draft_changed') return { ok: false, error: 'Publication impossible. Réessaie dans un instant.' }
  }
  return { ok: false, error: 'Le brouillon change en ce moment. Réessaie dans un instant.' }
}

const target = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('section'), id: z.string() }),
  z.object({ kind: z.literal('order') }),
  z.object({ kind: z.literal('theme') }),
  z.object({ kind: z.literal('site') }),
])

/** « Annuler » dans « Pas encore publié » : remet ce changement comme dans la version en ligne. */
export async function revertChange(input: unknown): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const parsed = target.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Valeur invalide.' }

  const { data, error } = await supabase.from('site_content').select('content').eq('key', 'published').single()
  if (error) return { ok: false, error: 'Lecture de la version en ligne impossible.' }
  const published = contentSchema.parse(data.content)

  const result = await mutateDraft(supabase, (draft) => ({ content: revert(draft, published, parsed.data), result: {} }))
  if (result.ok) refresh()
  return result
}

/** Remet une version publiée dans le brouillon. Elle ne passe en ligne qu'à la prochaine publication. */
export async function restoreVersion(id: unknown): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const parsed = z.number().int().positive().safeParse(id)
  if (!parsed.success) return { ok: false, error: 'Valeur invalide.' }

  const { data, error } = await supabase.from('site_versions').select('content').eq('id', parsed.data).maybeSingle()
  if (error || !data) return { ok: false, error: 'Cette version n’existe plus.' }
  const version = contentSchema.safeParse(data.content)
  if (!version.success) return { ok: false, error: 'Cette version ne peut pas être relue.' }

  const content = version.data
  const result = await mutateDraft(supabase, () => ({ content, result: {} }))
  if (result.ok) refresh()
  return result
}

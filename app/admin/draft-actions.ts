'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { DraftError, mutateDraft, sectionHash, type DraftResult } from '@/lib/admin/draft'
import { firstIssue } from '@/lib/admin/errors'
import { sectionSchema } from '@/lib/content/schema'

/**
 * Enregistre une section dans le brouillon. baseHash est l'empreinte de la section quand la page
 * l'a ouverte (ou au dernier enregistrement) : si elle a changé ailleurs depuis, rien n'est écrasé.
 */
export async function saveSection(input: unknown, baseHash: string): Promise<DraftResult<{ hash: string }>> {
  const { supabase } = await requireAdmin()
  const parsed = sectionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const next = parsed.data

  return mutateDraft(supabase, (draft) => {
    const index = draft.sections.findIndex((section) => section.id === next.id)
    if (index < 0) throw new DraftError('missing', 'Cette section n’existe plus dans le brouillon.')
    const current = draft.sections[index]
    if (current.type !== next.type) throw new DraftError('invalid', 'La forme d’une section ne change pas.')
    const currentHash = sectionHash(current)
    if (currentHash !== baseHash && currentHash !== sectionHash(next)) {
      throw new DraftError('conflict', 'Cette section a été modifiée ailleurs, dans un autre onglet par exemple.')
    }
    return { content: { ...draft, sections: draft.sections.with(index, next) }, result: { hash: sectionHash(next) } }
  })
}

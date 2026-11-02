import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { contentSchema, type Content, type Section } from '@/lib/content/schema'
import { firstIssue } from './errors'

/**
 * Empreinte d'une partie du brouillon (une section, le thème, les textes du site) : sert à savoir
 * si quelqu'un l'a modifiée depuis qu'on l'a ouverte.
 */
export function partHash(part: unknown): string {
  return createHash('sha256').update(JSON.stringify(part)).digest('hex').slice(0, 16)
}

export const sectionHash = (section: Section) => partHash(section)

/** Erreur prévue, renvoyée telle quelle à l'admin. */
export class DraftError extends Error {
  constructor(
    readonly kind: 'conflict' | 'missing' | 'invalid',
    message: string,
  ) {
    super(message)
  }
}

export type DraftResult<T> = ({ ok: true } & T) | { ok: false; conflict?: boolean; error: string }

/**
 * Lit le brouillon, applique la modification, valide le document entier, puis l'écrit seulement
 * s'il n'a pas changé entre-temps (date d'enregistrement). Sinon, recommence avec la version à jour.
 * Deux enregistrements simultanés sur des sections différentes passent donc tous les deux.
 */
export async function mutateDraft<T extends object>(
  supabase: SupabaseClient,
  change: (draft: Content) => { content: Content; result: T },
): Promise<DraftResult<T>> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: row, error: readError } = await supabase
      .from('site_content')
      .select('content, updated_at')
      .eq('key', 'draft')
      .single()
    if (readError) return { ok: false, error: 'Lecture du brouillon impossible. Réessaie dans un instant.' }

    let next: { content: Content; result: T }
    try {
      next = change(contentSchema.parse(row.content))
    } catch (error) {
      if (error instanceof DraftError) return { ok: false, conflict: error.kind === 'conflict', error: error.message }
      throw error
    }

    const parsed = contentSchema.safeParse(next.content)
    if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }

    const { data: written, error: writeError } = await supabase
      .from('site_content')
      .update({ content: parsed.data })
      .eq('key', 'draft')
      .eq('updated_at', row.updated_at)
      .select('updated_at')
    if (writeError) return { ok: false, error: 'Enregistrement impossible. Réessaie dans un instant.' }
    if (written.length === 1) return { ok: true, ...next.result }
  }
  return { ok: false, error: 'Le brouillon change trop souvent en ce moment. Réessaie dans un instant.' }
}

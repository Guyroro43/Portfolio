'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/auth'
import { DraftError, mutateDraft, partHash, sectionHash, type DraftResult } from '@/lib/admin/draft'
import { firstIssue } from '@/lib/admin/errors'
import { CARD_VARIANTS, NEW_SECTION_KINDS, newSection, sectionId } from '@/lib/admin/new-section'
import { sectionSchema, siteSchema, themeSchema, type Content } from '@/lib/content/schema'
import { t } from '@/lib/i18n'

const CHANGED_ELSEWHERE = 'Les sections ont changé ailleurs, dans un autre onglet par exemple. Recharge la page.'

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

/**
 * Enregistre le thème ou les textes du site, avec la même protection qu'une section :
 * si cette partie a changé ailleurs depuis son ouverture, rien n'est écrasé.
 */
async function savePart<K extends 'theme' | 'site'>(
  key: K,
  schema: z.ZodType<Content[K]>,
  input: unknown,
  baseHash: string,
): Promise<DraftResult<{ hash: string }>> {
  const { supabase } = await requireAdmin()
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const next = parsed.data

  return mutateDraft(supabase, (draft) => {
    const currentHash = partHash(draft[key])
    if (currentHash !== baseHash && currentHash !== partHash(next)) {
      throw new DraftError('conflict', 'Ces réglages ont été modifiés ailleurs, dans un autre onglet par exemple.')
    }
    return { content: { ...draft, [key]: next }, result: { hash: partHash(next) } }
  })
}

export async function saveTheme(input: unknown, baseHash: string) {
  return savePart('theme', themeSchema, input, baseHash)
}

export async function saveSiteTexts(input: unknown, baseHash: string) {
  return savePart('site', siteSchema, input, baseHash)
}

/** Nouvel ordre des sections (glisser-déposer de la vue d'ensemble). */
export async function reorderSections(ids: unknown): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const parsed = z.array(z.string()).max(30).safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'Ordre invalide.' }

  const result = await mutateDraft(supabase, (draft) => {
    const byId = new Map(draft.sections.map((section) => [section.id, section]))
    const order = parsed.data
    if (order.length !== byId.size || new Set(order).size !== order.length || order.some((id) => !byId.has(id))) {
      throw new DraftError('conflict', CHANGED_ELSEWHERE)
    }
    return { content: { ...draft, sections: order.map((id) => byId.get(id)!) }, result: {} }
  })
  if (result.ok) refresh()
  return result
}

/** Interrupteur d'une section dans la vue d'ensemble. */
export async function setSectionVisible(id: unknown, visible: unknown): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const parsed = z.object({ id: z.string(), visible: z.boolean() }).safeParse({ id, visible })
  if (!parsed.success) return { ok: false, error: 'Valeur invalide.' }

  const result = await mutateDraft(supabase, (draft) => {
    if (!draft.sections.some((section) => section.id === parsed.data.id)) throw new DraftError('missing', CHANGED_ELSEWHERE)
    const sections = draft.sections.map((section) =>
      section.id === parsed.data.id ? { ...section, visible: parsed.data.visible } : section,
    )
    return { content: { ...draft, sections }, result: {} }
  })
  if (result.ok) refresh()
  return result
}

const newSectionInput = z.object({
  kind: z.enum(NEW_SECTION_KINDS),
  label: z.string().trim().min(1, 'Donne un nom à la section.').max(60, '60 caractères au plus.'),
  variant: z.enum(CARD_VARIANTS),
})

/** Ajoute une section vide et masquée, en fin de page. Renvoie son identifiant pour ouvrir sa page. */
export async function addSection(input: unknown): Promise<DraftResult<{ id: string }>> {
  const { supabase } = await requireAdmin()
  const parsed = newSectionInput.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Valeur invalide.' }
  const { kind, label, variant } = parsed.data

  return mutateDraft(supabase, (draft) => {
    const id = sectionId(label, new Set(draft.sections.map((section) => section.id)))
    const section = newSection(kind, label, variant, id)
    return { content: { ...draft, sections: [...draft.sections, section] }, result: { id } }
  })
}

/** Supprime une section du brouillon. Le haut de page et la bande de noms se masquent, ils ne se suppriment pas. */
export async function deleteSection(id: unknown): Promise<DraftResult<object>> {
  const { supabase } = await requireAdmin()
  const parsed = z.string().safeParse(id)
  if (!parsed.success) return { ok: false, error: 'Valeur invalide.' }

  // Pas de refresh() ici : on supprime depuis la page de la section, que la page appelante quitte aussitôt.
  return mutateDraft(supabase, (draft) => {
    const section = draft.sections.find((s) => s.id === parsed.data)
    if (!section) throw new DraftError('missing', 'Cette section n’existe plus dans le brouillon.')
    if (section.type === 'hero' || section.type === 'marquee') {
      throw new DraftError('invalid', 'Le haut de page et la bande de noms se masquent, mais ne se suppriment pas.')
    }
    const hero = draft.sections.find((s) => s.type === 'hero')
    const button = hero?.type === 'hero' ? hero.data.buttons.find((b) => b.target === section.id) : undefined
    if (button) {
      throw new DraftError(
        'invalid',
        `Le bouton « ${t(button.label, 'fr')} » du haut de page mène à cette section : change sa destination d’abord.`,
      )
    }
    return { content: { ...draft, sections: draft.sections.filter((s) => s !== section) }, result: {} }
  })
}

import type { Section } from '@/lib/content/schema'

/** Les cinq formes qu'on peut ajouter. Le haut de page et la bande de noms sont uniques. */
export const NEW_SECTION_KINDS = ['text', 'cards', 'timeline', 'gallery', 'links'] as const
export type NewSectionKind = (typeof NEW_SECTION_KINDS)[number]
export const CARD_VARIANTS = ['projects', 'tags', 'pictures'] as const
export type CardVariant = (typeof CARD_VARIANTS)[number]

const RESERVED = new Set(['top', 'contenu'])

/** Identifiant tiré du nom (« Mes lectures » → « mes-lectures »), unique dans la page : c'est l'ancre du menu. */
export function sectionId(label: string, taken: Set<string>): string {
  const base =
    label
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48)
      .replace(/-+$/, '') || 'section'
  // « top » et « contenu » sont déjà des ancres de la page publique (haut de page, lien d'évitement).
  const used = (candidate: string) => taken.has(candidate) || RESERVED.has(candidate)
  let id = base
  for (let n = 2; used(id); n++) id = `${base}-${n}`
  return id
}

/**
 * Nouvelle section, vide et masquée : elle n'apparaît sur le site qu'une fois remplie et affichée.
 * Le nom sert aussi de titre de départ.
 */
export function newSection(kind: NewSectionKind, label: string, variant: CardVariant, id: string): Section {
  const text = { fr: label, en: '' }
  const base = { id, visible: false, inMenu: true, label: text, title: text, intro: { fr: '', en: '' }, symbol: null, tone: 'light' as const }
  switch (kind) {
    case 'text':
      return { ...base, type: 'text', data: { paragraphs: [], side: null } }
    case 'cards':
      return { ...base, type: 'cards', data: { variant, items: [] } }
    case 'timeline':
      return { ...base, type: 'timeline', data: { steps: [], note: null } }
    case 'gallery':
      return { ...base, type: 'gallery', data: { items: [] } }
    case 'links':
      return { ...base, type: 'links', data: { items: [] } }
  }
}

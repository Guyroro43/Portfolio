import type { Content } from '@/lib/content/schema'
import { t } from '@/lib/i18n'

export type MediaUse = { section: string; label: string }

/**
 * « Utilisée dans » : où chaque photo apparaît dans le brouillon.
 * section sert aux onglets de l'écran Photos, label à la liste lisible.
 */
export function mediaUsage(content: Content): Record<string, MediaUse[]> {
  const uses: Record<string, MediaUse[]> = {}
  const add = (id: string | null | undefined, section: string, label: string) => {
    if (id) (uses[id] ??= []).push({ section, label })
  }
  for (const s of content.sections) {
    const name = t(s.label, 'fr')
    switch (s.type) {
      case 'hero':
        add(s.data.photo, name, name)
        break
      case 'text':
        if (s.data.side?.kind === 'photo') add(s.data.side.photo, name, name)
        break
      case 'cards':
        for (const item of s.data.items) add(item.image, name, `${name} : ${t(item.title, 'fr') || 'une carte'}`)
        break
      case 'gallery':
        s.data.items.forEach((item, index) => add(item.photo, name, `${name}, position ${index + 1}`))
        break
    }
  }
  return uses
}

/** Le brouillon sans cette photo : elle est retirée de tous les emplacements où elle servait. */
export function withoutMedia(content: Content, id: string): Content {
  return {
    ...content,
    sections: content.sections.map((s) => {
      switch (s.type) {
        case 'hero':
          return s.data.photo === id ? { ...s, data: { ...s.data, photo: null } } : s
        case 'text':
          return s.data.side?.kind === 'photo' && s.data.side.photo === id ? { ...s, data: { ...s.data, side: null } } : s
        case 'cards':
          return { ...s, data: { ...s.data, items: s.data.items.map((item) => (item.image === id ? { ...item, image: null } : item)) } }
        case 'gallery':
          return { ...s, data: { ...s.data, items: s.data.items.filter((item) => item.photo !== id) } }
        default:
          return s
      }
    }),
  }
}

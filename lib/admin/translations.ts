import type { Content, Published } from '@/lib/content/schema'
import { t, type I18n } from '@/lib/i18n'

/** Un endroit de l'admin où des textes attendent leur version anglaise. */
export type ToTranslate = { key: string; where: string; href: string; count: number }

const isI18n = (value: unknown): value is I18n =>
  typeof value === 'object' && value !== null && typeof (value as I18n).fr === 'string' && typeof (value as I18n).en === 'string'

/** Nombre de textes écrits en français dont la case anglaise est vide (le site anglais affiche alors le français). */
function countMissing(value: unknown): number {
  if (isI18n(value)) return value.fr.trim() !== '' && value.en.trim() === '' ? 1 : 0
  if (Array.isArray(value)) return value.reduce((total: number, item) => total + countMissing(item), 0)
  if (typeof value === 'object' && value !== null) return Object.values(value).reduce((total: number, item) => total + countMissing(item), 0)
  return 0
}

/**
 * Tout ce qui reste à traduire, par écran de l'admin : textes du site, chaque section,
 * chaque carte (elle a sa page), chaque photo (légende et description).
 */
export function listToTranslate(content: Content, library: Published['media']): ToTranslate[] {
  const list: ToTranslate[] = []
  const add = (key: string, where: string, href: string, count: number) => {
    if (count > 0) list.push({ key, where, href, count })
  }

  add('site', 'Textes du site', '/admin/textes', countMissing(content.site))
  for (const section of content.sections) {
    const name = t(section.label, 'fr')
    const href = `/admin/sections/${section.id}`
    if (section.type === 'cards') {
      add(section.id, name, href, countMissing({ ...section, data: { ...section.data, items: [] } }))
      for (const item of section.data.items) {
        add(`${section.id}/${item.id}`, `${name} : ${t(item.title, 'fr') || 'une carte'}`, `${href}/${item.id}`, countMissing(item))
      }
    } else {
      add(section.id, name, href, countMissing(section))
    }
  }
  for (const [id, entry] of Object.entries(library)) {
    add(`media:${id}`, `Photo : ${entry.caption.fr || id}`, '/admin/photos', countMissing({ caption: entry.caption, alt: entry.alt }))
  }
  return list
}

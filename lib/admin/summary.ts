import type { Section } from '@/lib/content/schema'
import { sectionNumbers } from '@/lib/content/view'
import { t } from '@/lib/i18n'

const count = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/** Résumé d'une section pour les listes de l'admin : « 6 projets », « 5 étapes »… */
export function sectionSummary(section: Section): string {
  switch (section.type) {
    case 'hero':
      return [section.data.photo ? 'Photo' : null, 'nom', count(section.data.stats.length, 'chiffre', 'chiffres')]
        .filter(Boolean)
        .join(', ')
    case 'marquee':
      return count(section.data.items.length, 'nom qui défile', 'noms qui défilent')
    case 'text': {
      const paragraphs = count(section.data.paragraphs.length, 'paragraphe', 'paragraphes')
      const side = section.data.side
      if (side?.kind === 'card') return `${paragraphs}, ${count(side.rows.length, 'ligne', 'lignes')} « ${t(side.title, 'fr')} »`
      if (side?.kind === 'photo') return `${paragraphs}, une photo`
      return paragraphs
    }
    case 'cards': {
      const items = section.data.items
      if (section.data.variant === 'projects') return count(items.length, 'projet', 'projets')
      if (section.data.variant === 'tags') {
        const tags = items.reduce((total, item) => total + item.tags.length, 0)
        return `${count(items.length, 'groupe', 'groupes')}, ${count(tags, 'étiquette', 'étiquettes')}`
      }
      return count(items.length, 'carte', 'cartes')
    }
    case 'timeline':
      return count(section.data.steps.length, 'étape', 'étapes')
    case 'gallery':
      return count(section.data.items.length, 'photo', 'photos')
    case 'links':
      return count(section.data.items.length, 'lien', 'liens')
  }
}

export type SectionNavItem = { id: string; num: string; name: string; visible: boolean }

/**
 * Sections dans l'ordre de la page, numérotées comme sur le site : le haut de page porte 00,
 * une section masquée n'a pas de numéro.
 */
export function sectionNavItems(sections: Section[]): SectionNavItem[] {
  const numbers = sectionNumbers(sections.filter((section) => section.visible))
  return sections.map((section) => ({
    id: section.id,
    num: section.type === 'hero' ? '00' : (numbers.get(section.id) ?? ''),
    name: t(section.label, 'fr'),
    visible: section.visible,
  }))
}

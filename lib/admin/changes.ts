import type { Content, Published, Section } from '@/lib/content/schema'
import { t } from '@/lib/i18n'

/** Ce qu'« Annuler » remet comme dans la version en ligne. */
export type ChangeTarget =
  | { kind: 'section'; id: string }
  | { kind: 'order' }
  | { kind: 'theme' }
  | { kind: 'site' }
  | { kind: 'media'; id: string }

export type Change = { key: string; where: string; what: string; target: ChangeTarget }

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

function settings({ data: _data, visible: _visible, ...rest }: Section) {
  return rest
}

/** « Postula ajouté », « Réglages modifiés », « Masquée »… */
function describe(before: Section, after: Section): string {
  const parts: string[] = []
  if (before.visible !== after.visible) parts.push(after.visible ? 'Affichée' : 'Masquée')
  if (!same(settings(before), settings(after))) parts.push('Réglages modifiés')
  if (!same(before.data, after.data)) {
    if (before.type === 'cards' && after.type === 'cards') {
      const beforeIds = new Set(before.data.items.map((item) => item.id))
      const afterIds = new Set(after.data.items.map((item) => item.id))
      const added = after.data.items.filter((item) => !beforeIds.has(item.id))
      const removed = before.data.items.filter((item) => !afterIds.has(item.id))
      for (const item of added) parts.push(`${t(item.title, 'fr') || 'Nouvelle carte'} ajoutée`)
      for (const item of removed) parts.push(`${t(item.title, 'fr') || 'Une carte'} supprimée`)
      const kept = after.data.items.filter((item) => beforeIds.has(item.id))
      const keptBefore = before.data.items.filter((item) => afterIds.has(item.id))
      if (!same(kept, keptBefore)) parts.push('Cartes modifiées')
    } else {
      parts.push('Contenu modifié')
    }
  }
  return parts.join(', ')
}

/**
 * « Pas encore publié » : la différence entre le brouillon et la version en ligne, section par
 * section, plus l'ordre des sections, l'apparence et les textes du site.
 */
export function listChanges(draft: Content, published: Published, library: Published['media']): Change[] {
  const changes: Change[] = []
  const online = new Map(published.sections.map((section) => [section.id, section]))
  const inDraft = new Map(draft.sections.map((section) => [section.id, section]))

  for (const section of draft.sections) {
    const before = online.get(section.id)
    const where = t(section.label, 'fr')
    const target = { kind: 'section', id: section.id } as const
    if (!before) changes.push({ key: `section:${section.id}`, where, what: 'Nouvelle section', target })
    else if (!same(before, section)) changes.push({ key: `section:${section.id}`, where, what: describe(before, section), target })
  }
  for (const section of published.sections) {
    if (!inDraft.has(section.id)) {
      changes.push({ key: `section:${section.id}`, where: t(section.label, 'fr'), what: 'Section supprimée', target: { kind: 'section', id: section.id } })
    }
  }

  const draftOrder = draft.sections.filter((s) => online.has(s.id)).map((s) => s.id)
  const onlineOrder = published.sections.filter((s) => inDraft.has(s.id)).map((s) => s.id)
  if (!same(draftOrder, onlineOrder)) {
    changes.push({ key: 'order', where: 'Vue d’ensemble', what: 'Ordre des sections', target: { kind: 'order' } })
  }
  if (!same(draft.theme, published.theme)) {
    changes.push({ key: 'theme', where: 'Apparence', what: 'Couleurs ou polices', target: { kind: 'theme' } })
  }
  if (!same(draft.site, published.site)) {
    changes.push({ key: 'site', where: 'Textes du site', what: 'Titre, description, bouton ou pied de page', target: { kind: 'site' } })
  }
  // Photos en ligne dont la légende, la description, le cadrage ou le fichier a changé depuis.
  for (const [id, online] of Object.entries(published.media)) {
    const current = library[id]
    if (current && same(current, online)) continue
    const name = online.caption.fr || id
    changes.push({
      key: `media:${id}`,
      where: 'Photos',
      what: current ? `${name} : légende, description, cadrage ou fichier` : `${name} supprimée`,
      target: { kind: 'media', id },
    })
  }
  return changes
}

/** Le brouillon, avec un changement remis comme dans la version en ligne. */
export function revertChange(draft: Content, published: Content, target: ChangeTarget): Content {
  switch (target.kind) {
    case 'theme':
      return { ...draft, theme: published.theme }
    case 'site':
      return { ...draft, site: published.site }
    case 'order': {
      // Les sections déjà en ligne reprennent leur ordre, dans les places qu'elles occupent ;
      // les nouvelles ne bougent pas.
      const online = published.sections.filter((s) => draft.sections.some((d) => d.id === s.id))
      let next = 0
      return { ...draft, sections: draft.sections.map((s) => (online.some((o) => o.id === s.id) ? online[next++] : s)) }
    }
    case 'media':
      // Une photo vit dans la table media, pas dans le brouillon : voir revertChange (publish-actions).
      return draft
    case 'section': {
      const before = published.sections.find((s) => s.id === target.id)
      const index = draft.sections.findIndex((s) => s.id === target.id)
      if (before && index >= 0) return { ...draft, sections: draft.sections.with(index, before) }
      if (index >= 0) return { ...draft, sections: draft.sections.filter((s) => s.id !== target.id) }
      if (before) {
        const at = Math.min(published.sections.indexOf(before), draft.sections.length)
        return { ...draft, sections: draft.sections.toSpliced(at, 0, before) }
      }
      return draft
    }
  }
}

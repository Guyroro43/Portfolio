'use client'

import { Pencil } from 'lucide-react'
import { useOptimistic, useState, useTransition } from 'react'
import { reorderSections, setSectionVisible } from '@/app/admin/draft-actions'
import type { DraftResult } from '@/lib/admin/draft'
import { sectionNavItems, sectionSummary } from '@/lib/admin/summary'
import type { Section } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { AddSectionButton } from './add-section-dialog'
import { Panel, Switch } from './fields'
import { GuardedLink } from './save-guard'
import { DragHandle, SortableList } from './sortable-list'

type Change = { type: 'reorder'; ids: string[] } | { type: 'visible'; id: string; visible: boolean }

function applyChange(sections: Section[], change: Change): Section[] {
  if (change.type === 'reorder') {
    const byId = new Map(sections.map((section) => [section.id, section]))
    return change.ids.flatMap((id) => byId.get(id) ?? [])
  }
  return sections.map((section) => (section.id === change.id ? { ...section, visible: change.visible } : section))
}

/**
 * Vue d'ensemble : les sections dans l'ordre de la page. Chaque changement s'affiche tout de suite,
 * puis s'enregistre ; en cas d'échec, la liste revient à l'état du brouillon et le message l'explique.
 */
export function SectionsBoard({ sections: saved, missing = {} }: { sections: Section[]; missing?: Record<string, number> }) {
  const [sections, apply] = useOptimistic(saved, applyChange)
  const [, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const items = sectionNavItems(sections)

  const run = (change: Change, call: () => Promise<DraftResult<object>>, done: string) =>
    startTransition(async () => {
      apply(change)
      const result = await call()
      setMessage(result.ok ? { text: done } : { text: result.error, error: true })
    })

  return (
    <Panel
      title="Ton site, section par section"
      description="Glisse une section pour changer sa place sur la page. L’interrupteur la masque ou l’affiche."
      actions={<AddSectionButton />}
    >
      <p role="status" className={cn('-mt-2 min-h-5 text-[13px]', message?.error ? 'font-semibold text-danger' : 'text-ink-muted')}>
        {message?.text}
      </p>

      <SortableList
        items={sections}
        name={(section) => items.find((item) => item.id === section.id)?.name ?? section.id}
        onReorder={(next) => {
          const ids = next.map((section) => section.id)
          run({ type: 'reorder', ids }, () => reorderSections(ids), 'Nouvel ordre enregistré dans le brouillon.')
        }}
        className="-mx-2 flex flex-col"
      >
        {(section, handle, dragging) => {
          const item = items.find((i) => i.id === section.id)!
          return (
            <div
              className={cn(
                'row-hover flex min-h-16 items-center gap-2 rounded-xl border px-1.5 py-2 sm:gap-3.5 sm:px-3',
                dragging ? '-rotate-[0.6deg] border-ocre bg-[#FFFDF8] shadow-[0_18px_36px_-18px_rgb(11_14_46/0.4)]' : 'border-transparent',
              )}
            >
              <DragHandle handle={handle} label={`Déplacer ${item.name}`} />
              <span className="w-7 flex-none text-[13px] font-semibold text-ocre-ink">{item.num}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={cn('truncate text-[15px] font-semibold', !section.visible && 'text-ink-muted')}>{item.name}</span>
                  {missing[section.id] > 0 && (
                    <span className="flex-none rounded-full bg-ocre-tint px-2 py-0.5 text-[11px] font-semibold text-ocre-deep">
                      {missing[section.id]} à traduire
                    </span>
                  )}
                </span>
                <span className="truncate text-[13px] text-ink-muted">
                  {section.visible ? sectionSummary(section) : `Masquée. ${sectionSummary(section)}`}
                </span>
              </div>
              <Switch
                checked={section.visible}
                label={`Afficher ${item.name} sur le site`}
                onChange={(visible) =>
                  run(
                    { type: 'visible', id: section.id, visible },
                    () => setSectionVisible(section.id, visible),
                    visible ? `${item.name} sera affichée après publication.` : `${item.name} sera masquée après publication.`,
                  )
                }
              />
              <GuardedLink
                href={`/admin/sections/${section.id}`}
                className="inline-flex min-h-10 flex-none items-center gap-1.5 rounded-[10px] border border-line-strong px-2.5 text-[13px] font-semibold sm:px-3"
              >
                <Pencil size={15} aria-hidden="true" />
                <span className="hidden sm:inline">Modifier</span>
                <span className="sr-only"> {item.name}</span>
              </GuardedLink>
            </div>
          )
        }}
      </SortableList>
    </Panel>
  )
}

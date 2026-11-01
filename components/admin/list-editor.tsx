'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from './dialog'
import { DragHandle, SortableList } from './sortable-list'

type Props<T extends { id: string }> = {
  items: T[]
  onChange: (items: T[]) => void
  /** Nom d'un élément : titre de sa carte, annonces du glisser-déposer, confirmation de suppression. */
  name: (item: T, index: number) => string
  create: () => T
  addLabel: string
  max: number
  min?: number
  /** Les champs d'un élément. */
  children: (item: T, index: number, change: (next: T) => void) => React.ReactNode
  empty?: string
}

/**
 * Liste d'éléments d'une section : chaque élément dans sa carte, poignée pour le déplacer,
 * suppression confirmée, bouton d'ajout jusqu'au maximum du schéma.
 */
export function ListEditor<T extends { id: string }>({ items, onChange, name, create, addLabel, max, min = 0, children, empty }: Props<T>) {
  const [removing, setRemoving] = useState<number | null>(null)
  const change = (index: number) => (next: T) => onChange(items.with(index, next))

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && empty && <p className="rounded-xl bg-paper px-4 py-3 text-sm text-ink-muted">{empty}</p>}

      <SortableList items={items} onReorder={onChange} name={(item) => name(item, items.indexOf(item))} className="flex flex-col gap-3">
        {(item, handle, dragging) => {
          const index = items.indexOf(item)
          const label = name(item, index)
          return (
            <div
              className={
                dragging
                  ? 'rounded-2xl border border-ocre bg-[#FFFDF8] p-4 shadow-[0_18px_36px_-18px_rgb(11_14_46/0.4)]'
                  : 'rounded-2xl border border-line bg-white p-4'
              }
            >
              <div className="-mt-1 mb-3 flex items-center gap-2">
                <DragHandle handle={handle} label={`Déplacer ${label}`} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{label}</span>
                {items.length > min && (
                  <button
                    type="button"
                    onClick={() => setRemoving(index)}
                    aria-label={`Supprimer ${label}`}
                    className="flex size-10 flex-none items-center justify-center rounded-lg text-ink-muted hover:text-danger"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-4">{children(item, index, change(index))}</div>
            </div>
          )
        }}
      </SortableList>

      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-[10px] border border-dashed border-line-strong px-4 text-sm font-semibold text-indigo"
        >
          <Plus size={17} aria-hidden="true" />
          {addLabel}
        </button>
      ) : (
        <p className="text-xs text-ink-muted">Maximum atteint ({max}).</p>
      )}

      <ConfirmDialog
        open={removing !== null}
        title={removing !== null && items[removing] ? `Supprimer « ${name(items[removing], removing)} » ?` : 'Supprimer ?'}
        confirmLabel="Supprimer"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing !== null) onChange(items.filter((_, i) => i !== removing))
          setRemoving(null)
        }}
      >
        L’élément disparaît du brouillon. Le site en ligne ne change qu’à la prochaine publication.
      </ConfirmDialog>
    </div>
  )
}

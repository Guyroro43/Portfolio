'use client'

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useId } from 'react'

export type HandleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { ref: (element: HTMLElement | null) => void }

const INSTRUCTIONS =
  'Pour déplacer cet élément, appuie sur Espace ou Entrée, puis sur les flèches haut et bas. Appuie de nouveau sur Espace ou Entrée pour le déposer, ou sur Échap pour annuler.'

/**
 * Liste réordonnable par glisser-déposer (poignée à six points), à la souris, au doigt ou au
 * clavier. Les déplacements sont annoncés aux lecteurs d'écran, en français.
 */
export function SortableList<T extends { id: string }>({ items, onReorder, name, children, className }: {
  items: T[]
  onReorder: (items: T[]) => void
  name: (item: T) => string
  children: (item: T, handle: HandleProps, dragging: boolean) => React.ReactNode
  className?: string
}) {
  const id = useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const nameOf = (uid: UniqueIdentifier) => {
    const item = items.find((i) => i.id === uid)
    return item ? name(item) : 'L’élément'
  }
  const place = (uid: UniqueIdentifier) => `position ${items.findIndex((i) => i.id === uid) + 1} sur ${items.length}`
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${nameOf(active.id)} saisi, ${place(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${nameOf(active.id)} : ${place(over.id)}.` : `${nameOf(active.id)} est hors de la liste.`),
    onDragEnd: ({ active, over }) => (over ? `${nameOf(active.id)} déposé, ${place(over.id)}.` : `${nameOf(active.id)} relâché.`),
    onDragCancel: ({ active }) => `Déplacement de ${nameOf(active.id)} annulé.`,
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    onReorder(arrayMove(items, from, to))
  }

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{ announcements, screenReaderInstructions: { draggable: INSTRUCTIONS } }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ol className={className}>
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle, dragging) => children(item, handle, dragging)}
            </SortableRow>
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({ id, children }: { id: string; children: (handle: HandleProps, dragging: boolean) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, position: 'relative', zIndex: isDragging ? 10 : undefined }}
    >
      {children({ ref: setActivatorNodeRef, ...attributes, ...listeners }, isDragging)}
    </li>
  )
}

/** Poignée à six points. */
export function DragHandle({ handle, label }: { handle: HandleProps; label: string }) {
  return (
    <button
      type="button"
      {...handle}
      aria-label={label}
      className="flex h-11 w-8 flex-none cursor-grab touch-none items-center justify-center rounded-lg text-ink-faint active:cursor-grabbing"
    >
      <GripVertical size={18} aria-hidden="true" />
    </button>
  )
}

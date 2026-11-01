'use client'

import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useId, useState } from 'react'
import { Icon } from '@/components/site/icon'
import { ICON_NAMES, type IconName } from '@/lib/content/constants'
import type { Published } from '@/lib/content/schema'
import { cn, mediaSrc } from '@/lib/content/view'
import { Dialog, secondaryButton } from './dialog'
import { inputClass } from './fields'

type Media = Published['media']

function Thumb({ media, id, className }: { media: Media; id: string; className?: string }) {
  const entry = media[id]
  if (!entry) return <span className={cn('flex items-center justify-center bg-paper text-ink-faint', className)}>?</span>
  return (
    <span className={cn('relative block overflow-hidden bg-paper', className)}>
      <Image src={mediaSrc(entry)} alt={entry.alt.fr} fill sizes="160px" className="object-cover" />
    </span>
  )
}

/**
 * Choix d'une photo parmi celles déjà envoyées. L'envoi de nouvelles photos se fait dans
 * l'écran Photos.
 */
export function PhotoField({ label, value, onChange, media, allowNone = true, error }: {
  label: string
  value: string | null
  onChange: (id: string | null) => void
  media: Media
  allowNone?: boolean
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const labelId = useId()
  const ids = Object.keys(media)
  const caption = value && media[value] ? media[value].caption.fr || media[value].alt.fr : null

  return (
    <div className="flex flex-col gap-2" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="text-[13px] font-semibold">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <Thumb media={media} id={value} className="size-20 flex-none rounded-xl" />
        ) : (
          <span className="flex size-20 flex-none items-center justify-center rounded-xl border-2 border-dashed border-line-strong text-ink-faint">
            <ImageIcon size={22} aria-hidden="true" />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm text-ink-muted">{caption ?? (value ? 'Photo introuvable' : 'Aucune photo')}</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen(true)} className={secondaryButton}>
              {value ? 'Changer de photo' : 'Choisir une photo'}
            </button>
            {allowNone && value && (
              <button type="button" onClick={() => onChange(null)} className={cn(secondaryButton, 'text-danger')}>
                Retirer
              </button>
            )}
          </div>
        </div>
      </div>
      {error && <span className="text-xs font-semibold text-danger">{error}</span>}

      <Dialog open={open} onClose={() => setOpen(false)} title={label}>
        <div className="grid max-h-[60vh] grid-cols-3 gap-2.5 overflow-y-auto sm:grid-cols-4">
          {ids.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={id === value}
              onClick={() => {
                onChange(id)
                setOpen(false)
              }}
              className={cn('flex flex-col gap-1 rounded-xl border-2 p-1 text-left', id === value ? 'border-indigo' : 'border-transparent')}
            >
              <Thumb media={media} id={id} className="aspect-square w-full rounded-lg" />
              <span className="line-clamp-2 text-[11px] text-ink-muted">{media[id].caption.fr || media[id].alt.fr}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-muted">Pour ajouter une photo, passe par l’écran Photos.</p>
        <button type="button" onClick={() => setOpen(false)} className={cn(secondaryButton, 'self-end')}>
          Fermer
        </button>
      </Dialog>
    </div>
  )
}

const ICON_LABELS: Record<IconName, string> = {
  'graduation-cap': 'Diplôme',
  users: 'Groupe',
  briefcase: 'Mallette',
  trophy: 'Trophée',
  'shopping-bag': 'Sac',
  'map-pin': 'Lieu',
  'file-text': 'Document',
  'gamepad-2': 'Manette',
  'book-open': 'Livre',
  'trending-up': 'Courbe',
  database: 'Données',
  code: 'Code',
  film: 'Film',
  mail: 'Enveloppe',
  globe: 'Globe',
  rocket: 'Fusée',
  lightbulb: 'Ampoule',
  heart: 'Cœur',
  camera: 'Appareil photo',
  sparkles: 'Étincelles',
  link: 'Lien',
}

/** Choix d'une icône, avec son aperçu à côté de la liste. */
export function IconField({ label, value, onChange, allowNone = false }: {
  label: string
  value: IconName | null
  onChange: (icon: IconName | null) => void
  allowNone?: boolean
}) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      <div className="flex items-center gap-2.5">
        <span className="flex size-11 flex-none items-center justify-center rounded-[10px] bg-ocre-tint text-ocre-ink">
          {value ? <Icon name={value} /> : <span aria-hidden="true">·</span>}
        </span>
        <select
          id={id}
          value={value ?? 'none'}
          onChange={(event) => onChange(event.target.value === 'none' ? null : (event.target.value as IconName))}
          className={cn(inputClass, 'min-h-11')}
        >
          {allowNone && <option value="none">Aucune icône</option>}
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {ICON_LABELS[name]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

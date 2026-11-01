'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import { addSection } from '@/app/admin/draft-actions'
import type { CardVariant, NewSectionKind } from '@/lib/admin/new-section'
import { cn } from '@/lib/content/view'
import { Dialog, primaryButton, secondaryButton } from './dialog'
import { inputClass } from './fields'

// Les cinq formes, avec l'exemple déjà sur le site (design/Dashboard.dc.html).
const KINDS: { value: NewSectionKind; name: string; hint: string }[] = [
  { value: 'text', name: 'Texte et photo', hint: 'Comme À propos' },
  { value: 'cards', name: 'Cartes', hint: 'Comme Projets ou Hors du cadre' },
  { value: 'timeline', name: 'Frise de dates', hint: 'Comme Parcours' },
  { value: 'gallery', name: 'Galerie', hint: 'Une grille de photos' },
  { value: 'links', name: 'Liens', hint: 'Comme Contact' },
]

const VARIANTS: { value: CardVariant; name: string }[] = [
  { value: 'projects', name: 'Projets, avec statut et liens' },
  { value: 'tags', name: 'Étiquettes, comme Compétences' },
  { value: 'pictures', name: 'Images, comme Hors du cadre' },
]

/** Bouton « Ajouter une section » et sa fenêtre : la forme, puis le nom. */
export function AddSectionButton() {
  const router = useRouter()
  const nameId = useId()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<NewSectionKind>('text')
  const [variant, setVariant] = useState<CardVariant>('projects')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const close = () => {
    setOpen(false)
    setError(null)
  }

  const create = (event: React.FormEvent) => {
    event.preventDefault()
    startTransition(async () => {
      const result = await addSection({ kind, label, variant })
      if (!result.ok) {
        setError(result.error)
        return
      }
      // La nouvelle page, puis un rafraîchissement : le menu de gauche montre la nouvelle section.
      router.push(`/admin/sections/${result.id}`)
      router.refresh()
    })
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={primaryButton}>
        <Plus size={17} aria-hidden="true" />
        Ajouter une section
      </button>

      <Dialog open={open} onClose={close} title="Ajouter une section">
        <form onSubmit={create} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-[13px] font-semibold">Choisis une forme</legend>
            {KINDS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5',
                  kind === option.value ? 'border-indigo bg-[#F4F5FD]' : 'border-line',
                )}
              >
                <input
                  type="radio"
                  name="kind"
                  value={option.value}
                  checked={kind === option.value}
                  onChange={() => setKind(option.value)}
                  className="size-4 accent-indigo"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{option.name}</span>
                  <span className="text-xs text-ink-muted">{option.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {kind === 'cards' && (
            <div className="flex flex-col gap-2">
              <label htmlFor={`${nameId}-variant`} className="text-[13px] font-semibold">
                Sorte de cartes
              </label>
              <select
                id={`${nameId}-variant`}
                value={variant}
                onChange={(event) => setVariant(event.target.value as CardVariant)}
                className={cn(inputClass, 'min-h-11')}
              >
                {VARIANTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor={nameId} className="text-[13px] font-semibold">
              Nom de la section
            </label>
            <input
              id={nameId}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              required
              maxLength={60}
              placeholder="Par exemple : Mes lectures"
              aria-describedby={`${nameId}-hint`}
              className={cn(inputClass, 'min-h-11')}
            />
            <span id={`${nameId}-hint`} className="text-xs text-ink-muted">
              La section est créée masquée, en bas de la page. Tu l’affiches quand elle est prête.
            </span>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-danger-tint px-3.5 py-2.5 text-sm font-semibold text-danger">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2.5">
            <button type="button" onClick={close} className={secondaryButton}>
              Annuler
            </button>
            <button type="submit" disabled={pending} className={primaryButton}>
              {pending ? 'Création…' : 'Créer la section'}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  )
}

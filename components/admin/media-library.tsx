'use client'

import { ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useId, useMemo, useRef, useState, useTransition } from 'react'
import { addMedia, deleteMedia, replaceMediaFile, updateMedia } from '@/app/admin/media-actions'
import { ACCEPTED_TYPES, compressImage } from '@/lib/admin/compress'
import { newId } from '@/lib/admin/ids'
import { sectionId } from '@/lib/admin/new-section'
import type { MediaUse } from '@/lib/admin/usage'
import { mediaEntrySchema, type MediaEntry } from '@/lib/content/schema'
import { cn, mediaSrc } from '@/lib/content/view'
import { createAdminBrowserClient } from '@/lib/supabase/browser'
import { CropEditor } from './crop-editor'
import { ConfirmDialog, primaryButton, secondaryButton } from './dialog'
import { I18nFields } from './fields'
import { SaveBar } from './save-bar'
import { useDraftPart } from './use-draft-part'

type Photo = { id: string; entry: MediaEntry }
type Upload = { key: string; name: string; state: string; error?: boolean }

const detailsSchema = mediaEntrySchema.pick({ caption: true, alt: true, crop: true })

/** Compresse puis envoie un fichier dans le bucket. Renvoie son chemin et sa taille. */
async function sendFile(file: File) {
  const { blob, width, height } = await compressImage(file)
  const base = sectionId(file.name.replace(/\.[a-z0-9]+$/i, ''), new Set()).slice(0, 40)
  const path = `${base}-${newId()}.webp`
  const { error } = await createAdminBrowserClient()
    .storage.from('media')
    .upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })
  if (error) throw new Error(`${file.name} : l’envoi a échoué. Réessaie.`)
  return { path, width, height }
}

/** Écran Photos (design/Media.dc.html). */
export function MediaLibrary({ photos, usage }: { photos: Photo[]; usage: Record<string, MediaUse[]> }) {
  const [selected, setSelected] = useState<string | null>(photos[0]?.id ?? null)
  const [filter, setFilter] = useState<string>('all')
  const [uploads, setUploads] = useState<Upload[]>([])
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const sections = useMemo(() => {
    const counts = new Map<string, number>()
    for (const photo of photos) for (const section of new Set((usage[photo.id] ?? []).map((u) => u.section))) counts.set(section, (counts.get(section) ?? 0) + 1)
    return [...counts]
  }, [photos, usage])
  const unused = photos.filter((photo) => !usage[photo.id]?.length).length
  const shown = photos.filter((photo) =>
    filter === 'all' ? true : filter === 'unused' ? !usage[photo.id]?.length : usage[photo.id]?.some((u) => u.section === filter),
  )
  const current = photos.find((photo) => photo.id === selected)

  const setUpload = (key: string, state: string, error?: boolean) =>
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, state, error } : u)))

  // Un fichier après l'autre : le PC reste fluide pendant la compression.
  const upload = async (files: File[]) => {
    const queue = files.map((file) => ({ file, key: newId() }))
    setUploads((list) => [...queue.map(({ file, key }) => ({ key, name: file.name, state: 'En attente' })), ...list].slice(0, 12))
    for (const { file, key } of queue) {
      try {
        setUpload(key, 'Compression et envoi…')
        const sent = await sendFile(file)
        const result = await addMedia({ ...sent, name: file.name })
        if (!result.ok) throw new Error(result.error)
        setUpload(key, 'Ajoutée')
        setSelected(result.id)
      } catch (error) {
        setUpload(key, error instanceof Error ? error.message : 'Envoi impossible.', true)
      }
    }
    router.refresh()
  }

  return (
    <main className="flex flex-wrap items-start gap-6 p-4 sm:p-8">
      <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            upload([...event.dataTransfer.files])
          }}
          className={cn(
            'flex flex-wrap items-center gap-4 rounded-[20px] border-2 border-dashed p-5',
            dragging ? 'border-ocre bg-ocre-tint' : 'border-line-strong bg-row-hover',
          )}
        >
          <ImagePlus size={28} aria-hidden="true" className="text-ink-faint" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-sm font-semibold">Glisse tes photos ici, plusieurs à la fois</p>
            <p className="text-[13px] text-ink-muted">JPG, PNG ou WebP. Redimensionnées et compressées à l’envoi.</p>
          </div>
          <button type="button" onClick={() => input.current?.click()} className={primaryButton}>
            <Upload size={17} aria-hidden="true" />
            Choisir des fichiers
          </button>
          <input
            ref={input}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              upload([...(event.target.files ?? [])])
              event.target.value = ''
            }}
          />
        </div>

        {uploads.length > 0 && (
          <ul aria-live="polite" className="flex flex-col gap-1 rounded-2xl border border-line bg-white px-4 py-3 text-[13px]">
            {uploads.map((u) => (
              <li key={u.key} className={cn('flex justify-between gap-3', u.error && 'font-semibold text-danger')}>
                <span className="min-w-0 truncate">{u.name}</span>
                <span className="flex-none">{u.state}</span>
              </li>
            ))}
          </ul>
        )}

        <div role="group" aria-label="Filtrer les photos" className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: `Toutes (${photos.length})` },
            ...sections.map(([section, count]) => ({ value: section, label: `${section} (${count})` })),
            ...(unused ? [{ value: 'unused', label: `Pas utilisées (${unused})` }] : []),
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={filter === tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'min-h-9 rounded-full border px-3.5 text-[13px] font-semibold',
                filter === tab.value ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
          {shown.map(({ id, entry }) => {
            const uses = usage[id] ?? []
            return (
              <li key={id} className="flex min-w-0 flex-col gap-1.5">
                <button
                  type="button"
                  aria-pressed={id === selected}
                  aria-label={`Choisir la photo ${entry.caption.fr || id}`}
                  onClick={() => setSelected(id)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-xl border-2 bg-paper',
                    id === selected ? 'border-ocre shadow-[0_0_0_4px_rgb(226_163_58/0.25)]' : 'border-transparent',
                  )}
                >
                  <Image src={mediaSrc(entry)} alt="" fill sizes="200px" className="object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-night/80 px-2 py-0.5 text-[11px] font-semibold text-cream">
                    {uses[0] ? `${uses[0].label}${uses.length > 1 ? ` +${uses.length - 1}` : ''}` : 'Pas utilisée'}
                  </span>
                </button>
                <span className="truncate text-[13px] font-semibold">{entry.caption.fr || 'Sans légende'}</span>
                <span className="truncate text-xs text-ink-muted">{entry.path}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="min-w-0 flex-[1_1_360px] lg:sticky lg:top-6">
        {current ? (
          <MediaDetails key={`${current.id}:${current.entry.path}`} photo={current} uses={usage[current.id] ?? []} onDeleted={() => setSelected(null)} />
        ) : (
          <p className="rounded-[20px] border border-line bg-white p-6 text-sm text-ink-muted">Choisis une photo pour modifier sa légende ou son cadrage.</p>
        )}
      </div>
    </main>
  )
}

function MediaDetails({ photo, uses, onDeleted }: { photo: Photo; uses: MediaUse[]; onDeleted: () => void }) {
  const titleId = useId()
  const { id, entry } = photo
  const options = useMemo(
    () => ({
      schema: detailsSchema,
      save: async (value: typeof initial) => {
        const result = await updateMedia(id, value)
        return result.ok ? { ok: true as const, hash: '' } : result
      },
    }),
    [id],
  )
  const initial = { caption: entry.caption, alt: entry.alt, crop: entry.crop }
  const draft = useDraftPart(initial, '', options)
  const details = draft.value
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const replaceInput = useRef<HTMLInputElement>(null)

  const remove = () =>
    startTransition(async () => {
      const result = await deleteMedia(id)
      if (result.ok) {
        setRemoving(false)
        onDeleted()
      } else setError(result.error)
    })

  const replace = (file: File | undefined) =>
    file &&
    startTransition(async () => {
      try {
        const result = await replaceMediaFile(id, await sendFile(file))
        if (!result.ok) setError(result.error)
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : 'Remplacement impossible.')
      }
    })

  // L'aperçu du cadreur passe par l'optimiseur d'images : plus léger que l'original.
  const preview = `/_next/image?url=${encodeURIComponent(mediaSrc(entry))}&w=1080&q=75`

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-[18px] rounded-[20px] border border-line bg-white p-5 sm:p-6">
      <h2 id={titleId} className="font-heading text-xl font-bold">
        {details.caption.fr || 'Sans légende'}
      </h2>

      <CropEditor src={preview} width={entry.width} height={entry.height} crop={details.crop} onChange={(crop) => draft.update((d) => ({ ...d, crop }))} />

      <I18nFields
        errors={draft.errors}
        rows={[
          { key: 'caption', label: 'Légende', value: details.caption, onChange: (caption) => draft.update((d) => ({ ...d, caption })), errorPath: 'caption', maxLength: 200 },
          {
            key: 'alt',
            label: 'Description pour les malvoyants',
            hint: 'Ce que montre la photo, en une phrase.',
            value: details.alt,
            onChange: (alt) => draft.update((d) => ({ ...d, alt })),
            errorPath: 'alt',
            multiline: true,
            rows: 2,
            maxLength: 400,
          },
        ]}
      />

      <p className="text-[13px] text-ink-muted">
        {uses.length ? `Utilisée dans : ${uses.map((u) => u.label).join(' ; ')}.` : 'Utilisée nulle part pour l’instant.'}{' '}
        {entry.width} × {entry.height} px.
      </p>

      {error && (
        <p role="alert" className="rounded-xl bg-danger-tint px-3.5 py-2.5 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <SaveBar
        status={draft.status}
        savedAt={draft.savedAt}
        message={draft.message}
        onSave={draft.save}
        start={
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={() => replaceInput.current?.click()} className={secondaryButton}>
              <RefreshCw size={16} aria-hidden="true" />
              Remplacer
            </button>
            <button type="button" disabled={pending} onClick={() => setRemoving(true)} className={cn(secondaryButton, 'text-danger')}>
              <Trash2 size={16} aria-hidden="true" />
              Supprimer
            </button>
            <input
              ref={replaceInput}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                replace(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </div>
        }
      />

      <ConfirmDialog
        open={removing}
        title={`Supprimer « ${details.caption.fr || id} » ?`}
        confirmLabel="Supprimer la photo"
        busy={pending}
        error={error}
        onConfirm={remove}
        onClose={() => {
          setRemoving(false)
          setError(null)
        }}
      >
        {uses.length ? (
          <>
            <p>Elle sera retirée du brouillon à ces endroits :</p>
            <ul className="mt-2 list-disc pl-5">
              {uses.map((u) => (
                <li key={u.label}>{u.label}</li>
              ))}
            </ul>
            <p className="mt-2">Le site en ligne la garde jusqu’à la prochaine publication.</p>
          </>
        ) : (
          'Elle n’est utilisée nulle part. Le site en ligne n’est pas touché.'
        )}
      </ConfirmDialog>
    </section>
  )
}

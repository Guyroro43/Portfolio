'use client'

import { Eye, Upload } from 'lucide-react'
import { useState, useTransition } from 'react'
import { enterPreview, publishSite } from '@/app/admin/publish-actions'
import { cn } from '@/lib/content/view'
import { useSaveGuard } from './save-guard'

const UNSAVED = 'Une modification n’a pas pu être enregistrée. Continuer avec la dernière version enregistrée ?'

/** Aperçu : on termine d'enregistrer, puis le site s'ouvre en mode brouillon. */
export function PreviewButton() {
  const { flushAll } = useSaveGuard()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if ((await flushAll()) || window.confirm(UNSAVED)) await enterPreview()
        })
      }
      className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] border border-line-strong bg-white px-4 text-sm font-semibold disabled:opacity-60"
    >
      <Eye size={17} aria-hidden="true" />
      {pending ? 'Ouverture…' : 'Aperçu'}
    </button>
  )
}

/** Publier : on termine d'enregistrer, puis le brouillon passe en ligne. */
export function PublishButton({ count, label = 'Publier', className }: { count: number; label?: string; className?: string }) {
  const { flushAll } = useSaveGuard()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  const publish = () =>
    startTransition(async () => {
      setMessage(null)
      if (!(await flushAll()) && !window.confirm(UNSAVED)) return
      const result = await publishSite()
      setMessage(result.ok ? { text: 'Publié. Le site en ligne est à jour.' } : { text: result.error, error: true })
    })

  return (
    <span className="inline-flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={publish}
        disabled={pending || count === 0}
        className={cn(
          'inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[10px] bg-ocre px-[18px] text-sm font-semibold text-night disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <Upload size={17} aria-hidden="true" />
        {pending ? 'Publication…' : label}
      </button>
      <span role="status" className={cn('text-[13px]', message?.error ? 'font-semibold text-danger' : 'text-online-ink')}>
        {message?.text}
      </span>
    </span>
  )
}

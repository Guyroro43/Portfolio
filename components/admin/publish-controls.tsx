'use client'

import { Eye, Upload } from 'lucide-react'
import { useState, useTransition } from 'react'
import { enterPreview, publishSite } from '@/app/admin/publish-actions'
import { cn } from '@/lib/content/view'
import { ConfirmDialog } from './dialog'
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

/**
 * Publier : on termine d'enregistrer, puis le brouillon passe en ligne.
 * Si des couleurs sont peu lisibles, on les liste et on demande confirmation.
 */
export function PublishButton({ count, label = 'Publier', className }: { count: number; label?: string; className?: string }) {
  const { flushAll } = useSaveGuard()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [lowContrast, setLowContrast] = useState<string[] | null>(null)

  const publish = (acceptLowContrast = false) =>
    startTransition(async () => {
      setMessage(null)
      if (!acceptLowContrast && !(await flushAll()) && !window.confirm(UNSAVED)) return
      const result = await publishSite(acceptLowContrast ? { acceptLowContrast: true } : undefined)
      if (!result.ok && 'lowContrast' in result) {
        setLowContrast(result.lowContrast)
        return
      }
      setLowContrast(null)
      setMessage(result.ok ? { text: 'Publié. Le site en ligne est à jour.' } : { text: result.error, error: true })
    })

  return (
    <span className="inline-flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={() => publish()}
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

      <ConfirmDialog
        open={lowContrast !== null}
        title="Des couleurs sont peu lisibles"
        confirmLabel="Publier quand même"
        busyLabel="Publication…"
        busy={pending}
        onConfirm={() => publish(true)}
        onClose={() => setLowContrast(null)}
      >
        <p>Ces textes passeraient sous 4,5 pour 1, le minimum pour être lus sans effort :</p>
        <ul className="mt-2 list-disc pl-5">
          {lowContrast?.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-2">Tu peux les corriger dans Apparence, ou publier quand même.</p>
      </ConfirmDialog>
    </span>
  )
}

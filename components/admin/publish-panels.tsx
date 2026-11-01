'use client'

import { History, Undo2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { restoreVersion, revertChange } from '@/app/admin/publish-actions'
import type { Change } from '@/lib/admin/changes'
import { formatDate } from '@/lib/admin/format'
import { cn } from '@/lib/content/view'
import { ConfirmDialog } from './dialog'
import { PublishButton } from './publish-controls'

const card = 'flex flex-col gap-1.5 rounded-[20px] border border-line bg-white p-[22px]'
const smallButton = 'inline-flex min-h-9 flex-none items-center gap-1.5 rounded-lg border border-line-strong bg-white px-3 text-xs font-semibold disabled:opacity-60'

/** « Pas encore publié » (design/Dashboard.dc.html) : chaque changement s'annule, ou tout se publie. */
export function ChangesPanel({ changes }: { changes: Change[] }) {
  const [undoing, setUndoing] = useState<Change | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const undo = () =>
    startTransition(async () => {
      if (!undoing) return
      const result = await revertChange(undoing.target)
      if (result.ok) {
        setUndoing(null)
        setError(null)
      } else setError(result.error)
    })

  return (
    <section aria-labelledby="titre-brouillon" className={card}>
      <h2 id="titre-brouillon" className="mb-1.5 text-[15px] font-semibold">
        Pas encore publié{changes.length > 0 && ` (${changes.length})`}
      </h2>
      {changes.length === 0 ? (
        <p className="text-[13px] text-ink-muted">Rien : le site en ligne est identique au brouillon.</p>
      ) : (
        <>
          <ul className="flex flex-col">
            {changes.map((change) => (
              <li key={change.key} className="flex items-center justify-between gap-2.5 border-t border-line-soft py-2.5">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13px] font-semibold">{change.where}</span>
                  <span className="text-[13px] text-ink-muted">{change.what}</span>
                </div>
                <button type="button" onClick={() => setUndoing(change)} className={smallButton}>
                  <Undo2 size={14} aria-hidden="true" />
                  Annuler<span className="sr-only"> : {change.where}</span>
                </button>
              </li>
            ))}
          </ul>
          <PublishButton count={changes.length} label="Tout publier" className="mt-2.5 w-full" />
        </>
      )}

      <ConfirmDialog
        open={undoing !== null}
        title={undoing ? `Annuler : ${undoing.where} ?` : 'Annuler ?'}
        confirmLabel="Annuler la modification"
        busyLabel="Annulation…"
        busy={pending}
        error={error}
        onConfirm={undo}
        onClose={() => {
          setUndoing(null)
          setError(null)
        }}
      >
        {undoing?.target.kind === 'section'
          ? 'Le brouillon reprend cette section telle qu’elle est en ligne. Les changements faits depuis la dernière publication sont perdus.'
          : 'Le brouillon reprend ce réglage tel qu’il est en ligne.'}
      </ConfirmDialog>
    </section>
  )
}

/** Les 10 dernières publications. Une ancienne version peut revenir dans le brouillon. */
export function VersionsPanel({ versions }: { versions: { id: number; publishedAt: string }[] }) {
  const [restoring, setRestoring] = useState<{ id: number; publishedAt: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const restore = () =>
    startTransition(async () => {
      if (!restoring) return
      const result = await restoreVersion(restoring.id)
      if (result.ok) {
        setDone(`La version du ${formatDate(restoring.publishedAt)} est dans le brouillon. Publie pour la remettre en ligne.`)
        setRestoring(null)
        setError(null)
      } else setError(result.error)
    })

  return (
    <section aria-labelledby="titre-versions" className={card}>
      <h2 id="titre-versions" className="mb-1.5 flex items-center gap-2 text-[15px] font-semibold">
        <History size={16} aria-hidden="true" />
        Publications précédentes
      </h2>
      <p role="status" className={cn('text-[13px] text-online-ink', !done && 'hidden')}>
        {done}
      </p>
      <ul className="flex flex-col">
        {versions.map((version, index) => (
          <li key={version.id} className="flex items-center justify-between gap-2.5 border-t border-line-soft py-2.5">
            <span className="text-[13px]">
              {formatDate(version.publishedAt)}
              {index === 0 && <span className="ml-2 rounded-full bg-online-tint px-2 py-0.5 text-[11px] font-semibold text-online-ink">En ligne</span>}
            </span>
            {index > 0 && (
              <button type="button" onClick={() => setRestoring(version)} className={smallButton}>
                Remettre<span className="sr-only"> la version du {formatDate(version.publishedAt)}</span> dans le brouillon
              </button>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={restoring !== null}
        title="Remettre cette version dans le brouillon ?"
        confirmLabel="Remplacer le brouillon"
        busyLabel="Remplacement…"
        busy={pending}
        error={error}
        onConfirm={restore}
        onClose={() => {
          setRestoring(null)
          setError(null)
        }}
      >
        Tout le brouillon est remplacé par la version du {restoring && formatDate(restoring.publishedAt)}. Le site en ligne ne
        change qu’après avoir publié.
      </ConfirmDialog>
    </section>
  )
}

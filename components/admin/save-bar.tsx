'use client'

import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/content/view'
import type { SaveStatus } from './use-section-draft'

/** « à l'instant », « il y a 3 min », « à 9 h 12 ». */
function since(time: number, now: number): string {
  const minutes = Math.floor((now - time) / 60000)
  if (minutes < 1) return 'à l’instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const date = new Date(time)
  return `à ${date.getHours()} h ${String(date.getMinutes()).padStart(2, '0')}`
}

function statusText(status: SaveStatus, savedAt: number | null, now: number, message: string | null): string {
  switch (status) {
    case 'saved':
      return savedAt ? `Enregistré dans le brouillon ${since(savedAt, now)}` : 'Tout est enregistré dans le brouillon'
    case 'pending':
      return 'Enregistrement dans un instant…'
    case 'saving':
      return 'Enregistrement…'
    case 'invalid':
      return 'Corrige les champs en rouge : le brouillon sera enregistré ensuite.'
    case 'error':
    case 'conflict':
      return message ?? 'Enregistrement impossible.'
  }
}

/** Barre du bas d'une page d'édition : état de l'enregistrement et bouton « Enregistrer le brouillon ». */
export function SaveBar({ status, savedAt, message, onSave, start }: {
  status: SaveStatus
  savedAt: number | null
  message: string | null
  onSave: () => void
  /** Action à gauche, une suppression par exemple. */
  start?: React.ReactNode
}) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  const problem = status === 'error' || status === 'conflict' || status === 'invalid'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4">
      <div>{start}</div>
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <p role="status" className={cn('text-[13px]', problem ? 'font-semibold text-danger' : 'text-ink-muted')}>
          {statusText(status, savedAt, now, message)}
        </p>
        {status === 'conflict' ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] bg-indigo px-[18px] text-sm font-semibold text-white"
          >
            Recharger la dernière version
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            disabled={status === 'saving' || status === 'invalid'}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] bg-indigo px-[18px] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} aria-hidden="true" />
            Enregistrer le brouillon
          </button>
        )}
      </div>
    </div>
  )
}

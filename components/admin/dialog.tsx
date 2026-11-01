'use client'

import { useEffect, useId, useRef } from 'react'

/**
 * Fenêtre modale native (<dialog>) : le focus y entre seul, Échap la ferme,
 * et le navigateur rend le focus au bouton qui l'a ouverte.
 */
export function Dialog({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="m-auto w-[min(480px,calc(100%-32px))] rounded-[20px] border border-line bg-white p-6 text-ink shadow-[0_40px_80px_-40px_rgb(11_14_46/0.6)] backdrop:bg-night/55"
    >
      {open && (
        <div className="flex flex-col gap-4">
          <h2 id={titleId} className="font-heading text-xl font-bold">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  )
}

export const secondaryButton =
  'inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[10px] border border-line-strong bg-white px-4 text-sm font-semibold disabled:opacity-60'
export const dangerButton =
  'inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[10px] bg-danger px-4 text-sm font-semibold text-white disabled:opacity-60'
export const primaryButton =
  'inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[10px] bg-indigo px-[18px] text-sm font-semibold text-white disabled:opacity-60'

/** Confirmation avant une suppression. Le bouton « Annuler » reçoit le focus en premier. */
export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onClose, busy, error }: {
  open: boolean
  title: string
  children: React.ReactNode
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
  busy?: boolean
  error?: string | null
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="text-sm leading-relaxed text-ink-muted">{children}</div>
      {error && (
        <p role="alert" className="rounded-xl bg-danger-tint px-3.5 py-2.5 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2.5">
        <button type="button" onClick={onClose} className={secondaryButton}>
          Annuler
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={dangerButton}>
          {busy ? 'Suppression…' : confirmLabel}
        </button>
      </div>
    </Dialog>
  )
}

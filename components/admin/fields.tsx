'use client'

import { Fragment, useId } from 'react'
import type { I18n } from '@/lib/i18n'
import { cn } from '@/lib/content/view'

// Champs de l'admin, d'après design/ProjectEdit.dc.html.

export const inputClass =
  'w-full rounded-[10px] border border-line-strong bg-white px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] focus-visible:border-ocre focus-visible:shadow-[0_0_0_3px_rgb(226_163_58/0.18)] aria-[invalid=true]:border-danger'

/** Carte blanche titrée qui regroupe des champs. */
export function Panel({ title, description, actions, children, className }: {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={cn('flex flex-col gap-[18px] rounded-[20px] border border-line bg-white p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="font-heading text-xl font-bold">
            {title}
          </h2>
          {description && <p className="max-w-[560px] text-sm text-ink-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <span id={id} className="text-xs font-semibold text-danger">
      {error}
    </span>
  )
}

type TextProps = {
  label: React.ReactNode
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: React.ReactNode
  maxLength?: number
  multiline?: boolean
  rows?: number
  type?: 'text' | 'url' | 'email'
  placeholder?: string
  lang?: string
  /** Au-delà, un rappel s'affiche sous le champ (la carte devient trop haute, par exemple). */
  softLimit?: { length: number; note: string }
}

export function TextField({ label, value, onChange, error, hint, maxLength, multiline, rows = 4, type = 'text', placeholder, lang, softLimit }: TextProps) {
  const id = useId()
  const describedBy = [error && `${id}-error`, (hint || softLimit) && `${id}-hint`].filter(Boolean).join(' ') || undefined
  const shared = {
    id,
    value,
    lang,
    maxLength,
    placeholder,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  }
  const over = softLimit && value.length > softLimit.length

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, 'resize-y py-3 leading-[1.55]')}
        />
      ) : (
        <input
          {...shared}
          type={type}
          spellCheck={type === 'text' ? undefined : false}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, 'min-h-11')}
        />
      )}
      <FieldError id={`${id}-error`} error={error} />
      {(hint || softLimit) && (
        <span id={`${id}-hint`} className={cn('text-xs', over ? 'font-semibold text-ocre-deep' : 'text-ink-muted')}>
          {softLimit ? `${value.length} caractères. ${over ? softLimit.note : ''}` : hint}
          {softLimit && hint ? ` ${hint}` : ''}
        </span>
      )}
    </div>
  )
}

function LangChip({ lang }: { lang: 'fr' | 'en' }) {
  return (
    <span className="rounded-md bg-[#E9EBFA] px-2 py-0.5 text-[11px] font-semibold text-indigo" aria-hidden="true">
      {lang.toUpperCase()}
    </span>
  )
}

/** Badge orange : le texte anglais manque, le site anglais affichera le français. */
export function ToTranslate() {
  return <span className="rounded-full bg-ocre-tint px-2 py-0.5 text-[11px] font-semibold text-ocre-deep">À traduire</span>
}

export type I18nRow = {
  key: string
  label: string
  value: I18n
  onChange: (value: I18n) => void
  /** Chemin de l'erreur dans la section, sans « .fr » ni « .en » (« title », « data.items.2.text »). */
  errorPath?: string
  multiline?: boolean
  rows?: number
  maxLength?: number
  softLimit?: { length: number; note: string }
  hint?: string
}

/** Textes en français et en anglais, côte à côte sur grand écran. */
export function I18nFields({ rows, errors }: { rows: I18nRow[]; errors: Record<string, string> }) {
  return (
    <div className="grid gap-x-4 gap-y-[18px] md:grid-cols-2">
      <p className="hidden items-center gap-2 text-[13px] font-semibold text-indigo md:flex">
        <LangChip lang="fr" /> Français
      </p>
      <p className="hidden items-center gap-2 text-[13px] font-semibold text-indigo md:flex">
        <LangChip lang="en" /> Anglais
      </p>
      {rows.map((row) => {
        const toTranslate = row.value.fr.trim() !== '' && row.value.en.trim() === ''
        return (
          <Fragment key={row.key}>
            <TextField
              label={
                <>
                  {row.label} <LangChip lang="fr" />
                  <span className="sr-only">(français)</span>
                </>
              }
              lang="fr"
              value={row.value.fr}
              onChange={(fr) => row.onChange({ ...row.value, fr })}
              error={row.errorPath ? errors[`${row.errorPath}.fr`] : undefined}
              multiline={row.multiline}
              rows={row.rows}
              maxLength={row.maxLength}
              softLimit={row.softLimit}
              hint={row.hint}
            />
            <TextField
              label={
                <>
                  {row.label} <LangChip lang="en" />
                  <span className="sr-only">(anglais)</span>
                  {toTranslate && <ToTranslate />}
                </>
              }
              lang="en"
              value={row.value.en}
              onChange={(en) => row.onChange({ ...row.value, en })}
              error={row.errorPath ? errors[`${row.errorPath}.en`] : undefined}
              multiline={row.multiline}
              rows={row.rows}
              maxLength={row.maxLength}
              softLimit={row.softLimit}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

export function SelectField<T extends string>({ label, value, onChange, options, hint }: {
  label: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  hint?: string
}) {
  const id = useId()
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(inputClass, 'min-h-11')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && (
        <span id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </span>
      )}
    </div>
  )
}

/** Interrupteur (role="switch"), d'après la maquette : indigo quand il est actif. */
export function Switch({ checked, onChange, label, labelledBy }: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  labelledBy?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-[26px] w-11 flex-none rounded-full p-[3px] transition-colors',
        checked ? 'justify-end bg-indigo' : 'justify-start bg-line-strong',
      )}
    >
      <span className="size-5 rounded-full bg-white shadow-sm" />
    </button>
  )
}

/** Ligne « libellé + explication + interrupteur ». */
export function SwitchField({ label, description, checked, onChange }: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span id={id} className="text-[13px] font-semibold">
          {label}
        </span>
        {description && <span className="text-xs text-ink-muted">{description}</span>}
      </div>
      <Switch checked={checked} onChange={onChange} labelledBy={id} />
    </div>
  )
}

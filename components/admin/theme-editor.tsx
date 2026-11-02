'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useId, useMemo } from 'react'
import { saveTheme } from '@/app/admin/draft-actions'
import { checkContrast, formatRatio, MIN_CONTRAST, type ColorKey } from '@/lib/admin/contrast'
import { BODY_FONT_KEYS, BODY_FONTS, HEADING_FONT_KEYS, HEADING_FONTS } from '@/lib/fonts-list'
import { themeSchema, type Content, type Theme } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { DEFAULT_THEME } from '@/lib/theme'
import { secondaryButton } from './dialog'
import { inputClass, Panel, SelectField } from './fields'
import { PreviewPane, type PreviewFocus } from './preview-pane'
import { SaveBar } from './save-bar'
import { useDraftPart } from './use-draft-part'

const options = { schema: themeSchema, save: saveTheme }

// Noms et usages, d'après design/Theme.dc.html.
const COLORS: { key: ColorKey; name: string; use: string }[] = [
  { key: 'bgDark', name: 'Fond sombre', use: 'Haut de page, galerie' },
  { key: 'bgIndigo', name: 'Fond indigo', use: 'Parcours, contact, carte du projet phare' },
  { key: 'bgLight', name: 'Fond clair', use: 'À propos, projets, compétences' },
  { key: 'accent', name: 'Accent', use: 'Boutons, trait sous le nom, symboles' },
  { key: 'text', name: 'Texte principal', use: 'Titres et textes sur fond clair' },
  { key: 'textMuted', name: 'Texte secondaire', use: 'Paragraphes sur fond clair' },
]

const HEX = /^#[0-9a-fA-F]{6}$/

/** Écran Apparence (design/Theme.dc.html) : six couleurs avec contrôle de lisibilité, deux polices. */
export function ThemeEditor({ content, theme: initial, hash, focus }: {
  content: Content
  theme: Theme
  hash: string
  focus: PreviewFocus
}) {
  const draft = useDraftPart(initial, hash, options)
  const theme = draft.value
  const checks = checkContrast(theme.colors)
  const failing = checks.filter((check) => !check.ok)
  const preview = useMemo(() => ({ ...content, theme }), [content, theme])

  const setColor = (key: ColorKey, value: string) => draft.update((t) => ({ ...t, colors: { ...t.colors, [key]: value } }))
  // Pour chaque problème, la couleur changée depuis l'origine est la suspecte : on propose de la remettre.
  const suggestions = COLORS.filter(
    ({ key }) => failing.some((check) => check.colors.includes(key)) && theme.colors[key].toUpperCase() !== DEFAULT_THEME.colors[key],
  )

  return (
    <main className="flex flex-wrap items-start gap-6 p-4 sm:p-8">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        {failing.length > 0 && (
          <div role="status" className="flex gap-3 rounded-2xl border border-[#F2D3A8] bg-ocre-tint px-4 py-3.5 text-sm text-ocre-deep">
            <AlertTriangle size={20} aria-hidden="true" className="mt-0.5 flex-none" />
            <div className="flex flex-col gap-1">
              <strong>
                {failing.length === 1 ? '1 paire de couleurs à revoir avant de publier.' : `${failing.length} paires de couleurs à revoir avant de publier.`}
              </strong>
              <ul className="list-disc pl-4">
                {failing.map((check) => (
                  <li key={check.label}>
                    {check.label} : {formatRatio(check.ratio)}, il faut {formatRatio(MIN_CONTRAST)}.
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Panel title="Couleurs" description="Les teintes secondaires (bordures, étiquettes, textes pâles) en découlent toutes seules.">
          <ul className="flex flex-col">
            {COLORS.map((color) => (
              <ColorRow
                key={color.key}
                name={color.name}
                use={color.use}
                value={theme.colors[color.key]}
                onChange={(value) => setColor(color.key, value)}
                error={draft.errors[`colors.${color.key}`]}
                worst={failing.filter((check) => check.colors.includes(color.key)).sort((a, b) => a.ratio - b.ratio)[0]}
              />
            ))}
          </ul>
          {suggestions.map(({ key, name }) => (
            <p key={key} className="flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
              Suggestion pour {name.toLowerCase()} : {DEFAULT_THEME.colors[key]}, la couleur d’origine.
              <button type="button" onClick={() => setColor(key, DEFAULT_THEME.colors[key])} className="font-semibold text-indigo underline underline-offset-2">
                Remettre
              </button>
            </p>
          ))}
        </Panel>

        <Panel title="Polices" description="Une liste courte de polices, préparées à l’avance pour s’afficher sans délai.">
          <div className="grid gap-5 md:grid-cols-2">
            <FontPicker
              label="Titres"
              value={theme.fonts.heading}
              keys={HEADING_FONT_KEYS}
              names={HEADING_FONTS}
              onChange={(heading) => draft.update((t) => ({ ...t, fonts: { ...t.fonts, heading } }))}
              sample={<p className="text-[26px] leading-tight font-extrabold">Guy Roland Obodjé</p>}
            />
            <FontPicker
              label="Texte"
              value={theme.fonts.body}
              keys={BODY_FONT_KEYS}
              names={BODY_FONTS}
              onChange={(body) => draft.update((t) => ({ ...t, fonts: { ...t.fonts, body } }))}
              sample={
                <p className="text-sm leading-relaxed">
                  Je conçois et développe des produits web de bout en bout, de la plateforme EdTech ANTA aux missions de la Junior
                  Entreprise ESCA.
                </p>
              }
            />
          </div>
        </Panel>

        <SaveBar
          status={draft.status}
          savedAt={draft.savedAt}
          message={draft.message}
          onSave={draft.save}
          start={
            <button type="button" onClick={() => draft.update(() => DEFAULT_THEME)} className={secondaryButton}>
              <RotateCcw size={16} aria-hidden="true" />
              Revenir au thème d’origine
            </button>
          }
        />
      </div>

      <div className="min-w-0 flex-[1_1_380px] lg:sticky lg:top-6">
        <PreviewPane content={preview} focus={focus} />
      </div>
    </main>
  )
}

function ColorRow({ name, use, value, onChange, error, worst }: {
  name: string
  use: string
  value: string
  onChange: (value: string) => void
  error?: string
  worst?: { label: string; ratio: number }
}) {
  const id = useId()
  const valid = HEX.test(value)
  return (
    <li className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-t border-line-soft py-3 first:border-t-0">
      <label className="relative size-11 flex-none cursor-pointer overflow-hidden rounded-xl border border-line-strong" style={{ background: valid ? value : '#fff' }}>
        <span className="sr-only">Choisir {name.toLowerCase()} dans la palette</span>
        <input
          type="color"
          value={valid ? value.toLowerCase() : '#000000'}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-semibold">
          {name}
        </label>
        <span className="text-xs text-ink-muted">{use}</span>
      </div>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value.trim())}
        maxLength={7}
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-state`}
        className={cn(inputClass, 'min-h-11 w-28 flex-none font-mono uppercase')}
      />
      <span
        id={`${id}-state`}
        className={cn(
          'inline-flex flex-[0_1_auto] items-center gap-1.5 text-xs font-semibold',
          error || worst ? 'text-[#8C4A06]' : 'text-online-ink',
        )}
      >
        <span aria-hidden="true" className={cn('size-2 flex-none rounded-full', error || worst ? 'bg-[#D9822B]' : 'bg-online')} />
        {error ? 'Format attendu : #RRGGBB' : worst ? `Peu lisible : ${formatRatio(worst.ratio)}, il faut 4,5` : 'Lisible'}
      </span>
    </li>
  )
}

function FontPicker<K extends string>({ label, value, keys, names, onChange, sample }: {
  label: string
  value: K
  keys: readonly K[]
  names: Record<K, string>
  onChange: (value: K) => void
  sample: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <SelectField label={label} value={value} onChange={onChange} options={keys.map((key) => ({ value: key, label: names[key] }))} />
      {/* Les variables de chaque police sont posées sur <html> (app/admin/(ui)/layout.tsx). */}
      <div className="rounded-xl bg-paper p-4" style={{ fontFamily: `var(--font-${value}), system-ui, sans-serif` }}>
        {sample}
      </div>
    </div>
  )
}

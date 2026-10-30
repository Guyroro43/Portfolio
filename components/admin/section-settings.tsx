'use client'

import { ADINKRA, ADINKRA_KEYS, TONES, type AdinkraSymbol, type Tone } from '@/lib/content/constants'
import type { Section } from '@/lib/content/schema'
import { I18nFields, Panel, SelectField, SwitchField, type I18nRow } from './fields'

const TONE_LABELS: Record<Tone, string> = {
  dark: 'Sombre',
  indigo: 'Indigo',
  light: 'Clair',
  'light-alt': 'Clair, un peu plus soutenu',
}

const SYMBOL_OPTIONS = [
  ...ADINKRA_KEYS.map((key) => ({ value: key, label: `${ADINKRA[key].name}, ${ADINKRA[key].meaning.fr}` })),
  { value: 'none' as const, label: 'Aucun symbole' },
]

type Props<S extends Section> = {
  section: S
  update: (change: (current: S) => S) => void
  errors: Record<string, string>
}

/**
 * Réglages communs à toutes les sections. Le haut de page et la bande de noms n'ont ni titre
 * ni symbole sur le site : on ne propose que ce qui s'y voit.
 */
export function SectionSettings<S extends Section>({ section, update, errors }: Props<S>) {
  const special = section.type === 'hero' || section.type === 'marquee'
  const set = <K extends keyof Section>(key: K, value: S[K]) => update((current) => ({ ...current, [key]: value }))

  const rows: I18nRow[] = [
    {
      key: 'label',
      label: special ? 'Nom dans l’admin' : 'Nom court',
      hint: special ? undefined : 'Dans le menu du haut et au-dessus du titre (« 01 · À propos »).',
      value: section.label,
      onChange: (value) => set('label', value),
      errorPath: 'label',
      maxLength: 200,
    },
  ]
  if (!special) {
    rows.push(
      { key: 'title', label: 'Titre', value: section.title, onChange: (value) => set('title', value), errorPath: 'title', maxLength: 200 },
      {
        key: 'intro',
        label: 'Phrase d’intro',
        hint: 'Facultative, sous le titre.',
        value: section.intro,
        onChange: (value) => set('intro', value),
        errorPath: 'intro',
        multiline: true,
        rows: 2,
        maxLength: 2000,
      },
    )
  }

  return (
    <Panel title="La section">
      <div className="flex flex-col gap-4 rounded-2xl bg-paper p-4">
        <SwitchField
          label="Visible sur le site"
          description={section.visible ? 'Les visiteurs la verront après publication.' : 'Masquée : elle reste dans le brouillon, invisible sur le site.'}
          checked={section.visible}
          onChange={(visible) => set('visible', visible)}
        />
        {!special && (
          <SwitchField
            label="Dans le menu du haut"
            description="Un lien vers cette section dans le menu."
            checked={section.inMenu}
            onChange={(inMenu) => set('inMenu', inMenu)}
          />
        )}
      </div>

      <I18nFields rows={rows} errors={errors} />

      {section.type !== 'marquee' && (
        <div className="grid gap-4 md:grid-cols-2">
          {!special && (
            <SelectField
              label="Symbole Adinkra"
              value={section.symbol ?? 'none'}
              onChange={(value) => set('symbol', (value === 'none' ? null : value) as AdinkraSymbol | null)}
              options={SYMBOL_OPTIONS}
              hint="Affiché à côté du titre, avec sa signification."
            />
          )}
          <SelectField
            label="Fond"
            value={section.tone}
            onChange={(tone) => set('tone', tone)}
            options={TONES.map((tone) => ({ value: tone, label: TONE_LABELS[tone] }))}
            hint="Les couleurs exactes se règlent dans Apparence."
          />
        </div>
      )}
    </Panel>
  )
}

'use client'

import { useId, useRef } from 'react'
import { newId } from '@/lib/admin/ids'
import type { Published, Section, SectionOf } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { t, type I18n } from '@/lib/i18n'
import { I18nFields, Panel, SelectField, SwitchField, TextField } from './fields'
import { ListEditor } from './list-editor'
import { IconField, PhotoField } from './media-fields'

const empty = (): I18n => ({ fr: '', en: '' })

type DataOf<T extends Section['type']> = SectionOf<T>['data']
type EditorProps<T extends Section['type']> = {
  data: DataOf<T>
  setData: (change: (data: DataOf<T>) => DataOf<T>) => void
  errors: Record<string, string>
  media: Published['media']
}

/** Sous-titre à l'intérieur du panneau « Contenu ». */
function Group({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-3 border-t border-line-soft pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-0.5">
        <h3 id={id} className="text-[15px] font-semibold">
          {title}
        </h3>
        {description && <p className="text-[13px] text-ink-muted">{description}</p>}
      </div>
      {children}
    </div>
  )
}

/** Contenu propre à chaque forme de section. */
export function SectionContent({ section, update, errors, media, sections }: {
  section: Section
  update: (change: (current: Section) => Section) => void
  errors: Record<string, string>
  media: Published['media']
  sections: Section[]
}) {
  // Modifie les données de la section, sans jamais changer sa forme.
  function setData<T extends Section['type']>(type: T) {
    return (change: (data: DataOf<T>) => DataOf<T>) =>
      update((current) => (current.type === type ? ({ ...current, data: change(current.data as DataOf<T>) } as Section) : current))
  }
  const shared = { errors, media }

  switch (section.type) {
    case 'hero':
      return (
        <HeroContent
          data={section.data}
          setData={setData('hero')}
          targets={sections.filter((s) => s.type !== 'hero').map((s) => ({ value: s.id, label: t(s.label, 'fr') }))}
          {...shared}
        />
      )
    case 'marquee':
      return <MarqueeContent data={section.data} setData={setData('marquee')} {...shared} />
    case 'text':
      return <TextContent data={section.data} setData={setData('text')} {...shared} />
    case 'timeline':
      return <TimelineContent data={section.data} setData={setData('timeline')} {...shared} />
    case 'gallery':
      return <GalleryContent data={section.data} setData={setData('gallery')} {...shared} />
    case 'links':
      return <LinksContent data={section.data} setData={setData('links')} {...shared} />
    case 'cards':
      // Les cartes ont leur propre page d'édition (components/admin/cards-editor.tsx).
      return null
  }
}

function HeroContent({ data, setData, errors, media, targets }: EditorProps<'hero'> & { targets: { value: string; label: string }[] }) {
  const set = <K extends keyof DataOf<'hero'>>(key: K, value: DataOf<'hero'>[K]) => setData((d) => ({ ...d, [key]: value }))

  return (
    <Panel title="Contenu du haut de page">
      <Group title="Toi">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Nom"
            value={data.name}
            onChange={(name) => set('name', name)}
            maxLength={80}
            error={errors['data.name']}
            hint="En grand, identique dans les deux langues."
          />
          <TextField
            label="Surnom"
            value={data.nickname.name}
            onChange={(name) => set('nickname', { ...data.nickname, name })}
            maxLength={40}
            error={errors['data.nickname.name']}
          />
        </div>
        <I18nFields
          errors={errors}
          rows={[
            {
              key: 'prefix',
              label: 'Avant le surnom',
              hint: '« dit » en français, « aka » en anglais.',
              value: data.nickname.prefix,
              onChange: (prefix) => set('nickname', { ...data.nickname, prefix }),
              errorPath: 'data.nickname.prefix',
              maxLength: 200,
            },
            { key: 'location', label: 'Lieu', value: data.location, onChange: (v) => set('location', v), errorPath: 'data.location', maxLength: 200 },
            { key: 'role', label: 'Ce que tu fais', value: data.role, onChange: (v) => set('role', v), errorPath: 'data.role', maxLength: 200 },
            {
              key: 'lead',
              label: 'Présentation',
              value: data.lead,
              onChange: (v) => set('lead', v),
              errorPath: 'data.lead',
              multiline: true,
              maxLength: 2000,
              softLimit: { length: 300, note: 'Au-delà de 300, le haut de page devient long sur téléphone.' },
            },
          ]}
        />
      </Group>

      <Group title="Boutons" description="Deux au plus. Le premier est en ocre, le second en contour.">
        <ListEditor
          items={data.buttons}
          onChange={(buttons) => set('buttons', buttons)}
          name={(button, index) => t(button.label, 'fr') || `Bouton ${index + 1}`}
          create={() => ({ id: newId(), label: empty(), target: targets[0]?.value ?? '' })}
          addLabel="Ajouter un bouton"
          max={2}
        >
          {(button, index, change) => (
            <>
              <I18nFields
                errors={errors}
                rows={[
                  {
                    key: 'label',
                    label: 'Texte du bouton',
                    value: button.label,
                    onChange: (label) => change({ ...button, label }),
                    errorPath: `data.buttons.${index}.label`,
                    maxLength: 200,
                  },
                ]}
              />
              <SelectField label="Mène à la section" value={button.target} onChange={(target) => change({ ...button, target })} options={targets} />
            </>
          )}
        </ListEditor>
      </Group>

      <Group title="Chiffres" description="Trois au plus, sous les boutons.">
        <ListEditor
          items={data.stats}
          onChange={(stats) => set('stats', stats)}
          name={(stat, index) => (stat.value ? `${stat.value}${stat.suffix}` : `Chiffre ${index + 1}`)}
          create={() => ({ id: newId(), value: '', suffix: '', count: false, label: empty() })}
          addLabel="Ajouter un chiffre"
          max={3}
        >
          {(stat, index, change) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Chiffre"
                  value={stat.value}
                  onChange={(value) => change({ ...stat, value })}
                  maxLength={12}
                  error={errors[`data.stats.${index}.value`]}
                  hint="330, 25, D1…"
                />
                <TextField
                  label="Après le chiffre"
                  value={stat.suffix}
                  onChange={(suffix) => change({ ...stat, suffix })}
                  maxLength={12}
                  hint="Facultatif : /400, +, %…"
                />
              </div>
              <SwitchField
                label="Compter depuis 0 à l’arrivée"
                description="Seulement pour un nombre entier."
                checked={stat.count}
                onChange={(count) => change({ ...stat, count })}
              />
              {errors[`data.stats.${index}.count`] && (
                <span className="text-xs font-semibold text-danger">{errors[`data.stats.${index}.count`]}</span>
              )}
              <I18nFields
                errors={errors}
                rows={[
                  {
                    key: 'label',
                    label: 'Légende',
                    value: stat.label,
                    onChange: (label) => change({ ...stat, label }),
                    errorPath: `data.stats.${index}.label`,
                    maxLength: 200,
                  },
                ]}
              />
            </>
          )}
        </ListEditor>
      </Group>

      <Group title="Photo">
        <PhotoField label="Photo du haut de page" value={data.photo} onChange={(photo) => set('photo', photo)} media={media} />
      </Group>
    </Panel>
  )
}

function MarqueeContent({ data, setData, errors }: EditorProps<'marquee'>) {
  return (
    <Panel title="Les noms qui défilent" description="Entre un et douze noms, sur la bande ocre.">
      <ListEditor
        items={data.items}
        onChange={(items) => setData((d) => ({ ...d, items }))}
        name={(item, index) => item.text.fr || `Nom ${index + 1}`}
        create={() => ({ id: newId(), text: empty() })}
        addLabel="Ajouter un nom"
        max={12}
        min={1}
      >
        {(item, index, change) => (
          <I18nFields
            errors={errors}
            rows={[
              { key: 'text', label: 'Nom', value: item.text, onChange: (text) => change({ ...item, text }), errorPath: `data.items.${index}.text`, maxLength: 200 },
            ]}
          />
        )}
      </ListEditor>
    </Panel>
  )
}

type Side = DataOf<'text'>['side']

function TextContent({ data, setData, errors, media }: EditorProps<'text'>) {
  // En passant de la carte à la photo puis en revenant, on retrouve la carte telle qu'elle était.
  const remembered = useRef<{ card?: Side; photo?: Side }>({})
  const kind = data.side?.kind ?? 'none'
  const firstPhoto = Object.keys(media)[0]

  const chooseSide = (next: 'none' | 'card' | 'photo') => {
    if (data.side) remembered.current[data.side.kind] = data.side
    let side: Side = null
    if (next === 'card') side = remembered.current.card ?? { kind: 'card', title: { fr: 'En bref', en: 'At a glance' }, rows: [] }
    if (next === 'photo') side = remembered.current.photo ?? (firstPhoto ? { kind: 'photo', photo: firstPhoto } : null)
    setData((d) => ({ ...d, side }))
  }

  return (
    <Panel title="Contenu">
      <Group title="Paragraphes" description="Six au plus, à gauche.">
        <ListEditor
          items={data.paragraphs}
          onChange={(paragraphs) => setData((d) => ({ ...d, paragraphs }))}
          name={(_, index) => `Paragraphe ${index + 1}`}
          create={() => ({ id: newId(), text: empty() })}
          addLabel="Ajouter un paragraphe"
          max={6}
          empty="Pas encore de paragraphe."
        >
          {(paragraph, index, change) => (
            <I18nFields
              errors={errors}
              rows={[
                {
                  key: 'text',
                  label: 'Texte',
                  value: paragraph.text,
                  onChange: (text) => change({ ...paragraph, text }),
                  errorPath: `data.paragraphs.${index}.text`,
                  multiline: true,
                  rows: 5,
                  maxLength: 2000,
                },
              ]}
            />
          )}
        </ListEditor>
      </Group>

      <Group title="À droite" description="Une carte de quelques lignes, une photo, ou rien.">
        <SelectField
          label="Ce qui s’affiche à droite"
          value={kind}
          onChange={chooseSide}
          options={[
            { value: 'card', label: 'Une carte (comme « En bref »)' },
            ...(firstPhoto ? [{ value: 'photo' as const, label: 'Une photo' }] : []),
            { value: 'none', label: 'Rien, le texte prend toute la largeur' },
          ]}
        />
        {data.side?.kind === 'card' && (
          <SideCard side={data.side} change={(side) => setData((d) => ({ ...d, side }))} errors={errors} />
        )}
        {data.side?.kind === 'photo' && (
          <PhotoField
            label="Photo"
            value={data.side.photo}
            onChange={(photo) => photo && setData((d) => ({ ...d, side: { kind: 'photo', photo } }))}
            media={media}
            allowNone={false}
          />
        )}
      </Group>
    </Panel>
  )
}

function SideCard({ side, change, errors }: {
  side: Extract<NonNullable<Side>, { kind: 'card' }>
  change: (side: Extract<NonNullable<Side>, { kind: 'card' }>) => void
  errors: Record<string, string>
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-paper p-4">
      <I18nFields
        errors={errors}
        rows={[
          { key: 'title', label: 'Titre de la carte', value: side.title, onChange: (title) => change({ ...side, title }), errorPath: 'data.side.title', maxLength: 200 },
        ]}
      />
      <ListEditor
        items={side.rows}
        onChange={(rows) => change({ ...side, rows })}
        name={(row, index) => row.label.fr || `Ligne ${index + 1}`}
        create={() => ({ id: newId(), icon: 'sparkles' as const, label: empty(), value: empty() })}
        addLabel="Ajouter une ligne"
        max={10}
      >
        {(row, index, changeRow) => (
          <>
            <IconField label="Icône" value={row.icon} onChange={(icon) => icon && changeRow({ ...row, icon })} />
            <I18nFields
              errors={errors}
              rows={[
                { key: 'label', label: 'Intitulé', value: row.label, onChange: (label) => changeRow({ ...row, label }), errorPath: `data.side.rows.${index}.label`, maxLength: 200 },
                { key: 'value', label: 'Texte', value: row.value, onChange: (value) => changeRow({ ...row, value }), errorPath: `data.side.rows.${index}.value`, maxLength: 200 },
              ]}
            />
          </>
        )}
      </ListEditor>
    </div>
  )
}

function TimelineContent({ data, setData, errors }: EditorProps<'timeline'>) {
  const rememberedNote = useRef(data.note)
  return (
    <Panel title="Contenu">
      <Group title="Étapes" description="De la plus ancienne à la plus récente. La dernière est mise en avant.">
        <ListEditor
          items={data.steps}
          onChange={(steps) => setData((d) => ({ ...d, steps }))}
          name={(step, index) => step.title.fr || `Étape ${index + 1}`}
          create={() => ({ id: newId(), date: empty(), title: empty(), text: empty() })}
          addLabel="Ajouter une étape"
          max={20}
          empty="Pas encore d’étape."
        >
          {(step, index, change) => (
            <I18nFields
              errors={errors}
              rows={[
                { key: 'date', label: 'Date', value: step.date, onChange: (date) => change({ ...step, date }), errorPath: `data.steps.${index}.date`, maxLength: 200 },
                { key: 'title', label: 'Titre', value: step.title, onChange: (title) => change({ ...step, title }), errorPath: `data.steps.${index}.title`, maxLength: 200 },
                {
                  key: 'text',
                  label: 'Texte',
                  value: step.text,
                  onChange: (text) => change({ ...step, text }),
                  errorPath: `data.steps.${index}.text`,
                  multiline: true,
                  rows: 3,
                  maxLength: 2000,
                },
              ]}
            />
          )}
        </ListEditor>
      </Group>

      <Group title="Note">
        <SwitchField
          label="Une note à côté du titre"
          description="Par exemple « En parallèle : … »."
          checked={data.note !== null}
          onChange={(on) => {
            if (data.note) rememberedNote.current = data.note
            setData((d) => ({ ...d, note: on ? (rememberedNote.current ?? { label: empty(), text: empty() }) : null }))
          }}
        />
        {data.note && (
          <I18nFields
            errors={errors}
            rows={[
              { key: 'label', label: 'Début, en gras', value: data.note.label, onChange: (label) => setData((d) => ({ ...d, note: d.note && { ...d.note, label } })), errorPath: 'data.note.label', maxLength: 200 },
              { key: 'text', label: 'Suite', value: data.note.text, onChange: (text) => setData((d) => ({ ...d, note: d.note && { ...d.note, text } })), errorPath: 'data.note.text', multiline: true, rows: 2, maxLength: 2000 },
            ]}
          />
        )}
      </Group>
    </Panel>
  )
}

function GalleryContent({ data, setData, media }: EditorProps<'gallery'>) {
  const firstPhoto = Object.keys(media)[0]
  if (!firstPhoto) {
    return (
      <Panel title="Les photos" description="Envoie d’abord des photos dans l’écran Photos : tu pourras ensuite les placer ici.">
        <span />
      </Panel>
    )
  }
  return (
    <Panel title="Les photos" description="Une photo haute occupe deux rangées de la grille.">
      <ListEditor
        items={data.items}
        onChange={(items) => setData((d) => ({ ...d, items }))}
        name={(item, index) => media[item.photo]?.caption.fr || `Photo ${index + 1}`}
        create={() => ({ id: newId(), photo: firstPhoto, tall: false })}
        addLabel="Ajouter une photo"
        max={40}
        empty="Pas encore de photo."
      >
        {(item, _, change) => (
          <>
            <PhotoField label="Photo" value={item.photo} onChange={(photo) => photo && change({ ...item, photo })} media={media} allowNone={false} />
            <SwitchField label="Photo haute" description="Deux rangées au lieu d’une." checked={item.tall} onChange={(tall) => change({ ...item, tall })} />
          </>
        )}
      </ListEditor>
    </Panel>
  )
}

const LINK_KINDS = [
  { value: 'email', label: 'Email (avec bouton Copier)' },
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'link', label: 'Autre lien' },
] as const

function LinksContent({ data, setData, errors }: EditorProps<'links'>) {
  return (
    <Panel title="Les liens" description="Huit au plus. Un email affiche un bouton pour copier l’adresse.">
      <ListEditor
        items={data.items}
        onChange={(items) => setData((d) => ({ ...d, items }))}
        name={(item, index) => item.label.fr || item.display || `Lien ${index + 1}`}
        create={() => ({ id: newId(), kind: 'link' as const, label: empty(), display: '', href: '' })}
        addLabel="Ajouter un lien"
        max={8}
        empty="Pas encore de lien."
      >
        {(item, index, change) => (
          <>
            <SelectField label="Sorte de lien" value={item.kind} onChange={(kind) => change({ ...item, kind })} options={[...LINK_KINDS]} />
            <I18nFields
              errors={errors}
              rows={[
                { key: 'label', label: 'Titre', value: item.label, onChange: (label) => change({ ...item, label }), errorPath: `data.items.${index}.label`, maxLength: 200 },
              ]}
            />
            {item.kind === 'email' ? (
              <TextField
                label="Adresse email"
                type="email"
                value={item.display}
                onChange={(display) => change({ ...item, display, href: display ? `mailto:${display.trim()}` : '' })}
                maxLength={120}
                error={errors[`data.items.${index}.href`] ?? errors[`data.items.${index}.display`]}
              />
            ) : (
              <div className={cn('grid gap-4 md:grid-cols-2')}>
                <TextField
                  label="Texte affiché"
                  value={item.display}
                  onChange={(display) => change({ ...item, display })}
                  maxLength={120}
                  hint="Par exemple github.com/Guyroro43"
                  error={errors[`data.items.${index}.display`]}
                />
                <TextField
                  label="Adresse du lien"
                  type="url"
                  value={item.href}
                  onChange={(href) => change({ ...item, href: href.trim() })}
                  maxLength={500}
                  placeholder="https://"
                  error={errors[`data.items.${index}.href`]}
                />
              </div>
            )}
          </>
        )}
      </ListEditor>
    </Panel>
  )
}

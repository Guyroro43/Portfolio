'use client'

import { ArrowLeft, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useId, useMemo, useState, useTransition } from 'react'
import { Icon } from '@/components/site/icon'
import { newId } from '@/lib/admin/ids'
import { STATUS_KEYS, STATUSES, type ProjectStatus } from '@/lib/content/constants'
import type { Content, Published, SectionOf } from '@/lib/content/schema'
import { cn, mediaSrc } from '@/lib/content/view'
import { t } from '@/lib/i18n'
import { ConfirmDialog, primaryButton } from './dialog'
import { I18nFields, Panel, SelectField, Switch, SwitchField, TextField } from './fields'
import { IconField, PhotoField } from './media-fields'
import { PreviewPane } from './preview-pane'
import { SaveBar } from './save-bar'
import { GuardedLink } from './save-guard'
import { SectionSettings } from './section-settings'
import { DragHandle, SortableList } from './sortable-list'
import { useSectionDraft } from './use-section-draft'

type CardsSection = SectionOf<'cards'>
type Card = CardsSection['data']['items'][number]
type Variant = CardsSection['data']['variant']

const NOUN: Record<Variant, { one: string; add: string; new: string }> = {
  projects: { one: 'projet', add: 'Ajouter un projet', new: 'Nouveau projet' },
  tags: { one: 'groupe', add: 'Ajouter un groupe', new: 'Nouveau groupe' },
  pictures: { one: 'carte', add: 'Ajouter une carte', new: 'Nouvelle carte' },
}

// Couleurs des statuts, reprises de la maquette (design/Projects.dc.html).
const STATUS_CHIP: Record<ProjectStatus, string> = {
  'in-progress': 'bg-ocre-tint text-ocre-deep',
  redesign: 'bg-[#E9EBFA] text-indigo',
  delivered: 'bg-online-tint text-online-ink',
  'for-sale': 'bg-[#F1EEE6] text-ink-muted',
}

const cardName = (card: Card, variant: Variant) => t(card.title, 'fr') || NOUN[variant].new

function newCard(): Card {
  const empty = { fr: '', en: '' }
  return {
    id: newId(),
    visible: true,
    icon: null,
    kicker: empty,
    title: empty,
    text: empty,
    tags: [],
    status: null,
    featured: false,
    siteUrl: '',
    codeUrl: '',
    image: null,
  }
}

/**
 * Liste des cartes d'une section (design/Projects.dc.html) : ordre, étoile du projet phare,
 * interrupteur, suppression. Chaque carte se modifie sur sa propre page.
 */
export function CardsList({ section, setItems, save, publishedIds, media }: {
  section: CardsSection
  setItems: (items: Card[]) => void
  save: () => Promise<boolean>
  publishedIds: string[]
  media: Published['media']
}) {
  const router = useRouter()
  const { variant, items } = section.data
  const [removing, setRemoving] = useState<Card | null>(null)
  const [adding, startAdding] = useTransition()

  const add = () =>
    startAdding(async () => {
      const card = newCard()
      setItems([...items, card])
      // On enregistre d'abord : la page de la carte relit le brouillon.
      if (await save()) router.push(`/admin/sections/${section.id}/${card.id}`)
    })

  const setFeatured = (card: Card) =>
    setItems(items.map((item) => ({ ...item, featured: item.id === card.id ? !card.featured : false })))

  return (
    <Panel
      title={`Les cartes (${items.length})`}
      description={variant === 'projects' ? 'L’étoile choisit le projet phare, affiché en grand en premier.' : 'Glisse une carte pour changer sa place.'}
      actions={
        items.length < 24 && (
          <button type="button" onClick={add} disabled={adding} className={primaryButton}>
            <Plus size={17} aria-hidden="true" />
            {adding ? 'Création…' : NOUN[variant].add}
          </button>
        )
      }
    >
      {items.length === 0 && <p className="rounded-xl bg-paper px-4 py-3 text-sm text-ink-muted">Pas encore de carte.</p>}

      <SortableList items={items} onReorder={setItems} name={(card) => cardName(card, variant)} className="-mx-2 flex flex-col">
        {(card, handle, dragging) => {
          const name = cardName(card, variant)
          const image = card.image ? media[card.image] : undefined
          return (
            <div
              className={cn(
                'row-hover flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-xl border-t border-line-soft px-2 py-2 sm:px-3',
                dragging && 'rounded-xl border border-ocre bg-[#FFFDF8] shadow-[0_18px_36px_-18px_rgb(11_14_46/0.4)]',
              )}
            >
              <DragHandle handle={handle} label={`Déplacer ${name}`} />
              <span aria-hidden="true" className="relative flex h-12 w-[72px] flex-none items-center justify-center overflow-hidden rounded-lg bg-night-card text-[#5D6299]">
                {image ? (
                  <Image src={mediaSrc(image)} alt="" fill sizes="72px" className="object-cover" />
                ) : card.icon ? (
                  <Icon name={card.icon} />
                ) : null}
              </span>
              <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-1.5">
                <span className={cn('text-[15px] font-semibold', !card.visible && 'text-ink-muted')}>{name}</span>
                <span className="flex flex-wrap gap-1.5">
                  {card.status && (
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_CHIP[card.status])}>{STATUSES[card.status].fr}</span>
                  )}
                  {!card.visible && <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink-muted">Masquée</span>}
                  {!publishedIds.includes(card.id) && (
                    <span className="rounded-full border border-dashed border-ocre-dot px-2.5 py-0.5 text-xs font-semibold text-ocre-deep">
                      Brouillon, pas encore en ligne
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-none items-center gap-1">
                {variant === 'projects' && (
                  <button
                    type="button"
                    aria-pressed={card.featured}
                    aria-label={card.featured ? `${name} est le projet phare` : `Choisir ${name} comme projet phare`}
                    onClick={() => setFeatured(card)}
                    className={cn('flex size-10 items-center justify-center rounded-[10px]', card.featured ? 'text-ocre-dot' : 'text-ink-faint')}
                  >
                    <Star size={20} fill={card.featured ? 'var(--color-ocre)' : 'none'} aria-hidden="true" />
                  </button>
                )}
                <span className="mx-1.5">
                  <Switch
                    checked={card.visible}
                    label={`Afficher ${name} sur le site`}
                    onChange={(visible) => setItems(items.map((item) => (item.id === card.id ? { ...item, visible } : item)))}
                  />
                </span>
                <GuardedLink
                  href={`/admin/sections/${section.id}/${card.id}`}
                  aria-label={`Modifier ${name}`}
                  className="flex size-10 items-center justify-center rounded-[10px] border border-line-strong"
                >
                  <Pencil size={16} aria-hidden="true" />
                </GuardedLink>
                <button
                  type="button"
                  aria-label={`Supprimer ${name}`}
                  onClick={() => setRemoving(card)}
                  className="flex size-10 items-center justify-center rounded-[10px] text-ink-muted hover:text-danger"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          )
        }}
      </SortableList>

      <ConfirmDialog
        open={removing !== null}
        title={removing ? `Supprimer « ${cardName(removing, variant)} » ?` : 'Supprimer ?'}
        confirmLabel="Supprimer"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) setItems(items.filter((item) => item.id !== removing.id))
          setRemoving(null)
        }}
      >
        La carte disparaît du brouillon. Elle reste sur le site en ligne jusqu’à la prochaine publication.
      </ConfirmDialog>
    </Panel>
  )
}

/** Étiquettes : on tape, Entrée ajoute. La traduction anglaise se règle en dessous si besoin. */
function TagsField({ tags, onChange, errors, errorPrefix }: {
  tags: Card['tags']
  onChange: (tags: Card['tags']) => void
  errors: Record<string, string>
  errorPrefix: string
}) {
  const id = useId()
  const [draft, setDraft] = useState('')
  const [translate, setTranslate] = useState(false)

  const add = () => {
    const text = draft.trim()
    if (!text || tags.length >= 12) return
    onChange([...tags, { id: newId(), text: { fr: text, en: text } }])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold">
        Étiquettes
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-line-strong p-2">
        {tags.map((tag) => (
          <span key={tag.id} className="inline-flex items-center gap-1 rounded-lg bg-[#F1EEE6] py-1 pr-1 pl-2.5 text-[13px]">
            {tag.text.fr}
            <button
              type="button"
              aria-label={`Retirer ${tag.text.fr}`}
              onClick={() => onChange(tags.filter((t) => t.id !== tag.id))}
              className="flex size-7 items-center justify-center rounded-md text-ink-muted"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          maxLength={200}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          onBlur={add}
          placeholder={tags.length >= 12 ? '12 étiquettes au plus' : 'Ajouter, puis Entrée'}
          disabled={tags.length >= 12}
          className="min-h-9 flex-[1_1_160px] bg-transparent px-2 text-sm outline-none"
        />
      </div>
      {tags.length > 0 && (
        <button type="button" onClick={() => setTranslate((v) => !v)} aria-expanded={translate} className="self-start text-[13px] font-semibold text-indigo">
          {translate ? 'Masquer la traduction' : 'Traduire les étiquettes en anglais'}
        </button>
      )}
      {translate && (
        <div className="rounded-2xl bg-paper p-4">
          <I18nFields
            errors={errors}
            rows={tags.map((tag, index) => ({
              key: tag.id,
              label: `Étiquette ${index + 1}`,
              value: tag.text,
              onChange: (text) => onChange(tags.with(index, { ...tag, text })),
              errorPath: `${errorPrefix}.${index}.text`,
              maxLength: 200,
            }))}
          />
        </div>
      )}
    </div>
  )
}

/** Page d'une carte (design/ProjectEdit.dc.html) : textes, infos, image, aperçu de la carte seule. */
export function CardEditor({ content, section: initial, itemId, hash, media }: {
  content: Content
  section: CardsSection
  itemId: string
  hash: string
  media: Published['media']
}) {
  const router = useRouter()
  const draft = useSectionDraft(initial, hash)
  const { section, update, errors } = draft
  const { variant, items } = section.data
  const index = items.findIndex((item) => item.id === itemId)
  const card = items[index]
  const [removing, setRemoving] = useState(false)
  const [leaving, startLeaving] = useTransition()

  const preview = useMemo(
    () => ({ ...content, sections: content.sections.map((s) => (s.id === section.id ? section : s)) }),
    [content, section],
  )

  if (!card) {
    return (
      <main className="p-4 sm:p-8">
        <Panel title="Cette carte n’existe plus" description="Elle a peut-être été supprimée dans un autre onglet.">
          <GuardedLink href={`/admin/sections/${section.id}`} className={cn(primaryButton, 'self-start')}>
            Retour à la liste
          </GuardedLink>
        </Panel>
      </main>
    )
  }

  const change = (next: Partial<Card>) =>
    update((current) => ({
      ...current,
      data: { ...current.data, items: current.data.items.map((item) => (item.id === itemId ? { ...item, ...next } : item)) },
    }))
  const path = `data.items.${index}`
  const featuredOther = variant === 'projects' ? items.find((item) => item.featured && item.id !== itemId) : undefined

  const remove = () =>
    startLeaving(async () => {
      update((current) => ({ ...current, data: { ...current.data, items: current.data.items.filter((item) => item.id !== itemId) } }))
      if (await draft.save()) router.push(`/admin/sections/${section.id}`)
    })

  return (
    <main className="flex flex-wrap items-start gap-6 p-4 sm:p-8">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        <Panel title="Textes">
          <I18nFields
            errors={errors}
            rows={[
              ...(variant === 'pictures'
                ? [{ key: 'kicker', label: 'Petit libellé', hint: 'Au-dessus du titre, par exemple « eFootball ».', value: card.kicker, onChange: (kicker: Card['kicker']) => change({ kicker }), errorPath: `${path}.kicker`, maxLength: 200 }]
                : []),
              { key: 'title', label: variant === 'projects' ? 'Nom du projet' : 'Titre', value: card.title, onChange: (title) => change({ title }), errorPath: `${path}.title`, maxLength: 200 },
              {
                key: 'text',
                label: 'Description',
                value: card.text,
                onChange: (text) => change({ text }),
                errorPath: `${path}.text`,
                multiline: true,
                rows: 5,
                maxLength: 2000,
                softLimit: { length: 220, note: 'Au-delà de 220, la carte devient trop haute.' },
              },
            ]}
          />
        </Panel>

        <Panel title="Infos">
          <SwitchField label="Visible sur le site" checked={card.visible} onChange={(visible) => change({ visible })} />
          {variant === 'projects' && (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Statut"
                value={card.status ?? 'none'}
                onChange={(status) => change({ status: status === 'none' ? null : (status as ProjectStatus) })}
                options={[...STATUS_KEYS.map((key) => ({ value: key, label: STATUSES[key].fr })), { value: 'none', label: 'Aucun statut' }]}
                hint="Les statuts sont déjà traduits en anglais."
              />
              <div className="flex flex-col gap-2">
                <SwitchField
                  label="Projet phare"
                  checked={card.featured}
                  onChange={(featured) =>
                    update((current) => ({
                      ...current,
                      data: {
                        ...current.data,
                        items: current.data.items.map((item) => ({ ...item, featured: item.id === itemId ? featured : featured ? false : item.featured })),
                      },
                    }))
                  }
                />
                <span className="text-[13px] text-ink-muted">
                  {card.featured
                    ? 'Affiché en grand, en premier.'
                    : featuredOther
                      ? `${cardName(featuredOther, variant)} est le projet phare en ce moment.`
                      : 'Aucun projet phare pour l’instant.'}
                </span>
              </div>
              <TextField
                label="Lien du site"
                type="url"
                value={card.siteUrl}
                onChange={(siteUrl) => change({ siteUrl: siteUrl.trim() })}
                placeholder="https://"
                maxLength={500}
                error={errors[`${path}.siteUrl`]}
              />
              <TextField
                label="Lien du code source"
                type="url"
                value={card.codeUrl}
                onChange={(codeUrl) => change({ codeUrl: codeUrl.trim() })}
                placeholder="https://github.com/Guyroro43/"
                maxLength={500}
                error={errors[`${path}.codeUrl`]}
              />
            </div>
          )}
          {variant !== 'pictures' && (
            <TagsField tags={card.tags} onChange={(tags) => change({ tags })} errors={errors} errorPrefix={`${path}.tags`} />
          )}
          {!(variant === 'projects' && card.featured) && (
            <IconField label="Icône" value={card.icon} onChange={(icon) => change({ icon })} allowNone />
          )}
        </Panel>

        {variant !== 'tags' && (
          <Panel title={variant === 'projects' ? 'Capture' : 'Image'}>
            <PhotoField
              label={variant === 'projects' ? 'Capture du projet' : 'Image de la carte'}
              value={card.image}
              onChange={(image) => change({ image })}
              media={media}
            />
          </Panel>
        )}

        <SaveBar
          status={draft.status}
          savedAt={draft.savedAt}
          message={draft.message}
          onSave={draft.save}
          start={
            <div className="flex flex-wrap gap-1">
              <GuardedLink href={`/admin/sections/${section.id}`} className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] px-3 text-sm font-semibold">
                <ArrowLeft size={17} aria-hidden="true" />
                Retour à la liste
              </GuardedLink>
              <button
                type="button"
                onClick={() => setRemoving(true)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-danger"
              >
                <Trash2 size={17} aria-hidden="true" />
                Supprimer
              </button>
            </div>
          }
        />
        <ConfirmDialog
          open={removing}
          title={`Supprimer « ${cardName(card, variant)} » ?`}
          confirmLabel="Supprimer"
          busy={leaving}
          onClose={() => setRemoving(false)}
          onConfirm={remove}
        >
          La carte disparaît du brouillon. Elle reste sur le site en ligne jusqu’à la prochaine publication.
        </ConfirmDialog>
      </div>

      <div className="min-w-0 flex-[1_1_340px] lg:sticky lg:top-6">
        <PreviewPane content={preview} focus={{ sectionId: section.id, itemId }} />
      </div>
    </main>
  )
}

/** Page d'une section de cartes : réglages, liste, aperçu de toute la section. */
export function CardsSectionEditor({ content, section: initial, hash, media, publishedIds, deleteButton }: {
  content: Content
  section: CardsSection
  hash: string
  media: Published['media']
  publishedIds: string[]
  deleteButton: React.ReactNode
}) {
  const draft = useSectionDraft(initial, hash)
  const { section, update, errors } = draft
  const preview = useMemo(
    () => ({ ...content, sections: content.sections.map((s) => (s.id === section.id ? section : s)) }),
    [content, section],
  )

  return (
    <main className="flex flex-wrap items-start gap-6 p-4 sm:p-8">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        <SectionSettings section={section} update={update} errors={errors} />
        <CardsList
          section={section}
          setItems={(items) => update((current) => ({ ...current, data: { ...current.data, items } }))}
          save={draft.save}
          publishedIds={publishedIds}
          media={media}
        />
        <SaveBar status={draft.status} savedAt={draft.savedAt} message={draft.message} onSave={draft.save} start={deleteButton} />
      </div>
      <div className="min-w-0 flex-[1_1_380px] lg:sticky lg:top-6">
        <PreviewPane content={preview} focus={{ sectionId: section.id }} />
      </div>
    </main>
  )
}

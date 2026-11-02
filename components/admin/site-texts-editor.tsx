'use client'

import { saveSiteTexts } from '@/app/admin/draft-actions'
import { siteSchema, type Content } from '@/lib/content/schema'
import { I18nFields, Panel } from './fields'
import { SaveBar } from './save-bar'
import { useDraftPart } from './use-draft-part'

type Site = Content['site']

const options = { schema: siteSchema, save: saveSiteTexts }

/** Textes du site hors sections : onglet et Google, bouton du menu, pied de page. */
export function SiteTextsEditor({ site: initial, hash }: { site: Site; hash: string }) {
  const draft = useDraftPart(initial, hash, options)
  const site = draft.value
  const set = (change: (site: Site) => Site) => draft.update(change)

  return (
    <main className="flex max-w-[1100px] flex-col gap-5 p-4 sm:p-8">
      <Panel title="Google et les partages" description="Ce qui s’affiche dans l’onglet du navigateur, dans les résultats de recherche et quand on partage ton lien.">
        <I18nFields
          errors={draft.errors}
          rows={[
            {
              key: 'title',
              label: 'Titre',
              value: site.meta.title,
              onChange: (title) => set((s) => ({ ...s, meta: { ...s.meta, title } })),
              errorPath: 'meta.title',
              maxLength: 200,
              softLimit: { length: 60, note: 'Google coupe souvent au-delà de 60 caractères.' },
            },
            {
              key: 'description',
              label: 'Description',
              value: site.meta.description,
              onChange: (description) => set((s) => ({ ...s, meta: { ...s.meta, description } })),
              errorPath: 'meta.description',
              multiline: true,
              rows: 3,
              maxLength: 300,
              softLimit: { length: 160, note: 'Google coupe souvent au-delà de 160 caractères.' },
            },
          ]}
        />
      </Panel>

      <Panel title="Menu et pied de page">
        <I18nFields
          errors={draft.errors}
          rows={[
            {
              key: 'contact',
              label: 'Bouton du menu',
              hint: 'En haut à droite, il mène à la section Contact.',
              value: site.contactButton,
              onChange: (contactButton) => set((s) => ({ ...s, contactButton })),
              errorPath: 'contactButton',
              maxLength: 200,
            },
            {
              key: 'left',
              label: 'Pied de page, à gauche',
              value: site.footer.left,
              onChange: (left) => set((s) => ({ ...s, footer: { ...s.footer, left } })),
              errorPath: 'footer.left',
              maxLength: 200,
            },
            {
              key: 'right',
              label: 'Pied de page, à droite',
              value: site.footer.right,
              onChange: (right) => set((s) => ({ ...s, footer: { ...s.footer, right } })),
              errorPath: 'footer.right',
              maxLength: 200,
            },
          ]}
        />
      </Panel>

      <SaveBar status={draft.status} savedAt={draft.savedAt} message={draft.message} onSave={draft.save} />
    </main>
  )
}

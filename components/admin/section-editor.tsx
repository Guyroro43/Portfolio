'use client'

import { useMemo } from 'react'
import type { Content, Section } from '@/lib/content/schema'
import { Panel } from './fields'
import { PreviewPane } from './preview-pane'
import { SaveBar } from './save-bar'
import { SectionSettings } from './section-settings'
import { useSectionDraft } from './use-section-draft'

/** Page d'une section : réglages, contenu, aperçu en direct, enregistrement automatique. */
export function SectionEditor({ content, section: initial, hash }: { content: Content; section: Section; hash: string }) {
  const { section, update, save, status, errors, message, savedAt } = useSectionDraft(initial, hash)

  // Le reste du brouillon tel qu'il était à l'ouverture, avec la section en cours de frappe.
  const preview = useMemo(
    () => ({ ...content, sections: content.sections.map((s) => (s.id === section.id ? section : s)) }),
    [content, section],
  )

  return (
    <main className="flex flex-wrap items-start gap-6 p-4 sm:p-8">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        <SectionSettings section={section} update={update} errors={errors} />
        <Panel title="Contenu" description="Les textes, cartes et photos de cette section se modifieront ici : c’est la prochaine partie de l’étape 6.">
          <span />
        </Panel>
        <SaveBar status={status} savedAt={savedAt} message={message} onSave={save} />
      </div>
      <div className="min-w-0 flex-[1_1_380px] lg:sticky lg:top-6">
        <PreviewPane content={preview} focus={{ sectionId: section.id }} />
      </div>
    </main>
  )
}

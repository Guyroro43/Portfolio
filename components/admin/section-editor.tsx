'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { deleteSection } from '@/app/admin/draft-actions'
import type { Content, Section } from '@/lib/content/schema'
import { t } from '@/lib/i18n'
import { ConfirmDialog } from './dialog'
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

  const deletable = section.type !== 'hero' && section.type !== 'marquee'

  return (
    <main className="flex flex-wrap items-start gap-6 p-4 sm:p-8">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        <SectionSettings section={section} update={update} errors={errors} />
        <Panel title="Contenu" description="Les textes, cartes et photos de cette section se modifieront ici : c’est la prochaine partie de l’étape 6.">
          <span />
        </Panel>
        <SaveBar
          status={status}
          savedAt={savedAt}
          message={message}
          onSave={save}
          start={deletable && <DeleteSection id={section.id} name={t(section.label, 'fr')} />}
        />
      </div>
      <div className="min-w-0 flex-[1_1_380px] lg:sticky lg:top-6">
        <PreviewPane content={preview} focus={{ sectionId: section.id }} />
      </div>
    </main>
  )
}

function DeleteSection({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const remove = () =>
    startTransition(async () => {
      const result = await deleteSection(id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      // Retour à la vue d'ensemble, puis rafraîchissement : la section disparaît aussi du menu.
      router.push('/admin')
      router.refresh()
    })

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-danger"
      >
        <Trash2 size={17} aria-hidden="true" />
        Supprimer cette section
      </button>
      <ConfirmDialog
        open={open}
        title={`Supprimer « ${name} » ?`}
        confirmLabel="Supprimer"
        busy={pending}
        error={error}
        onConfirm={remove}
        onClose={() => {
          setOpen(false)
          setError(null)
        }}
      >
        La section disparaît du brouillon. Elle reste sur le site en ligne jusqu’à la prochaine publication. Si tu
        préfères la garder pour plus tard, masque-la plutôt.
      </ConfirmDialog>
    </>
  )
}

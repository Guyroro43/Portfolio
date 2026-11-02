import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import { ChangesPanel, VersionsPanel } from '@/components/admin/publish-panels'
import { SectionsBoard } from '@/components/admin/sections-board'
import { TranslatePanel } from '@/components/admin/translate-panel'
import { getSiteContent, getVersions } from '@/lib/admin/content'
import { formatDate } from '@/lib/admin/format'
import { getMediaLibrary } from '@/lib/admin/media'
import { listToTranslate } from '@/lib/admin/translations'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/(ui)/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Vue d’ensemble' }

export default async function DashboardPage() {
  const [{ draft, publishedAt, changes }, versions, library] = await Promise.all([getSiteContent(), getVersions(), getMediaLibrary()])
  const toTranslate = listToTranslate(draft, library)
  // Par section (cartes comprises), pour le badge « N à traduire » de chaque ligne.
  const missing: Record<string, number> = {}
  for (const item of toTranslate) {
    const sectionId = item.href.startsWith('/admin/sections/') ? item.href.split('/')[3] : null
    if (sectionId) missing[sectionId] = (missing[sectionId] ?? 0) + item.count
  }

  return (
    <>
      <AdminHeader title="Vue d’ensemble" />
      <main className="grid items-start gap-6 p-4 sm:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionsBoard sections={draft.sections} missing={missing} />

        <div className="flex flex-col gap-4">
          <section aria-labelledby="titre-enligne" className="flex flex-col gap-2.5 rounded-[20px] border border-line bg-white p-[22px]">
            <h2 id="titre-enligne" className="flex items-center gap-2 text-[15px] font-semibold">
              <span aria-hidden="true" className="size-[9px] rounded-full bg-online" />
              Le site est en ligne
            </h2>
            <p className="text-[13px] text-ink-muted">Dernière publication : {formatDate(publishedAt)}</p>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-9 items-center gap-1.5 self-start text-[13px] font-semibold text-indigo"
            >
              Ouvrir le site
              <ExternalLink size={14} aria-hidden="true" />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </section>

          <ChangesPanel changes={changes} />
          <TranslatePanel items={toTranslate} />
          {versions.length > 1 && <VersionsPanel versions={versions} />}
        </div>
      </main>
    </>
  )
}

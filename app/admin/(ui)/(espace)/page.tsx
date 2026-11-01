import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { AdminHeader } from '@/components/admin/admin-header'
import { SectionsBoard } from '@/components/admin/sections-board'
import { getSiteContent, hasUnpublishedChanges } from '@/lib/admin/content'
import { cn } from '@/lib/content/view'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Vue d’ensemble' }

const card = 'rounded-[20px] border border-line bg-white'

export default async function DashboardPage() {
  const { draft, published, publishedAt } = await getSiteContent()
  const pending = hasUnpublishedChanges(draft, published)

  return (
    <>
      <AdminHeader title="Vue d’ensemble" />
      <main className="grid items-start gap-6 p-4 sm:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionsBoard sections={draft.sections} />

        <div className="flex flex-col gap-4">
          <section aria-labelledby="titre-enligne" className={cn(card, 'flex flex-col gap-2.5 p-[22px]')}>
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

          <section aria-labelledby="titre-brouillon" className={cn(card, 'flex flex-col gap-1.5 p-[22px]')}>
            <h2 id="titre-brouillon" className="text-[15px] font-semibold">
              Pas encore publié
            </h2>
            <p className="text-[13px] text-ink-muted">
              {pending
                ? 'Le brouillon contient des modifications qui ne sont pas encore sur le site.'
                : 'Rien : le site en ligne est identique au brouillon.'}
            </p>
          </section>
        </div>
      </main>
    </>
  )
}

/** « 29 octobre 2026, 9 h 12 », à l'heure d'Abidjan. */
function formatDate(iso: string): string {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Abidjan',
  }).formatToParts(new Date(iso))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('day')} ${part('month')} ${part('year')}, ${Number(part('hour'))} h ${part('minute')}`
}

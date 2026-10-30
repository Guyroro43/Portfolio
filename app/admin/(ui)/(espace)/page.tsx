import { ExternalLink, Pencil } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/admin-header'
import { getSiteContent, hasUnpublishedChanges } from '@/lib/admin/content'
import { sectionNavItems, sectionSummary } from '@/lib/admin/summary'
import { cn } from '@/lib/content/view'

// Lit la session : la page attend la vérification avant de s'afficher (voir app/admin/layout.tsx).
export const instant = false

export const metadata: Metadata = { title: 'Vue d’ensemble' }

const card = 'rounded-[20px] border border-line bg-white'

export default async function DashboardPage() {
  const { draft, published, publishedAt } = await getSiteContent()
  const items = sectionNavItems(draft.sections)
  const pending = hasUnpublishedChanges(draft, published)

  return (
    <>
      <AdminHeader title="Vue d’ensemble" />
      <main className="grid items-start gap-6 p-4 sm:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="titre-sections" className={cn(card, 'flex flex-col')}>
          <div className="flex flex-col gap-1.5 px-6 pt-6 pb-4">
            <h2 id="titre-sections" className="font-heading text-[22px] font-bold">
              Ton site, section par section
            </h2>
            <p className="max-w-[460px] text-sm text-ink-muted">Dans l’ordre de la page, de haut en bas.</p>
          </div>

          <ol className="flex flex-col px-3 pb-3">
            {draft.sections.map((section, index) => {
              const item = items[index]
              return (
                <li key={section.id} className="row-hover flex min-h-16 items-center gap-3.5 rounded-xl px-3 py-2">
                  <span className="w-7 flex-none text-[13px] font-semibold text-ocre-ink">{item.num}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-semibold">{item.name}</span>
                    <span className="text-[13px] text-ink-muted">{sectionSummary(section)}</span>
                  </div>
                  {!section.visible && (
                    <span className="flex-none rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink-muted">Masquée</span>
                  )}
                  <Link
                    href={`/admin/sections/${section.id}`}
                    className="inline-flex min-h-10 flex-none items-center gap-1.5 rounded-[10px] border border-line-strong px-3 text-[13px] font-semibold"
                  >
                    <Pencil size={15} aria-hidden="true" />
                    Modifier<span className="sr-only"> {item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </section>

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

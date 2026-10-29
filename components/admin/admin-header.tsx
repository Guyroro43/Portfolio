import { Eye, Upload } from 'lucide-react'
import { getSiteContent, hasUnpublishedChanges } from '@/lib/admin/content'
import { cn } from '@/lib/content/view'

/**
 * Barre du haut de chaque page de l'admin : titre, état de publication, Aperçu et Publier.
 * Aperçu et Publier restent inactifs jusqu'à l'étape de publication.
 */
export async function AdminHeader({ title }: { title: string }) {
  const { draft, published } = await getSiteContent()
  const pending = hasUnpublishedChanges(draft, published)

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-white px-4 py-3.5 sm:px-8">
      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-ink-muted">Espace admin</p>
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold',
            pending ? 'bg-ocre-tint text-ocre-deep' : 'bg-online-tint text-online-ink',
          )}
        >
          <span aria-hidden="true" className={cn('size-2 rounded-full', pending ? 'bg-ocre-dot' : 'bg-online')} />
          {pending ? 'Modifications pas encore publiées' : 'Tout est publié'}
        </span>
        <button
          type="button"
          disabled
          className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] border border-line-strong bg-white px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Eye size={17} aria-hidden="true" />
          Aperçu
        </button>
        <button
          type="button"
          disabled
          className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] bg-ocre px-[18px] text-sm font-semibold text-night disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={17} aria-hidden="true" />
          Publier
        </button>
      </div>
    </header>
  )
}

import { getSiteContent } from '@/lib/admin/content'
import { cn } from '@/lib/content/view'
import { PreviewButton, PublishButton } from './publish-controls'
import { GuardedLink } from './save-guard'

/** Barre du haut de chaque page de l'admin : titre, modifications pas encore publiées, Aperçu, Publier. */
export async function AdminHeader({ title, trail }: { title: string; trail?: { href: string; label: string }[] }) {
  const { changes } = await getSiteContent()
  const count = changes.length

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-white px-4 py-3.5 sm:px-8">
      <div className="flex flex-col gap-0.5">
        {trail ? (
          <nav aria-label="Fil d’Ariane" className="text-xs text-ink-muted">
            {trail.map((step) => (
              <span key={step.href}>
                <GuardedLink href={step.href} className="underline-offset-2 hover:underline">
                  {step.label}
                </GuardedLink>
                {' / '}
              </span>
            ))}
            <span aria-current="page">{title}</span>
          </nav>
        ) : (
          <p className="text-xs text-ink-muted">Espace admin</p>
        )}
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold',
            count ? 'bg-ocre-tint text-ocre-deep' : 'bg-online-tint text-online-ink',
          )}
        >
          <span aria-hidden="true" className={cn('size-2 rounded-full', count ? 'bg-ocre-dot' : 'bg-online')} />
          {count === 0
            ? 'Tout est publié'
            : `${count} modification${count > 1 ? 's' : ''} pas encore publiée${count > 1 ? 's' : ''}`}
        </span>
        <PreviewButton />
        <PublishButton count={count} />
      </div>
    </header>
  )
}

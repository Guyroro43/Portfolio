import { exitPreview } from '@/app/admin/publish-actions'

/** Bandeau du mode brouillon (bouton Aperçu de l'admin). Les visiteurs ne le voient jamais. */
export function DraftBanner() {
  return (
    <div
      role="region"
      aria-label="Aperçu du brouillon"
      className="fixed inset-x-3 bottom-3 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl bg-accent px-4 py-3 text-bg-dark shadow-[0_18px_40px_-16px_rgb(0_0_0/0.6)] md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
    >
      <p className="text-sm font-semibold">Aperçu du brouillon : les visiteurs voient encore la version publiée.</p>
      <form action={exitPreview}>
        <button type="submit" className="min-h-10 rounded-full bg-bg-dark px-4 text-sm font-semibold text-on-dark">
          Quitter l’aperçu
        </button>
      </form>
    </div>
  )
}

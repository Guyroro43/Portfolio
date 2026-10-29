import { cn } from '@/lib/content/view'

// Champs et bouton des pages de connexion (fond sombre), d'après design/Login.dc.html.

export const authInput =
  'min-h-12 w-full rounded-xl border border-white/18 bg-night px-3.5 text-[15px] text-cream outline-none transition-[border-color,box-shadow] focus-visible:border-ocre focus-visible:shadow-[0_0_0_3px_rgb(226_163_58/0.2)]'

export const authLabel = 'text-[13px] font-semibold text-side'

export function AuthError({ message }: { message: string | null }) {
  return (
    <p role="alert" className={cn('text-sm text-[#FFB4A8]', !message && 'hidden')}>
      {message}
    </p>
  )
}

export function AuthSubmit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1.5 flex min-h-[50px] items-center justify-center gap-2.5 rounded-xl bg-ocre text-[15px] font-semibold text-night disabled:cursor-wait disabled:opacity-70"
    >
      {children}
    </button>
  )
}

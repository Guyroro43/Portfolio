import { ArrowLeft } from 'lucide-react'
import { Adinkra } from '@/components/site/adinkra'

// Tirages fixes, même formule que la maquette : la grille est identique à chaque affichage.
const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

const COLUMNS = 20
const ROWS = 12
const CELLS = Array.from({ length: COLUMNS * ROWS }, (_, i) => ({
  d: `${(3 + seeded(i + 900) * 3).toFixed(2)}s`,
  dl: `${(seeded(i + 1200) * 7).toFixed(2)}s`,
}))

type Props = { title: string; lead: string; children: React.ReactNode }

/** Cadre des pages de connexion : fond sombre à symboles, carte centrée, retour au site. */
export function AuthShell({ title, lead, children }: Props) {
  return (
    <div className="on-dark relative flex min-h-dvh items-center justify-center overflow-hidden bg-night px-4 py-12 text-cream sm:px-6">
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-[repeat(20,96px)] [mask-image:radial-gradient(circle_at_center,transparent_22%,#000_70%)]"
      >
        {CELLS.map((cell, i) => (
          <div key={i} className="flex size-24 items-center justify-center border-r border-b border-white/4 text-ocre">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="login-cell size-[30px]"
              style={{ '--d': cell.d, '--dl': cell.dl } as React.CSSProperties}
            >
              <circle cx="24" cy="24" r="20" />
              <circle cx="24" cy="24" r="12.5" />
              <circle cx="24" cy="24" r="5" />
            </svg>
          </div>
        ))}
      </div>

      <main className="relative flex w-full max-w-[420px] flex-col gap-7 rounded-[28px] border border-white/12 bg-night-card p-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] sm:p-10">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <Adinkra symbol="adinkrahene" className="size-12 text-ocre" />
          <h1 className="font-heading text-[30px] font-extrabold">
            <span translate="no">
              ANASSE<span className="text-ocre">.</span>
            </span>{' '}
            {title}
          </h1>
          <p className="text-sm text-side-muted">{lead}</p>
        </div>

        {children}

        <a href="/" className="inline-flex min-h-11 items-center gap-2 self-center text-[13px] text-side-muted">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour au site
        </a>
      </main>
    </div>
  )
}

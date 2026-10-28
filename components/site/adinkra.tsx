import type { AdinkraSymbol } from '@/lib/content/constants'

// Symboles Adinkra en SVG, versions simplifiées des maquettes. Trait en currentColor.

type Props = { symbol: AdinkraSymbol; className?: string; strokeWidth?: number }

export function Adinkra({ symbol, className, strokeWidth = 2.6 }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {SHAPES[symbol]}
    </svg>
  )
}

const SHAPES: Record<AdinkraSymbol, React.ReactNode> = {
  adinkrahene: (
    <>
      <circle cx="24" cy="24" r="20" />
      <circle cx="24" cy="24" r="12.5" />
      <circle cx="24" cy="24" r="5" />
    </>
  ),
  dwennimmen: (
    <>
      <path d="M24 24 C 18 20 8 18 8 11 C 8 6 15 6 15 11 C 15 14 12 14 12 12" />
      <path d="M24 24 C 30 20 40 18 40 11 C 40 6 33 6 33 11 C 33 14 36 14 36 12" />
      <path d="M24 24 C 18 28 8 30 8 37 C 8 42 15 42 15 37 C 15 34 12 34 12 36" />
      <path d="M24 24 C 30 28 40 30 40 37 C 40 42 33 42 33 37 C 33 34 36 34 36 36" />
    </>
  ),
  aya: (
    <>
      <path d="M24 4 V44" />
      <path d="M24 10 L15 16 M24 10 L33 16 M24 18 L12 25 M24 18 L36 25 M24 26 L12 33 M24 26 L36 33 M24 34 L15 40 M24 34 L33 40" />
    </>
  ),
  nkyinkyim: <path d="M16 4 L32 12 L16 20 L32 28 L16 36 L32 44" />,
  'mate-masie': (
    <>
      <circle cx="15" cy="15" r="7.5" />
      <circle cx="33" cy="15" r="7.5" />
      <circle cx="15" cy="33" r="7.5" />
      <circle cx="33" cy="33" r="7.5" />
      <rect x="20" y="20" width="8" height="8" rx="1" />
    </>
  ),
  sankofa: (
    <>
      <path d="M24 42 C 12 34 6 26 6 18 C 6 11 11 7 16 7 C 21 7 24 11 24 15 C 24 11 27 7 32 7 C 37 7 42 11 42 18 C 42 26 36 34 24 42 Z" />
      <path d="M24 15 C 22 21 16 21 16 17 C 16 13.5 20.5 13.5 20.5 16.5" />
      <path d="M24 15 C 26 21 32 21 32 17 C 32 13.5 27.5 13.5 27.5 16.5" />
    </>
  ),
  nkonsonkonson: (
    <>
      <rect x="8" y="5" width="18" height="24" rx="9" />
      <rect x="22" y="19" width="18" height="24" rx="9" />
    </>
  ),
}

/** Les 4 formes de la grille du haut de page. */
export const GRID_SHAPES = [
  <g key="0" strokeWidth="2.5">
    <circle cx="24" cy="24" r="20" />
    <circle cx="24" cy="24" r="12.5" />
    <circle cx="24" cy="24" r="5" />
  </g>,
  <polygon key="1" strokeWidth="2.5" points="24,4 28.5,18 42,14 32,24 42,34 28.5,30 24,44 19.5,30 6,34 16,24 6,14 19.5,18" />,
  <g key="2" strokeWidth="2.5">
    <rect x="7" y="7" width="34" height="34" />
    <rect x="16" y="16" width="16" height="16" />
    <path d="M7 7 L16 16 M41 7 L32 16 M7 41 L16 32 M41 41 L32 32" />
  </g>,
  <path key="3" strokeWidth="3" strokeLinecap="round" d="M16 4 L32 12 L16 20 L32 28 L16 36 L32 44" />,
]

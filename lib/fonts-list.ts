// Polices proposées dans l'admin. La clé sert dans le contenu, la valeur est le nom affiché.
// Les fichiers de police sont déclarés dans lib/fonts.ts.

export const HEADING_FONTS = {
  'bricolage-grotesque': 'Bricolage Grotesque',
  sora: 'Sora',
  'space-grotesk': 'Space Grotesk',
  fraunces: 'Fraunces',
  syne: 'Syne',
  outfit: 'Outfit',
  unbounded: 'Unbounded',
  archivo: 'Archivo',
} as const

export const BODY_FONTS = {
  inter: 'Inter',
  'dm-sans': 'DM Sans',
  manrope: 'Manrope',
  'work-sans': 'Work Sans',
  'plus-jakarta-sans': 'Plus Jakarta Sans',
  figtree: 'Figtree',
  'ibm-plex-sans': 'IBM Plex Sans',
  'source-sans-3': 'Source Sans 3',
} as const

export type HeadingFont = keyof typeof HEADING_FONTS
export type BodyFont = keyof typeof BODY_FONTS

export const HEADING_FONT_KEYS = Object.keys(HEADING_FONTS) as [HeadingFont, ...HeadingFont[]]
export const BODY_FONT_KEYS = Object.keys(BODY_FONTS) as [BodyFont, ...BodyFont[]]

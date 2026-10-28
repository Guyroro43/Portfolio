import {
  Archivo,
  Bricolage_Grotesque,
  DM_Sans,
  Figtree,
  Fraunces,
  IBM_Plex_Sans,
  Inter,
  Manrope,
  Outfit,
  Plus_Jakarta_Sans,
  Sora,
  Source_Sans_3,
  Space_Grotesk,
  Syne,
  Unbounded,
  Work_Sans,
} from 'next/font/google'
import type { BodyFont, HeadingFont } from './fonts-list'

// Toutes les polices sont hébergées sur le site par next/font. Aucune n'est préchargée :
// le navigateur ne télécharge que les deux polices actives, celles que la page utilise.
// Chaque police expose une variable CSS --font-<clé>, reprise par le thème (lib/theme.ts).
// next/font exige des options écrites en toutes lettres à chaque appel.

const bricolageGrotesque = Bricolage_Grotesque({ subsets: ['latin', 'latin-ext'], axes: ['opsz'], display: 'swap', preload: false, variable: '--font-bricolage-grotesque' })
const sora = Sora({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-sora' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-space-grotesk' })
const fraunces = Fraunces({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-fraunces' })
const syne = Syne({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-syne' })
const outfit = Outfit({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-outfit' })
const unbounded = Unbounded({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-unbounded' })
const archivo = Archivo({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-archivo' })

const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-inter' })
const dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-dm-sans' })
const manrope = Manrope({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-manrope' })
const workSans = Work_Sans({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-work-sans' })
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-plus-jakarta-sans' })
const figtree = Figtree({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-figtree' })
const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-ibm-plex-sans' })
const sourceSans3 = Source_Sans_3({ subsets: ['latin', 'latin-ext'], display: 'swap', preload: false, variable: '--font-source-sans-3' })

const headingFonts: Record<HeadingFont, { variable: string }> = {
  'bricolage-grotesque': bricolageGrotesque,
  sora,
  'space-grotesk': spaceGrotesk,
  fraunces,
  syne,
  outfit,
  unbounded,
  archivo,
}

const bodyFonts: Record<BodyFont, { variable: string }> = {
  inter,
  'dm-sans': dmSans,
  manrope,
  'work-sans': workSans,
  'plus-jakarta-sans': plusJakartaSans,
  figtree,
  'ibm-plex-sans': ibmPlexSans,
  'source-sans-3': sourceSans3,
}

/** Classes à poser sur <html> pour rendre les deux polices du thème disponibles. */
export function fontClassNames(fonts: { heading: HeadingFont; body: BodyFont }): string {
  return `${headingFonts[fonts.heading].variable} ${bodyFonts[fonts.body].variable}`
}

/** Toutes les polices, pour l'écran Apparence de l'admin. */
export const allFontClassNames = [...Object.values(headingFonts), ...Object.values(bodyFonts)]
  .map((font) => font.variable)
  .join(' ')

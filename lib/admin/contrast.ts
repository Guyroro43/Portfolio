import type { Theme } from '@/lib/content/schema'

// Contraste des couleurs du thème, formule WCAG 2 (plan-v2.md, section 7).

type Rgb = [number, number, number]

const HEX = /^#[0-9a-fA-F]{6}$/

function toRgb(hex: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as Rgb
}

const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map(linear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Rapport de contraste, de 1 à 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

// Mélange dans l'espace oklab, comme color-mix(in oklab, ...) dans app/globals.css.
function toOklab([r, g, b]: Rgb): Rgb {
  const [lr, lg, lb] = [r, g, b].map(linear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function fromOklab([L, a, b]: Rgb): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return `#${rgb.map((c) => Math.round(Math.min(1, Math.max(0, gamma(c))) * 255).toString(16).padStart(2, '0')).join('')}`
}

/** color-mix(in oklab, a share%, b). */
export function mixOklab(a: string, b: string, share: number): string {
  const [x, y] = [toOklab(toRgb(a)), toOklab(toRgb(b))]
  return fromOklab(x.map((v, i) => v * share + y[i] * (1 - share)) as Rgb)
}

export type ColorKey = keyof Theme['colors']

export type ContrastCheck = {
  label: string
  /** Les couleurs du thème en jeu : la pastille de chacune signale le problème. */
  colors: ColorKey[]
  ratio: number
  ok: boolean
}

export const MIN_CONTRAST = 4.5

/** Les paires texte et fond du site, avec leur rapport de contraste. */
export function checkContrast(colors: Theme['colors']): ContrastCheck[] {
  if (!Object.values(colors).every((value) => HEX.test(value))) return []
  // Ocre foncé des surtitres sur fond clair : --color-accent-ink dans app/globals.css.
  const accentInk = mixOklab(colors.accent, '#000000', 0.67)
  const pairs: [string, ColorKey[], string, string][] = [
    ['Texte principal sur fond clair', ['text', 'bgLight'], colors.text, colors.bgLight],
    ['Texte secondaire sur fond clair', ['textMuted', 'bgLight'], colors.textMuted, colors.bgLight],
    ['Textes clairs sur fond sombre', ['bgLight', 'bgDark'], colors.bgLight, colors.bgDark],
    ['Textes clairs sur fond indigo', ['bgLight', 'bgIndigo'], colors.bgLight, colors.bgIndigo],
    ['Texte des boutons ocre', ['bgDark', 'accent'], colors.bgDark, colors.accent],
    ['Accent sur fond sombre (surtitres, symboles)', ['accent', 'bgDark'], colors.accent, colors.bgDark],
    ['Accent sur fond indigo', ['accent', 'bgIndigo'], colors.accent, colors.bgIndigo],
    ['Surtitres foncés sur fond clair (calculés depuis l’accent)', ['accent', 'bgLight'], accentInk, colors.bgLight],
  ]
  return pairs.map(([label, keys, fg, bg]) => {
    const ratio = contrastRatio(fg, bg)
    return { label, colors: keys, ratio, ok: ratio >= MIN_CONTRAST }
  })
}

/** « 2,4 pour 1 » */
export const formatRatio = (ratio: number) => `${ratio.toFixed(1).replace('.', ',')} pour 1`

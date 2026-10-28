import type { Tone } from '@/lib/content/constants'

// Couleurs d'une section selon son fond. Les sections sombres et indigo partagent la même palette de texte.

export const TONE_BG: Record<Tone, string> = {
  dark: 'bg-bg-dark',
  indigo: 'bg-bg-indigo',
  light: 'bg-bg-light',
  'light-alt': 'bg-bg-light-alt',
}

export function isDarkTone(tone: Tone): boolean {
  return tone === 'dark' || tone === 'indigo'
}

export function palette(tone: Tone) {
  return isDarkTone(tone)
    ? {
        text: 'text-on-dark',
        soft: 'text-on-dark-muted',
        muted: 'text-on-dark-muted',
        faint: 'text-on-dark-faint',
        eyebrow: 'text-accent',
        border: 'border-white/10',
        surface: 'border-white/12 bg-white/5',
      }
    : {
        text: 'text-ink',
        soft: 'text-ink-soft',
        muted: 'text-ink-muted',
        faint: 'text-ink-label',
        eyebrow: 'text-accent-ink',
        border: 'border-line',
        surface: 'border-line bg-white',
      }
}

import type { Section } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { ADINKRA } from '@/lib/content/constants'
import { t, type Locale } from '@/lib/i18n'
import { Adinkra } from './adinkra'
import { palette, TONE_BG } from './tone'

export type SectionPlacement = {
  /** Même fond que la section précédente : l'espace entre les deux est réduit. */
  joined: boolean
  /** Dernière section : le pied de page suit directement. */
  last: boolean
  number: string
}

type ShellProps = SectionPlacement & {
  section: Section
  className?: string
  innerClassName?: string
  children: React.ReactNode
}

/** Cadre commun des sections : fond, marges, ancre du menu. */
export function SectionShell({ section, joined, last, className, innerClassName, children }: ShellProps) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-titre`}
      className={cn(
        'relative scroll-mt-[68px]',
        TONE_BG[section.tone],
        palette(section.tone).text,
        joined ? 'pt-2 md:pt-4' : 'pt-[72px] md:pt-[120px]',
        last ? 'pb-14 md:pb-[72px]' : 'pb-[72px] md:pb-[120px]',
        className,
      )}
    >
      <div className={cn('relative mx-auto max-w-[1200px] px-6 md:px-8', innerClassName)}>{children}</div>
    </section>
  )
}

export function Eyebrow({ section, number, lang }: { section: Section; number: string; lang: Locale }) {
  const label = t(section.label, lang)
  return (
    <p className={cn('text-[13px] font-semibold tracking-[0.04em] md:text-sm', palette(section.tone).eyebrow)}>
      {number ? `${number} · ${label}` : label}
    </p>
  )
}

export function SectionTitle({ section, lang, className }: { section: Section; lang: Locale; className?: string }) {
  return (
    <h2
      id={`${section.id}-titre`}
      className={cn(
        'font-heading text-[36px] leading-[1.06] font-bold tracking-[-0.02em] text-balance md:text-[46px] lg:text-[54px] lg:leading-[1.02]',
        className,
      )}
    >
      {t(section.title, lang)}
    </h2>
  )
}

/** Symbole de la section et sa signification. */
export function SymbolCaption({
  section,
  lang,
  size = 'md',
}: {
  section: Section
  lang: Locale
  size?: 'md' | 'lg'
}) {
  if (!section.symbol) return null
  const { name, meaning } = ADINKRA[section.symbol]
  const colors = palette(section.tone)
  return (
    <div className={cn('flex items-center gap-2.5 md:gap-3', colors.eyebrow)}>
      <Adinkra
        symbol={section.symbol}
        strokeWidth={size === 'lg' ? 3 : 2.6}
        className={size === 'lg' ? 'size-8 shrink-0 md:size-14' : 'size-8 shrink-0 md:size-11'}
      />
      <span className={cn('max-w-[200px] text-[13px] leading-[1.4]', colors.muted)}>
        {name}, {t(meaning, lang)}
      </span>
    </div>
  )
}

/** En-tête de section : surtitre, titre, phrase d'intro à gauche, symbole à droite. */
export function SectionHeading({ section, number, lang }: { section: Section; number: string; lang: Locale }) {
  const intro = t(section.intro, lang)
  return (
    <div
      data-reveal
      className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-6"
    >
      <div className="flex flex-col gap-3 md:gap-3.5">
        <Eyebrow section={section} number={number} lang={lang} />
        <SectionTitle section={section} lang={lang} />
        {intro && <p className={cn('text-base md:text-lg', palette(section.tone).muted)}>{intro}</p>}
      </div>
      <SymbolCaption section={section} lang={lang} />
    </div>
  )
}

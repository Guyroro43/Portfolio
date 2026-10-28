import type { SectionOf } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'
import { Eyebrow, SectionShell, SectionTitle, SymbolCaption, type SectionPlacement } from './section-shell'
import { TimelineProgress } from './timeline-progress'
import { isDarkTone, palette, TONE_BG } from './tone'

type Props = SectionPlacement & { section: SectionOf<'timeline'>; lang: Locale }

/**
 * Frise de dates. Sur ordinateur : titre et note collés à gauche pendant qu'on descend la liste.
 * Sur téléphone : titre, liste, puis la note.
 */
export function TimelineSection({ section, lang, ...placement }: Props) {
  const { steps, note } = section.data
  const colors = palette(section.tone)
  const dark = isDarkTone(section.tone)

  return (
    <SectionShell section={section} {...placement} innerClassName="flex flex-col gap-8 lg:flex-row lg:flex-wrap lg:gap-16">
      {/* « contents » sur téléphone : le titre et la note deviennent des éléments de la colonne, la note passe en dernier. */}
      <div className="contents lg:sticky lg:top-[110px] lg:block lg:flex-[1_1_340px] lg:self-start">
        <div data-reveal className="flex flex-col gap-3 lg:gap-[18px]">
          <Eyebrow section={section} number={placement.number} lang={lang} />
          <SectionTitle section={section} lang={lang} className="lg:text-[50px] lg:leading-[1.04]" />
          <div className="lg:mt-2">
            <SymbolCaption section={section} lang={lang} size="lg" />
          </div>
        </div>
        {note && (
          <p
            data-reveal
            className={cn(
              'order-last rounded-2xl border px-[18px] py-4 text-[15px] leading-[1.55] lg:order-none lg:mt-[30px] lg:px-5 lg:py-[18px]',
              colors.surface,
              dark ? 'text-on-dark-nav' : 'text-ink-soft',
            )}
          >
            <span className={cn('font-semibold', colors.eyebrow)}>{t(note.label, lang)}</span> {t(note.text, lang)}
          </p>
        )}
      </div>

      <ol className="relative flex min-w-0 flex-col gap-8 pl-[34px] md:gap-11 md:pl-10 lg:flex-[1_1_560px]">
        <span aria-hidden="true" className={cn('absolute top-2 bottom-2 left-1.5 w-0.5 md:left-[7px]', dark ? 'bg-white/12' : 'bg-line')} />
        <span aria-hidden="true" data-timeline-line className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-accent md:left-[7px]" />
        {steps.map((step, index) => {
          const current = index === steps.length - 1
          return (
            <li key={step.id} data-reveal-step className="relative flex flex-col gap-1 md:gap-1.5">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-0.5 -left-[34px] size-3.5 rounded-full border-2 border-accent md:-left-10 md:size-4',
                  current ? 'bg-accent shadow-[0_0_0_6px_color-mix(in_srgb,var(--c-accent)_20%,transparent)]' : TONE_BG[section.tone],
                )}
              />
              <p className={cn('text-xs font-semibold tracking-[0.04em] md:text-[13px]', colors.eyebrow)}>{t(step.date, lang)}</p>
              <h3 className="font-heading text-[21px] font-bold md:text-[26px]">{t(step.title, lang)}</h3>
              <p className={cn('text-[15px] leading-[1.55] md:text-base md:leading-[1.6]', colors.muted)}>{t(step.text, lang)}</p>
            </li>
          )
        })}
      </ol>
      <TimelineProgress sectionId={section.id} />
    </SectionShell>
  )
}

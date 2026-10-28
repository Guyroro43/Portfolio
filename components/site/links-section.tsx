import { ArrowUpRight, Briefcase, Code, Link as LinkIcon, Mail, type LucideIcon } from 'lucide-react'
import { ADINKRA } from '@/lib/content/constants'
import type { SectionOf } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'
import { ui } from '@/lib/ui-text'
import { Adinkra } from './adinkra'
import { CopyButton } from './copy-button'
import { Eyebrow, SectionShell, SectionTitle, type SectionPlacement } from './section-shell'
import { isDarkTone, palette } from './tone'

type Section = SectionOf<'links'>
type Props = SectionPlacement & { section: Section; lang: Locale }

// lucide n'a plus d'icônes de marques : GitHub et LinkedIn gardent celles de la maquette.
const KIND_ICON: Record<Section['data']['items'][number]['kind'], LucideIcon> = {
  email: Mail,
  github: Code,
  linkedin: Briefcase,
  link: LinkIcon,
}

/** Forme « Liens » : titre centré, puis une carte par lien. L'email a un bouton Copier. */
export function LinksSection({ section, lang, ...placement }: Props) {
  const colors = palette(section.tone)
  const dark = isDarkTone(section.tone)
  const intro = t(section.intro, lang)
  const card = cn('rounded-[20px] border md:rounded-[22px]', dark ? 'border-white/12 bg-white/5' : 'border-line bg-white')
  const tile = 'hidden size-[46px] flex-none items-center justify-center rounded-xl bg-accent/14 text-accent md:flex'

  return (
    <SectionShell section={section} {...placement} className="overflow-hidden" innerClassName="flex flex-col gap-6 md:gap-10">
      <div
        aria-hidden="true"
        className="a-aurora2 absolute -top-[220px] -left-[15px] size-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--c-accent)_22%,transparent)_0%,transparent_65%)] md:-top-[280px] md:left-1/2 md:-ml-[360px] md:size-[720px]"
      />

      <div data-reveal className="relative flex flex-col items-center gap-3.5 text-center md:gap-[18px]">
        {section.symbol && <Adinkra symbol={section.symbol} strokeWidth={2.4} className="size-11 text-accent md:size-[52px]" />}
        <Eyebrow section={section} number={placement.number} lang={lang} />
        <SectionTitle section={section} lang={lang} className="text-[44px] leading-[1.02] font-extrabold tracking-[-0.025em] md:text-[64px] lg:text-[76px] lg:leading-none" />
        {intro && <p className={cn('max-w-[520px] text-base md:text-lg', colors.muted)}>{intro}</p>}
        {section.symbol && (
          <p className={cn('text-xs', colors.faint)}>
            {ADINKRA[section.symbol].name}, {t(ADINKRA[section.symbol].meaning, lang)}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-2.5 md:grid md:grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] md:gap-4">
        {section.data.items.map((item, index) => {
          const KindIcon = KIND_ICON[item.kind]
          const label = t(item.label, lang)
          const delay = { '--delay': `${index * 0.08}s` } as React.CSSProperties

          if (item.kind === 'email') {
            const address = item.href.replace(/^mailto:/, '')
            return (
              <div
                key={item.id}
                data-reveal
                style={delay}
                className={cn('lift flex flex-col gap-2.5 p-5 md:grid md:grid-cols-[1fr_auto] md:gap-3.5 md:p-[26px]', card)}
              >
                <span className={cn(tile, 'md:col-start-1 md:row-start-1')}>
                  <KindIcon size={22} aria-hidden="true" />
                </span>
                <CopyButton
                  text={address}
                  labels={{ short: ui('copy', lang), long: ui('copyAddress', lang), done: ui('copied', lang) }}
                  className="order-last self-start md:order-none md:col-start-2 md:row-start-1 md:self-center"
                />
                <span className={cn('text-xs md:col-span-2 md:text-[13px]', colors.muted)}>{label}</span>
                <a href={item.href} className="text-[17px] font-semibold break-all md:col-span-2 md:text-lg">
                  {item.display}
                </a>
              </div>
            )
          }

          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              data-reveal
              style={delay}
              className={cn(
                'lift flex min-h-[72px] items-center justify-between gap-3 px-5 md:flex-col md:items-stretch md:justify-start md:gap-3.5 md:p-[26px]',
                card,
              )}
            >
              <span className="hidden items-center justify-between gap-3 md:flex">
                <span className={tile}>
                  <KindIcon size={22} aria-hidden="true" />
                </span>
                <ArrowUpRight size={20} aria-hidden="true" className={cn('arr', colors.muted)} />
              </span>
              <span className="flex flex-col gap-0.5 md:gap-3.5">
                <span className={cn('text-xs md:text-[13px]', colors.muted)}>{label}</span>
                <span className="text-base font-semibold md:text-lg">
                  {item.display}
                  <span className="sr-only"> ({ui('newTab', lang)})</span>
                </span>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" className={cn('md:hidden', colors.muted)} />
            </a>
          )
        })}
      </div>
    </SectionShell>
  )
}

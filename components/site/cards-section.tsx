import { ArrowRight, Code } from 'lucide-react'
import { STATUSES, type ProjectStatus } from '@/lib/content/constants'
import type { Published, SectionOf } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'
import { ui } from '@/lib/ui-text'
import { Adinkra } from './adinkra'
import { Icon } from './icon'
import { SectionHeading, SectionShell, type SectionPlacement } from './section-shell'
import { SiteImage } from './site-image'

type Section = SectionOf<'cards'>
type Card = Section['data']['items'][number]
type Props = SectionPlacement & { section: Section; media: Published['media']; lang: Locale }

/** Décalage de la cascade : les cartes d'une même rangée arrivent l'une après l'autre. */
const cascade = (index: number) => ({ '--delay': `${(index % 3) * 0.08}s` }) as React.CSSProperties

export function CardsSection({ section, media, lang, ...placement }: Props) {
  const { variant, items } = section.data
  const featured = variant === 'projects' ? items.find((item) => item.featured) : undefined
  const rest = items.filter((item) => item !== featured)

  return (
    <SectionShell section={section} {...placement} innerClassName="flex flex-col gap-[22px] md:gap-10">
      <SectionHeading section={section} number={placement.number} lang={lang} />

      {featured && <FeaturedProject item={featured} section={section} media={media} lang={lang} />}

      {rest.length > 0 && (
        <div
          className={cn(
            'grid gap-[22px] md:gap-5',
            variant === 'projects'
              ? 'md:grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]'
              : 'md:grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]',
          )}
        >
          {rest.map((item, index) => {
            if (variant === 'projects') return <ProjectCard key={item.id} item={item} index={index} media={media} lang={lang} />
            if (variant === 'tags') return <TagsCard key={item.id} item={item} index={index} lang={lang} />
            return <PictureCard key={item.id} item={item} index={index} media={media} lang={lang} />
          })}
        </div>
      )}
    </SectionShell>
  )
}

const STATUS_STYLE: Record<ProjectStatus, string> = {
  'in-progress': 'bg-status-progress-bg text-status-progress-fg',
  redesign: 'bg-status-redesign-bg text-indigo-bright',
  delivered: 'bg-status-delivered-bg text-status-delivered-fg',
  'for-sale': 'bg-chip text-ink-muted',
}

/** Libellé d'un lien externe, avec la mention « nouvel onglet » pour les lecteurs d'écran. */
function ExternalLabel({ label, lang }: { label: string; lang: Locale }) {
  return (
    <span className="whitespace-nowrap">
      {label}
      <span className="sr-only"> ({ui('newTab', lang)})</span>
    </span>
  )
}

function FeaturedProject({ item, section, media, lang }: { item: Card; section: Section; media: Published['media']; lang: Locale }) {
  const image = item.image ? media[item.image] : null
  return (
    <article
      data-reveal
      className="lift flex flex-col-reverse overflow-hidden rounded-[24px] bg-bg-indigo text-on-dark md:rounded-[28px] lg:flex-row lg:flex-wrap"
    >
      <div className="flex min-w-0 flex-col gap-4 p-6 md:gap-5 md:p-11 lg:flex-[1_1_440px]">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-bg-dark">{ui('featured', lang)}</span>
          {item.status && (
            <span className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-on-dark-nav">
              {STATUSES[item.status][lang]}
            </span>
          )}
        </div>
        <h3 className="font-heading text-[40px] leading-none font-extrabold tracking-[-0.02em] md:text-[58px]">
          {t(item.title, lang)}
        </h3>
        <p className="text-[15px] leading-[1.6] text-pretty text-on-dark-muted md:text-[17px] md:leading-[1.65]">
          {t(item.text, lang)}
        </p>
        {item.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 md:gap-2">
            {item.tags.map((tag) => (
              <li key={tag.id} className="rounded-lg bg-white/7 px-2.5 py-[5px] text-xs text-on-dark-nav md:px-3 md:py-1.5 md:text-[13px]">
                {t(tag.text, lang)}
              </li>
            ))}
          </ul>
        )}
        {(item.siteUrl || item.codeUrl) && (
          <div className="flex gap-2.5 md:mt-2 md:flex-wrap md:gap-3">
            {item.siteUrl && (
              <a
                href={item.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-full bg-accent px-4 md:px-[22px] text-sm font-semibold text-bg-dark md:flex-none md:text-[15px]"
              >
                <ExternalLabel label={ui('viewSite', lang)} lang={lang} />
                <ArrowRight size={18} aria-hidden="true" className="arr" />
              </a>
            )}
            {item.codeUrl && (
              <a
                href={item.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-full border border-white/24 px-4 md:px-[22px] text-sm font-semibold text-on-dark md:flex-none md:text-[15px]"
              >
                <Code size={18} aria-hidden="true" />
                <ExternalLabel label={ui('sourceCode', lang)} lang={lang} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Capture dans un cadre de navigateur. Sans capture : fond indigo et symbole de la section. */}
      <div className="flex min-w-0 items-end lg:flex-[1_1_480px] lg:px-11 lg:pt-11">
        <div className="w-full overflow-hidden lg:rounded-t-2xl lg:border lg:border-b-0 lg:border-white/12">
          <div aria-hidden="true" className="hidden gap-1.5 border-b border-white/8 bg-surface-bar px-3.5 py-3 lg:flex">
            <span className="size-[9px] rounded-full bg-white/25" />
            <span className="size-[9px] rounded-full bg-white/25" />
            <span className="size-[9px] rounded-full bg-white/25" />
          </div>
          <div className="relative aspect-[16/10] overflow-hidden bg-surface-shot">
            {image ? (
              <div className="zoom absolute inset-0">
                <SiteImage entry={image} lang={lang} sizes="(min-width: 1024px) 520px, 100vw" className="object-cover object-top" />
              </div>
            ) : (
              <div className="zoom flex size-full items-center justify-center text-placeholder">
                <Adinkra symbol={section.symbol ?? 'adinkrahene'} strokeWidth={1.4} className="size-24 md:size-32" />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function ProjectCard({ item, index, media, lang }: { item: Card; index: number; media: Published['media']; lang: Locale }) {
  const image = item.image ? media[item.image] : null
  return (
    <article
      data-reveal
      style={cascade(index)}
      className="lift flex flex-col gap-3 overflow-hidden rounded-[20px] border border-line bg-white p-[22px] text-ink md:gap-4 md:rounded-[24px] md:p-7"
    >
      {image && (
        <div className="relative -mx-[22px] -mt-[22px] mb-1 aspect-[16/10] overflow-hidden bg-surface-shot md:-mx-7 md:-mt-7">
          <div className="zoom absolute inset-0">
            <SiteImage entry={image} lang={lang} sizes="(min-width: 1200px) 380px, (min-width: 768px) 50vw, 100vw" className="object-cover object-top" />
          </div>
        </div>
      )}

      {/* Téléphone : titre et statut sur une ligne. Ordinateur : icône et statut, puis le titre. */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 md:gap-y-4">
        {item.icon && (
          <span className="col-start-1 row-start-1 hidden size-[46px] items-center justify-center rounded-xl bg-tile-indigo text-indigo-bright md:flex">
            <Icon name={item.icon} size={22} />
          </span>
        )}
        {item.status && (
          <span
            className={cn(
              'col-start-2 row-start-1 rounded-full px-[11px] py-[5px] text-xs font-semibold md:px-3 md:py-1.5',
              STATUS_STYLE[item.status],
            )}
          >
            {STATUSES[item.status][lang]}
          </span>
        )}
        <h3 className="col-start-1 row-start-1 font-heading text-[23px] font-bold md:col-span-2 md:row-start-2 md:text-[26px]">
          {t(item.title, lang)}
        </h3>
      </div>

      <p className="grow text-[15px] leading-[1.6] text-ink-muted">{t(item.text, lang)}</p>

      {item.tags.length > 0 && (
        <ul className="flex flex-wrap gap-x-1 text-xs text-ink-label md:gap-1.5 md:text-ink-muted">
          {item.tags.map((tag) => (
            <li
              key={tag.id}
              className="md:rounded-lg md:bg-chip md:px-2.5 md:py-[5px] [&+li]:before:mr-1 [&+li]:before:content-['·'] md:[&+li]:before:content-none"
            >
              {t(tag.text, lang)}
            </li>
          ))}
        </ul>
      )}

      {(item.siteUrl || item.codeUrl) && (
        <div className="flex flex-wrap gap-x-5">
          {item.siteUrl && (
            <a
              href={item.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-indigo-bright"
            >
              <ExternalLabel label={ui('viewSite', lang)} lang={lang} />
              <ArrowRight size={16} aria-hidden="true" className="arr" />
            </a>
          )}
          {item.codeUrl && (
            <a
              href={item.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-indigo-bright"
            >
              <Code size={16} aria-hidden="true" />
              <ExternalLabel label={ui('sourceCode', lang)} lang={lang} />
            </a>
          )}
        </div>
      )}
    </article>
  )
}

function TagsCard({ item, index, lang }: { item: Card; index: number; lang: Locale }) {
  return (
    <article
      data-reveal
      style={cascade(index)}
      className="lift flex flex-col gap-3.5 rounded-[20px] border border-line bg-white p-[22px] text-ink md:gap-[18px] md:rounded-[24px] md:p-7"
    >
      {item.icon && (
        <span
          className={cn(
            'hidden size-[46px] items-center justify-center rounded-xl md:flex',
            index % 2 === 0 ? 'bg-tile-warm text-accent-ink' : 'bg-tile-indigo text-indigo-bright',
          )}
        >
          <Icon name={item.icon} size={22} />
        </span>
      )}
      <h3 className="font-heading text-[21px] font-bold md:text-2xl">{t(item.title, lang)}</h3>
      {t(item.text, lang) && <p className="text-[15px] leading-[1.6] text-ink-muted">{t(item.text, lang)}</p>}
      <ul className="flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <li key={tag.id} className="rounded-[10px] bg-chip px-[11px] py-[7px] text-[13px] text-ink-soft md:px-3 md:py-2 md:text-sm">
            {t(tag.text, lang)}
          </li>
        ))}
      </ul>
    </article>
  )
}

function PictureCard({ item, index, media, lang }: { item: Card; index: number; media: Published['media']; lang: Locale }) {
  const image = item.image ? media[item.image] : null
  const kicker = t(item.kicker, lang)
  return (
    <article
      data-reveal
      style={cascade(index)}
      className="lift flex flex-col overflow-hidden rounded-[20px] border border-line bg-white text-ink md:rounded-[24px]"
    >
      <div className="relative h-[190px] overflow-hidden bg-bg-indigo md:aspect-[4/3] md:h-auto">
        {image ? (
          <div className="zoom absolute inset-0">
            <SiteImage entry={image} lang={lang} sizes="(min-width: 1200px) 380px, (min-width: 768px) 50vw, 100vw" />
          </div>
        ) : (
          <div className="zoom flex size-full items-center justify-center text-placeholder">
            {item.icon && <Icon name={item.icon} size={56} />}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5 md:gap-2.5 md:p-6">
        {kicker && (
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-accent-ink md:text-[13px]">
            {item.icon && <Icon name={item.icon} size={16} className="hidden md:block" />}
            {kicker}
          </p>
        )}
        <h3 className="font-heading text-[21px] font-bold md:text-2xl">{t(item.title, lang)}</h3>
        <p className="text-[15px] leading-[1.55] text-ink-muted md:leading-[1.6]">{t(item.text, lang)}</p>
      </div>
    </article>
  )
}

import type { Published, SectionOf } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'
import { Icon } from './icon'
import { SectionHeading, SectionShell, type SectionPlacement } from './section-shell'
import { SiteImage } from './site-image'
import { isDarkTone, palette } from './tone'

type Props = SectionPlacement & { section: SectionOf<'text'>; media: Published['media']; lang: Locale }

/** Forme « Texte et photo » : paragraphes à gauche, carte « En bref » ou photo à droite. */
export function TextSection({ section, media, lang, ...placement }: Props) {
  const { paragraphs, side } = section.data
  const colors = palette(section.tone)
  const sidePhoto = side?.kind === 'photo' ? media[side.photo] : null

  return (
    <SectionShell section={section} {...placement} innerClassName="flex flex-col gap-7 md:gap-12">
      <SectionHeading section={section} number={placement.number} lang={lang} />

      <div className="flex flex-col gap-7 md:flex-row md:flex-wrap md:items-start md:gap-12">
        <div
          data-reveal
          className={cn(
            'flex min-w-0 flex-col gap-4 text-base leading-[1.7] text-pretty md:flex-[1_1_520px] md:gap-5 md:text-lg',
            colors.soft,
          )}
        >
          {paragraphs.map((paragraph) => (
            <p key={paragraph.id}>{t(paragraph.text, lang)}</p>
          ))}
        </div>

        {side?.kind === 'card' && (
          <aside
            data-reveal
            aria-label={t(side.title, lang)}
            style={{ '--delay': '0.08s' } as React.CSSProperties}
            className={cn(
              'flex min-w-0 flex-col rounded-[20px] border p-[22px] md:flex-[1_1_380px] md:rounded-[24px] md:p-7',
              isDarkTone(section.tone) ? colors.surface : 'border-line bg-white text-ink',
            )}
          >
            <h3 className="mb-2 font-heading text-[19px] font-bold md:mb-2.5 md:text-xl">{t(side.title, lang)}</h3>
            {/* Un dl n'accepte qu'un niveau de div autour de dt et dd : l'icône vit donc dans le dt, placée en absolu. */}
            <dl>
              {side.rows.map((row) => (
                <div
                  key={row.id}
                  className="relative flex flex-col gap-0.5 border-t border-line-soft py-3 last:pb-0 md:py-3.5 md:pl-[52px]"
                >
                  <dt className="text-xs font-semibold text-ink-label md:text-[13px]">
                    <span className="absolute top-3.5 left-0 hidden size-[38px] items-center justify-center rounded-[10px] bg-tile-warm text-accent-ink md:flex">
                      <Icon name={row.icon} />
                    </span>
                    {t(row.label, lang)}
                  </dt>
                  <dd className="text-[15px] leading-[1.45] md:leading-normal">{t(row.value, lang)}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}

        {sidePhoto && (
          <figure
            data-reveal
            style={{ '--delay': '0.08s' } as React.CSSProperties}
            className="relative aspect-[4/5] min-w-0 overflow-hidden rounded-[20px] bg-surface-dark md:flex-[1_1_380px] md:rounded-[24px]"
          >
            <SiteImage entry={sidePhoto} lang={lang} sizes="(min-width: 768px) 420px, 100vw" />
          </figure>
        )}
      </div>
    </SectionShell>
  )
}

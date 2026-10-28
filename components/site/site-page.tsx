import type { Published } from '@/lib/content/schema'
import { cn, sectionNumbers } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'
import { ui } from '@/lib/ui-text'
import { CardsSection } from './cards-section'
import { GallerySection } from './gallery-section'
import { Hero } from './hero'
import { LinksSection } from './links-section'
import { Marquee } from './marquee'
import { SiteEffects } from './site-effects'
import { SiteHeader } from './site-header'
import { TextSection } from './text-section'
import { TimelineSection } from './timeline-section'
import { isDarkTone, palette, TONE_BG } from './tone'

/** La page publique, section par section, dans l'ordre du contenu. Utilisée aussi par l'aperçu de l'admin. */
export function SitePage({ content, lang }: { content: Published; lang: Locale }) {
  const sections = content.sections.filter((s) => s.visible)
  const numbers = sectionNumbers(sections)
  const lastTone = sections.at(-1)?.tone ?? 'dark'

  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-50 rounded-full bg-accent px-5 py-3 font-semibold text-bg-dark focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {ui('skipLink', lang)}
      </a>
      <div id="top" />
      <SiteHeader content={content} lang={lang} />

      <main id="contenu" tabIndex={-1}>
        {sections.map((section, index) => {
          const previous = sections[index - 1]
          const placement = {
            joined:
              previous !== undefined &&
              previous.type !== 'hero' &&
              previous.type !== 'marquee' &&
              previous.tone === section.tone,
            last: index === sections.length - 1,
            number: numbers.get(section.id) ?? '',
          }
          switch (section.type) {
            case 'hero':
              return (
                <Hero
                  key={section.id}
                  section={section}
                  media={content.media}
                  lang={lang}
                  nextSectionId={sections[index + 1]?.id ?? null}
                />
              )
            case 'marquee':
              return <Marquee key={section.id} section={section} lang={lang} />
            case 'text':
              return <TextSection key={section.id} section={section} media={content.media} lang={lang} {...placement} />
            case 'cards':
              return <CardsSection key={section.id} section={section} media={content.media} lang={lang} {...placement} />
            case 'timeline':
              return <TimelineSection key={section.id} section={section} lang={lang} {...placement} />
            case 'gallery':
              return <GallerySection key={section.id} section={section} media={content.media} lang={lang} {...placement} />
            case 'links':
              return <LinksSection key={section.id} section={section} lang={lang} {...placement} />
          }
        })}
      </main>

      <footer className={cn(TONE_BG[lastTone])}>
        <div className="mx-auto max-w-[1200px] px-6 md:px-8">
          <div
            className={cn(
              'flex flex-col gap-1.5 border-t pt-[22px] pb-8 text-[13px] md:flex-row md:flex-wrap md:justify-between md:gap-4 md:pt-7 md:pb-11 md:text-sm',
              palette(lastTone).border,
              isDarkTone(lastTone) ? 'text-on-dark-faint' : 'text-ink-label',
            )}
          >
            <p>{t(content.site.footer.left, lang)}</p>
            <p>{t(content.site.footer.right, lang)}</p>
          </div>
        </div>
      </footer>

      <SiteEffects />
    </>
  )
}

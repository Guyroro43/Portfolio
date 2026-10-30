import type { Published, Section } from '@/lib/content/schema'
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

/** La page publique, section par section, dans l'ordre du contenu. */
export function SitePage({ content, lang }: { content: Published; lang: Locale }) {
  const sections = content.sections.filter((s) => s.visible)
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
        {sections.map((section) => (
          <SectionView key={section.id} section={section} sections={sections} media={content.media} lang={lang} />
        ))}
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

type SectionViewProps = {
  section: Section
  /** Les sections visibles, dans l'ordre : elles donnent le numéro et le raccord avec la section d'avant. */
  sections: Section[]
  media: Published['media']
  lang: Locale
}

/** Une section, placée comme sur la page. Sert aussi à l'aperçu de l'admin, section par section. */
export function SectionView({ section, sections, media, lang }: SectionViewProps) {
  const index = sections.findIndex((s) => s.id === section.id)
  const previous = index > 0 ? sections[index - 1] : undefined
  const placement = {
    joined:
      previous !== undefined && previous.type !== 'hero' && previous.type !== 'marquee' && previous.tone === section.tone,
    last: index === sections.length - 1,
    number: sectionNumbers(sections).get(section.id) ?? '',
  }

  switch (section.type) {
    case 'hero':
      return <Hero section={section} media={media} lang={lang} nextSectionId={sections[index + 1]?.id ?? null} />
    case 'marquee':
      return <Marquee section={section} lang={lang} />
    case 'text':
      return <TextSection section={section} media={media} lang={lang} {...placement} />
    case 'cards':
      return <CardsSection section={section} media={media} lang={lang} {...placement} />
    case 'timeline':
      return <TimelineSection section={section} lang={lang} {...placement} />
    case 'gallery':
      return <GallerySection section={section} media={media} lang={lang} {...placement} />
    case 'links':
      return <LinksSection section={section} lang={lang} {...placement} />
  }
}

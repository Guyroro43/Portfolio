import type { Published, SectionOf } from '@/lib/content/schema'
import { cn, mediaSrc } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'
import { ui } from '@/lib/ui-text'
import { GalleryViewer, type ViewerPhoto } from './gallery-viewer'
import { SectionHeading, SectionShell, type SectionPlacement } from './section-shell'
import { SiteImage } from './site-image'

type Props = SectionPlacement & { section: SectionOf<'gallery'>; media: Published['media']; lang: Locale }

/** Grille dense de photos. Un clic ouvre la visionneuse plein écran. */
export function GallerySection({ section, media, lang, ...placement }: Props) {
  const items = section.data.items.filter((item) => media[item.photo])
  const photos: ViewerPhoto[] = items.map((item) => {
    const entry = media[item.photo]
    return {
      id: item.id,
      src: mediaSrc(entry),
      width: entry.width,
      height: entry.height,
      alt: t(entry.alt, lang),
      caption: t(entry.caption, lang),
    }
  })

  return (
    <SectionShell section={section} {...placement} innerClassName="flex flex-col gap-[22px] md:gap-10">
      <SectionHeading section={section} number={placement.number} lang={lang} />

      <GalleryViewer
        photos={photos}
        labels={{
          dialog: ui('photoDialog', lang),
          close: ui('closePhoto', lang),
          previous: ui('previousPhoto', lang),
          next: ui('nextPhoto', lang),
          position: ui('photoPosition', lang),
        }}
      >
        <div className="grid grid-flow-dense auto-rows-[120px] grid-cols-2 gap-2.5 md:auto-rows-[180px] md:grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] md:gap-4">
          {items.map((item, index) => {
            const entry = media[item.photo]
            const caption = t(entry.caption, lang)
            return (
              <figure
                key={item.id}
                data-reveal
                style={{ '--delay': `${(index % 4) * 0.06}s` } as React.CSSProperties}
                className={cn(
                  'lift relative overflow-hidden rounded-[14px] border border-white/8 bg-surface-dark md:rounded-[18px]',
                  item.tall && 'row-span-2',
                )}
              >
                <div className="zoom absolute inset-0">
                  <SiteImage
                    entry={entry}
                    lang={lang}
                    sizes="(min-width: 1200px) 290px, (min-width: 768px) 33vw, 50vw"
                  />
                </div>
                {caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-bg-dark/94 to-transparent px-2.5 pt-[22px] pb-[9px] text-xs leading-[1.35] text-on-dark md:px-4 md:pt-7 md:pb-3.5 md:text-sm md:leading-[1.4]">
                    {caption}
                  </figcaption>
                )}
                <button
                  type="button"
                  data-photo-index={index}
                  aria-label={caption ? `${ui('openPhoto', lang)}, ${caption}` : ui('openPhoto', lang)}
                  className="absolute inset-0 z-10 cursor-zoom-in rounded-[inherit] focus-visible:outline-offset-[-3px]"
                />
              </figure>
            )
          })}
        </div>
      </GalleryViewer>
    </SectionShell>
  )
}

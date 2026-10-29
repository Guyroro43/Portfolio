import type { SectionOf } from '@/lib/content/schema'
import { t, type Locale } from '@/lib/i18n'
import { ui } from '@/lib/ui-text'
import { MarqueePause } from './marquee-pause'

/**
 * Bande de noms sur fond ocre. La liste est répétée pour que chaque moitié dépasse la largeur
 * de l'écran, puis la bande glisse d'une moitié en boucle : le raccord est invisible.
 */
export function Marquee({ section, lang }: { section: SectionOf<'marquee'>; lang: Locale }) {
  const names = section.data.items.map((item) => t(item.text, lang))
  const half: string[] = []
  while (half.length < 8) half.push(...names)

  return (
    <div id={section.id} className="marquee relative overflow-hidden bg-accent text-bg-dark">
      <p className="sr-only">{names.join(', ')}</p>
      <MarqueePause label={ui('marqueePause', lang)} />
      <div aria-hidden="true" className="a-marquee flex w-max">
        {[...half, ...half].map((name, i) => (
          <div key={i} className="flex items-center gap-5 px-2.5 py-[15px] md:gap-7 md:px-3.5 md:py-5">
            <span className="font-heading text-lg font-bold whitespace-nowrap md:text-[22px]">{name}</span>
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" className="size-3.5 md:size-[18px]">
              <circle cx="24" cy="24" r="20" />
              <circle cx="24" cy="24" r="9" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

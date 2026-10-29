import { ArrowRight, MapPin } from 'lucide-react'
import type { Published, SectionOf } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'
import { ui } from '@/lib/ui-text'
import { Adinkra, GRID_SHAPES } from './adinkra'
import { SiteImage } from './site-image'
import { TONE_BG } from './tone'

type Props = {
  section: SectionOf<'hero'>
  media: Published['media']
  lang: Locale
  nextSectionId: string | null
}

export function Hero({ section, media, lang, nextSectionId }: Props) {
  const { data } = section
  const photo = data.photo ? media[data.photo] : null

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-titre`}
      className={cn('relative scroll-mt-[68px] overflow-hidden text-on-dark lg:min-h-[780px]', TONE_BG[section.tone])}
    >
      <Halos />
      <AdinkraGrid />

      {/*
        La photo vient avant le texte dans le HTML et chaque bloc a sa place fixe dans la grille :
        le navigateur affiche la page au fil de la lecture, et rien ne bouge quand la suite arrive.
      */}
      <div className="relative mx-auto grid max-w-[1200px] gap-[22px] px-6 pt-7 pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-16 lg:px-8 lg:pt-24 lg:pb-[136px]">
        {photo && (
          <div className="a-photo relative min-w-0 lg:col-start-2 lg:row-start-1">
            <Adinkra
              symbol="adinkrahene"
              strokeWidth={1.2}
              className="absolute -top-[30px] -right-[30px] size-[120px] text-accent opacity-55 lg:-top-14 lg:-right-14 lg:size-[180px]"
            />
            <figure className="relative h-[400px] overflow-hidden rounded-[24px] border border-white/14 bg-surface-dark lg:aspect-[4/5] lg:h-auto lg:rounded-[28px]">
              <SiteImage
                entry={photo}
                lang={lang}
                sizes="(min-width: 1024px) 420px, 100vw"
                className="object-cover object-[center_20%]"
                preload
              />
            </figure>
          </div>
        )}

        <div
          className={cn(
            'flex min-w-0 flex-col gap-[22px] lg:row-start-1 lg:gap-6',
            photo ? 'lg:col-start-1' : 'lg:col-span-2',
          )}
        >
          <p className="a-up inline-flex items-center gap-2 self-start rounded-full border border-white/14 bg-white/4 px-3 py-[7px] text-[13px] text-on-dark-nav md:px-3.5 md:py-2">
            <MapPin size={16} className="text-accent" aria-hidden="true" />
            {t(data.location, lang)}
          </p>

          <h1
            id={`${section.id}-titre`}
            translate="no"
            className="a-up font-heading text-[46px] leading-none font-extrabold tracking-[-0.025em] text-balance [--delay:0.08s] md:text-[64px] md:[--delay:0s] lg:text-[78px] lg:leading-[0.98]"
          >
            {data.name}
          </h1>

          <div className="a-up flex flex-col gap-3 [--delay:0.1s] md:gap-4">
            <p className="font-heading text-2xl font-semibold text-on-dark-nav md:text-[30px]">
              {t(data.nickname.prefix, lang)}{' '}
              <span translate="no" className="font-extrabold tracking-[0.02em] text-accent">
                {data.nickname.name}
              </span>
            </p>
            <span aria-hidden="true" className="a-draw block h-1 w-24 rounded bg-accent md:w-[132px]" />
          </div>

          <p className="a-up text-[19px] font-semibold [--delay:0.2s] md:text-[22px]">{t(data.role, lang)}</p>
          <p className="a-up max-w-[560px] text-base leading-[1.6] text-pretty text-on-dark-muted [--delay:0.2s] md:text-[17px] md:leading-[1.65]">
            {t(data.lead, lang)}
          </p>

          {data.buttons.length > 0 && (
            <div className="a-up flex flex-col gap-2.5 [--delay:0.3s] md:flex-row md:flex-wrap md:gap-3">
              {data.buttons.map((button, index) => (
                <a
                  key={button.id}
                  href={`#${button.target}`}
                  className={cn(
                    'btn flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-6 text-base font-semibold md:inline-flex md:min-h-[50px] md:text-[15px]',
                    index === 0 ? 'bg-accent text-bg-dark' : 'border border-white/24 text-on-dark',
                  )}
                >
                  {t(button.label, lang)}
                  {index === 0 && <ArrowRight size={18} aria-hidden="true" />}
                </a>
              ))}
            </div>
          )}

          {data.stats.length > 0 && (
            <dl className="mt-1.5 flex flex-col rounded-[18px] border border-white/12 bg-white/6 md:mt-4 md:grid md:grid-cols-[repeat(auto-fit,minmax(min(160px,100%),1fr))] md:gap-3 md:rounded-none md:border-0 md:bg-transparent">
              {data.stats.map((stat, index) => (
                <div
                  key={stat.id}
                  style={{ '--delay': `${0.3 + index * 0.1}s` } as React.CSSProperties}
                  className="a-up flex items-center gap-4 border-t border-white/8 px-[18px] py-3.5 first:border-t-0 md:flex-col md:items-start md:gap-1.5 md:rounded-[18px] md:border md:border-white/12 md:bg-white/6 md:px-5 md:py-[18px] md:first:border-t"
                >
                  <dt className="order-2 text-[13px] leading-[1.4] text-on-dark-muted md:leading-[1.45]">
                    {t(stat.label, lang)}
                  </dt>
                  <dd className="order-1 min-w-24 flex-none font-heading text-[26px] font-extrabold tabular-nums md:w-auto md:text-[32px]">
                    {stat.count ? (
                      // Le HTML contient la valeur finale. Le script ci-dessous la fait compter depuis 0.
                      <span data-count-to={stat.value} suppressHydrationWarning>
                        {stat.value}
                      </span>
                    ) : (
                      stat.value
                    )}
                    {stat.suffix}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <script dangerouslySetInnerHTML={{ __html: COUNTER_SCRIPT }} />
        </div>
      </div>

      {nextSectionId && (
        <a
          href={`#${nextSectionId}`}
          aria-label={ui('scrollCueLabel', lang)}
          className="absolute bottom-[26px] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-on-dark-faint lg:flex"
        >
          <span className="flex h-[38px] w-6 justify-center rounded-[14px] border-[1.5px] border-white/30 pt-[7px]">
            <span className="a-cue block h-2 w-1 rounded-sm bg-accent" />
          </span>
          {ui('scrollCue', lang)}
        </a>
      )}
    </section>
  )
}

/**
 * Compteurs : chaque chiffre part de 0 et atteint sa valeur en 3 s, en ralentissant sur la fin.
 * Script en ligne de quelques lignes, exécuté dès la lecture de la page, sans attendre React.
 * Sans JavaScript ou avec « réduire les animations », la valeur finale reste affichée.
 */
const COUNTER_SCRIPT = `(function(){var m=window.matchMedia;if(!m||m('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;var els=document.querySelectorAll('[data-count-to]:not([data-counting])');var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);var el=e.target,to=parseInt(el.getAttribute('data-count-to'),10),t0=performance.now()+300;function f(now){var p=Math.min(Math.max((now-t0)/3000,0),1);el.textContent=String(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)})});els.forEach(function(el){el.setAttribute('data-counting','');el.textContent='0';io.observe(el)})})();`

function Halos() {
  return (
    <>
      <div
        aria-hidden="true"
        className="a-aurora1 absolute -top-[120px] -left-40 size-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-halo-indigo)_55%,transparent)_0%,transparent_65%)] lg:-top-40 lg:-left-[180px] lg:size-[620px]"
      />
      <div
        aria-hidden="true"
        className="a-aurora2 absolute top-[320px] -right-40 size-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--c-accent)_24%,transparent)_0%,transparent_65%)] lg:top-auto lg:-right-[140px] lg:-bottom-[260px] lg:size-[660px]"
      />
    </>
  )
}

// Tirages fixes (même formule que la maquette) : la grille est identique à chaque affichage.
const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function gridCells(count: number, shapeOffset: number) {
  return Array.from({ length: count }, (_, i) => ({
    shape: Math.floor(seeded(i + shapeOffset) * 4),
    duration: `${(2.6 + seeded(i + 300) * 2.6).toFixed(2)}s`,
    delay: `${(seeded(i + 600) * 6).toFixed(2)}s`,
  }))
}

const DESKTOP_CELLS = gridCells(14 * 9, 0)
const MOBILE_CELLS = gridCells(5 * 6, 40)

/** Grille de symboles en fond : 14 x 9 cases de 88 px sur ordinateur, 5 x 6 cases de 78 px sur téléphone. */
function AdinkraGrid() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 grid w-[390px] grid-cols-[repeat(5,78px)] [mask-image:linear-gradient(to_bottom,#000_20%,transparent_95%)] md:hidden"
      >
        {MOBILE_CELLS.map((cell, i) => (
          <GridCell key={i} {...cell} size="mobile" />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 hidden w-[1232px] grid-cols-[repeat(14,88px)] [mask-image:linear-gradient(to_left,#000_30%,transparent_82%)] md:grid"
      >
        {DESKTOP_CELLS.map((cell, i) => (
          <GridCell key={i} {...cell} size="desktop" />
        ))}
      </div>
    </>
  )
}

function GridCell({ shape, duration, delay, size }: { shape: number; duration: string; delay: string; size: 'mobile' | 'desktop' }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center border-r border-b border-white/5 text-accent',
        size === 'mobile' ? 'size-[78px]' : 'size-[88px]',
      )}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        className={cn('a-cell', size === 'mobile' ? 'size-[30px]' : 'size-[34px]')}
        style={{ '--d': duration, '--dl': delay } as React.CSSProperties}
      >
        {GRID_SHAPES[shape]}
      </svg>
    </div>
  )
}

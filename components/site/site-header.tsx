import Link from 'next/link'
import type { Published } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import { LOCALES, localePath, t, type Locale } from '@/lib/i18n'
import { ui } from '@/lib/ui-text'
import { Adinkra } from './adinkra'
import { MobileMenu } from './mobile-menu'

type Props = { content: Published; lang: Locale }

export function SiteHeader({ content, lang }: Props) {
  const visible = content.sections.filter((s) => s.visible)
  const hero = visible.find((s) => s.type === 'hero')
  const brand = hero?.type === 'hero' ? hero.data.nickname.name : 'ANASSE'
  const menu = visible.filter((s) => s.inMenu).map((s) => ({ href: `#${s.id}`, label: t(s.label, lang) }))
  const contactSection = visible.find((s) => s.type === 'links')
  const contact = contactSection ? { href: `#${contactSection.id}`, label: t(content.site.contactButton, lang) } : null

  return (
    <header className="header-shadow sticky top-0 z-40 border-b border-white/8 bg-bg-dark/86 text-on-dark backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 py-2.5 pr-4 pl-5 md:gap-6 md:px-8 md:py-3.5">
        <a
          href="#top"
          aria-label={ui('backToTop', lang)}
          className="flex min-h-11 items-center gap-2 font-heading text-xl font-extrabold tracking-[0.01em] md:gap-2.5 md:text-[22px]"
        >
          <Adinkra symbol="adinkrahene" strokeWidth={3} className="size-[22px] text-accent md:size-[26px]" />
          <span>
            {brand}
            <span className="text-accent">.</span>
          </span>
        </a>

        <nav aria-label={ui('mainNav', lang)} className="hidden gap-0.5 xl:flex">
          {menu.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-3 text-sm text-on-dark-nav transition-colors hover:text-on-dark"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitch lang={lang} />
          {contact && (
            <a
              href={contact.href}
              className="btn hidden min-h-11 items-center rounded-full border border-accent/60 px-[18px] text-sm font-semibold text-accent md:inline-flex"
            >
              {contact.label}
            </a>
          )}
          <MobileMenu
            items={contact ? [...menu, contact] : menu}
            labels={{ open: ui('openMenu', lang), close: ui('closeMenu', lang), nav: ui('mainNav', lang) }}
          />
        </div>
      </div>
    </header>
  )
}

function LanguageSwitch({ lang }: { lang: Locale }) {
  return (
    <nav aria-label={ui('languageNav', lang)} className="flex rounded-full border border-white/16 p-[3px] md:p-1">
      {LOCALES.map((code) => {
        const current = code === lang
        return (
          <Link
            key={code}
            href={localePath(code)}
            hrefLang={code}
            lang={code}
            aria-current={current ? 'true' : undefined}
            className={cn(
              'flex min-h-[38px] min-w-11 items-center justify-center rounded-full px-3.5 text-[13px] font-semibold uppercase md:min-h-0 md:py-[9px]',
              current ? 'bg-accent text-bg-dark' : 'text-on-dark-nav hover:text-on-dark',
            )}
          >
            {code}
          </Link>
        )
      })}
    </nav>
  )
}

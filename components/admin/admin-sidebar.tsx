'use client'

import { ExternalLink, Images, LayoutDashboard, LogOut, Menu, Palette, X } from 'lucide-react'
import { GuardedLink } from './save-guard'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { signOut } from '@/app/admin/actions'
import { Adinkra } from '@/components/site/adinkra'
import type { SectionNavItem } from '@/lib/admin/summary'
import { cn } from '@/lib/content/view'

const PAGES = [
  { href: '/admin', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { href: '/admin/apparence', label: 'Apparence', icon: Palette },
  { href: '/admin/photos', label: 'Photos', icon: Images },
]

const pageLink = 'nav-hover flex min-h-[42px] items-center gap-3 rounded-[10px] px-3 text-sm'
const activeLink = 'bg-ocre/14 font-semibold text-ocre-soft'

/** Menu de gauche (design/Dashboard.dc.html). Sur téléphone, il se replie derrière un bouton. */
export function AdminSidebar({ sections }: { sections: SectionNavItem[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  return (
    <aside
      aria-label="Menu de l’admin"
      className="on-dark bg-night text-side lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[248px] lg:flex-none lg:flex-col lg:gap-[22px] lg:overflow-y-auto lg:px-3.5 lg:py-5"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 lg:p-0">
        <GuardedLink href="/admin" onClick={close} className="flex flex-1 items-center gap-2.5 px-2.5 py-1.5 font-heading text-xl font-extrabold text-cream">
          <Adinkra symbol="adinkrahene" strokeWidth={3} className="size-[22px] text-ocre" />
          <span translate="no">
            ANASSE<span className="text-ocre">.</span>
          </span>
          <span className="ml-auto rounded-md bg-white/8 px-2 py-[3px] font-body text-[11px] font-semibold text-side">admin</span>
        </GuardedLink>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((value) => !value)}
          className="flex size-11 flex-none items-center justify-center rounded-xl border border-white/16 text-cream lg:hidden"
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      <div id={panelId} className={cn('flex-col gap-[22px] px-3.5 pb-5 lg:flex lg:flex-1 lg:p-0', open ? 'flex' : 'hidden')}>
        <nav aria-label="Pages de l’admin" className="flex flex-col gap-0.5">
          {PAGES.map(({ href, label, icon: Icon }) => {
            const current = pathname === href
            return (
              <GuardedLink
                key={href}
                href={href}
                onClick={close}
                aria-current={current ? 'page' : undefined}
                className={cn(pageLink, current ? activeLink : 'font-medium')}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </GuardedLink>
            )
          })}
        </nav>

        <nav aria-labelledby={`${panelId}-sections`} className="flex flex-col gap-0.5">
          <p id={`${panelId}-sections`} className="mb-1.5 px-3 text-xs font-semibold text-side-faint">
            Sections du site
          </p>
          {sections.map((section) => {
            const href = `/admin/sections/${section.id}`
            const current = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <GuardedLink
                key={section.id}
                href={href}
                onClick={close}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'nav-hover flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-[13px]',
                  current ? activeLink : 'text-side-muted',
                )}
              >
                <span className="w-5 flex-none text-[11px] text-side-faint">{section.num}</span>
                <span className="min-w-0 flex-1 truncate">{section.name}</span>
                {!section.visible && <span className="text-[11px] text-side-faint">masquée</span>}
              </GuardedLink>
            )
          })}
        </nav>

        <div className="flex flex-col gap-0.5 border-t border-white/8 pt-3.5 lg:mt-auto">
          <a href="/" target="_blank" rel="noopener" className={pageLink}>
            <ExternalLink size={18} aria-hidden="true" />
            Voir le site
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          <form action={signOut}>
            <button type="submit" className={cn(pageLink, 'w-full text-left')}>
              <LogOut size={18} aria-hidden="true" />
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

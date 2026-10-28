'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  items: { href: string; label: string }[]
  labels: { open: string; close: string; nav: string }
}

/** Menu à trois traits, sous la largeur d'un grand écran. */
export function MobileMenu({ items, labels }: Props) {
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

  return (
    <div className="xl:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((value) => !value)}
        className="flex size-[46px] items-center justify-center rounded-[14px] border border-white/16 bg-white/4 text-on-dark"
      >
        {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>

      <nav
        id={panelId}
        aria-label={labels.nav}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-white/8 bg-bg-indigo px-5 pt-2 pb-5 shadow-[0_24px_40px_-24px_rgb(0_0_0/0.6)]"
      >
        <ul className="mx-auto flex max-w-[1200px] flex-col">
          {items.map((item) => (
            <li key={item.href} className="border-b border-white/8 last:border-0">
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center font-heading text-lg font-semibold text-on-dark"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

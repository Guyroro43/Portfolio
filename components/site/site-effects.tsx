'use client'

import { useEffect } from 'react'

/**
 * Comportements communs de la page publique, sans bibliothèque :
 * 1. Révélations : un élément [data-reveal] reçoit data-shown quand il arrive à l'écran (globals.css anime).
 * 2. Liens du menu (#section) : défilement vers la section visible. Next.js garde la page de l'autre
 *    langue cachée en mémoire, avec les mêmes ancres : le navigateur seul pourrait viser la mauvaise.
 */
export function SiteEffects() {
  useEffect(() => {
    const pending = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-shown])')
    if (!('IntersectionObserver' in window)) {
      pending.forEach((el) => el.setAttribute('data-shown', ''))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-shown', '')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )
    pending.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]')
      const id = link?.getAttribute('href')?.slice(1)
      if (!id) return
      const target = Array.from(document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)).find(
        (el) => el.getClientRects().length > 0,
      )
      if (!target) return
      event.preventDefault()
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      window.history.pushState(null, '', `#${id}`)
      // Le focus suit le lien, pour la navigation au clavier.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}

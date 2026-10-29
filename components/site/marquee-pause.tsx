'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/**
 * Bouton pause de la bande de noms (WCAG 2.2.2 : un contenu qui bouge sans fin doit pouvoir s'arrêter).
 * Masqué quand l'appareil demande de réduire les animations : la bande est alors déjà immobile.
 */
export function MarqueePause({ label }: { label: string }) {
  const [paused, setPaused] = useState(false)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    button.current?.closest('.marquee')?.toggleAttribute('data-paused', paused)
  }, [paused])

  return (
    <button
      ref={button}
      type="button"
      aria-label={label}
      aria-pressed={paused}
      onClick={() => setPaused((value) => !value)}
      className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-bg-dark text-accent shadow-[0_0_0_6px_var(--c-accent)] motion-reduce:hidden md:right-4"
    >
      {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
    </button>
  )
}

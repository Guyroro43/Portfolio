'use client'

import { useEffect } from 'react'

/**
 * La ligne ocre de la frise suit le défilement, et chaque étape apparaît quand la ligne l'atteint.
 * Seul transform change à chaque image. Le calcul ne tourne que lorsque la frise est à l'écran.
 * Avec « réduire les animations », la ligne est entière et les étapes visibles (voir globals.css).
 */
export function TimelineProgress({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const section = document.getElementById(sectionId)
    const list = section?.querySelector('ol')
    const line = section?.querySelector<HTMLElement>('[data-timeline-line]')
    if (!list || !line) return
    const steps = Array.from(list.querySelectorAll<HTMLElement>('[data-reveal-step]'))

    let offsets: number[] = []
    const measure = () => {
      offsets = steps.map((step) => step.offsetTop)
    }

    let frame = 0
    const update = () => {
      frame = 0
      const rect = list.getBoundingClientRect()
      const progress = Math.min(Math.max((window.innerHeight * 0.7 - rect.top) / rect.height, 0), 1)
      line.style.transform = `scaleY(${progress})`
      const reached = progress * rect.height
      steps.forEach((step, i) => {
        if (offsets[i] <= reached + 8 && !step.hasAttribute('data-shown')) step.setAttribute('data-shown', '')
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onResize = () => {
      measure()
      schedule()
    }

    measure()
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', schedule, { passive: true })
        schedule()
      } else {
        window.removeEventListener('scroll', schedule)
      }
    })
    observer.observe(list)
    window.addEventListener('resize', onResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frame)
    }
  }, [sectionId])

  return null
}

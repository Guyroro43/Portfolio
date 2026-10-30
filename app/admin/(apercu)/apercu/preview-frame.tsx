'use client'

import { useEffect, useRef, useState } from 'react'
import type { PreviewMessage } from '@/components/admin/preview-pane'
import { CardView } from '@/components/site/cards-section'
import { SectionView } from '@/components/site/site-page'
import { TONE_BG } from '@/components/site/tone'
import type { Published } from '@/lib/content/schema'
import { themeCss } from '@/lib/theme'

// Largeur d'une carte dans la grille du site sur ordinateur (3 colonnes dans 1200 px).
const CARD_WIDTH = 420

/** Rend la section (ou la carte) en cours d'édition avec les vrais composants du site. */
export function PreviewFrame({ media }: { media: Published['media'] }) {
  const [state, setState] = useState<PreviewMessage | null>(null)
  const [theme, setTheme] = useState('')
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Seule la page d'admin qui contient ce cadre peut lui parler.
      if (event.origin !== window.location.origin || event.source !== window.parent) return
      const data = event.data as PreviewMessage
      if (data?.type !== 'preview') return
      setState(data)
      // Une couleur en cours de saisie peut être invalide : on garde alors le dernier thème valide.
      try {
        setTheme(themeCss(data.content.theme))
      } catch {}
    }
    window.addEventListener('message', onMessage)
    window.parent.postMessage({ type: 'ready' }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    const element = root.current
    if (!element) return
    const report = () =>
      window.parent.postMessage({ type: 'size', width: element.offsetWidth, height: element.offsetHeight }, window.location.origin)
    const observer = new ResizeObserver(report)
    observer.observe(element)
    report()
    return () => observer.disconnect()
  }, [state !== null])

  useEffect(() => {
    if (state) document.documentElement.lang = state.lang
  }, [state])

  if (!state) return null
  const { content, focus, lang } = state
  // La section en cours d'édition s'affiche même si elle est masquée sur le site.
  const sections = content.sections.filter((s) => s.visible || s.id === focus.sectionId)
  const section = sections.find((s) => s.id === focus.sectionId)
  if (!section) return null
  const item = section.type === 'cards' && focus.itemId ? section.data.items.find((i) => i.id === focus.itemId) : undefined
  const wide = !item || (section.type === 'cards' && section.data.variant === 'projects' && item.featured)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: theme }} />
      <div ref={root} style={wide ? undefined : { width: CARD_WIDTH }}>
        {item && section.type === 'cards' ? (
          <div className={TONE_BG[section.tone]} style={{ padding: 24 }}>
            <CardView section={section} item={item} media={media} lang={lang} />
          </div>
        ) : (
          <SectionView section={section} sections={sections} media={media} lang={lang} />
        )}
      </div>
    </>
  )
}

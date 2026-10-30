'use client'

import { Monitor, Smartphone } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { Content } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'
import type { Locale } from '@/lib/i18n'

export type PreviewFocus = { sectionId: string; itemId?: string }

/** Message envoyé à la page d'aperçu (app/admin/(apercu)/apercu). */
export type PreviewMessage = { type: 'preview'; content: Content; focus: PreviewFocus; lang: Locale }

const FRAME_WIDTH = { desktop: 1280, mobile: 390 } as const

function Toggle<T extends string>({ label, value, onChange, options }: {
  label: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: React.ReactNode; title: string }[]
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full border border-line bg-white p-[3px]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          title={option.title}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex min-h-9 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-semibold',
            value === option.value ? 'bg-night text-cream' : 'text-ink-muted',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Aperçu en direct : la page d'aperçu, dans un cadre, reçoit le brouillon à chaque frappe.
 * Vue ordinateur réduite à la largeur de la colonne, ou vue téléphone.
 */
export function PreviewPane({ content, focus }: { content: Content; focus: PreviewFocus }) {
  const titleId = useId()
  const frame = useRef<HTMLIFrameElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [device, setDevice] = useState<keyof typeof FRAME_WIDTH>('desktop')
  const [lang, setLang] = useState<Locale>('fr')
  const [boxWidth, setBoxWidth] = useState(0)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const send = useCallback(() => {
    const message: PreviewMessage = { type: 'preview', content, focus, lang }
    frame.current?.contentWindow?.postMessage(message, window.location.origin)
  }, [content, focus, lang])

  // Chaque modification part vers le cadre.
  useEffect(send, [send])

  // Le cadre annonce qu'il est prêt, puis sa taille à chaque changement.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      if (event.data?.type === 'ready') send()
      if (event.data?.type === 'size') setSize({ width: event.data.width, height: event.data.height })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [send])

  useEffect(() => {
    const element = box.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const frameWidth = FRAME_WIDTH[device]
  const contentWidth = Math.min(size.width || frameWidth, frameWidth)
  const scale = boxWidth ? Math.min(1, boxWidth / contentWidth) : 0

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="font-heading text-xl font-bold">
          Aperçu
        </h2>
        <div className="flex flex-wrap gap-2">
          <Toggle
            label="Écran de l’aperçu"
            value={device}
            onChange={setDevice}
            options={[
              { value: 'desktop', title: 'Ordinateur', label: <Monitor size={16} aria-label="Ordinateur" /> },
              { value: 'mobile', title: 'Téléphone', label: <Smartphone size={16} aria-label="Téléphone" /> },
            ]}
          />
          <Toggle
            label="Langue de l’aperçu"
            value={lang}
            onChange={setLang}
            options={[
              { value: 'fr', title: 'Français', label: 'FR' },
              { value: 'en', title: 'Anglais', label: 'EN' },
            ]}
          />
        </div>
      </div>

      {/* inert : l'aperçu se regarde, il ne se clique pas (et le clavier ne s'y perd pas). */}
      <div ref={box} inert className="overflow-hidden rounded-[20px] border border-line bg-paper">
        <div style={{ height: Math.max(size.height * scale, 120), width: contentWidth * scale }} className="mx-auto overflow-hidden">
          <iframe
            ref={frame}
            src="/admin/apercu"
            title="Aperçu de la section"
            style={{ width: frameWidth, height: size.height || 400, transform: `scale(${scale})`, transformOrigin: '0 0' }}
            className="block border-0"
          />
        </div>
      </div>
      <p className="text-[13px] text-ink-muted">
        Ce que les visiteurs verront après publication. L’aperçu suit ce que tu tapes.
      </p>
    </section>
  )
}

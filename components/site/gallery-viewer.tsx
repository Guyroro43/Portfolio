'use client'

import dynamic from 'next/dynamic'
import { useCallback, useRef, useState } from 'react'

export type ViewerPhoto = { id: string; src: string; width: number; height: number; alt: string; caption: string }
export type ViewerLabels = { dialog: string; close: string; previous: string; next: string; position: string }

// La visionneuse (et Motion) n'est téléchargée qu'au premier survol ou au premier clic sur la galerie.
const loadLightbox = () => import('./lightbox')
const Lightbox = dynamic(loadLightbox, { ssr: false })

type Props = { photos: ViewerPhoto[]; labels: ViewerLabels; children: React.ReactNode }

export function GalleryViewer({ photos, labels, children }: Props) {
  const [index, setIndex] = useState<number | null>(null)
  const trigger = useRef<HTMLElement | null>(null)

  const onClick = (event: React.MouseEvent) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-photo-index]')
    if (!button) return
    trigger.current = button
    setIndex(Number(button.dataset.photoIndex))
  }

  const close = useCallback(() => {
    setIndex(null)
    trigger.current?.focus()
  }, [])

  return (
    <div onClick={onClick} onPointerEnter={loadLightbox} onFocus={loadLightbox}>
      {children}
      {index !== null && <Lightbox photos={photos} index={index} onIndexChange={setIndex} onClose={close} labels={labels} />}
    </div>
  )
}

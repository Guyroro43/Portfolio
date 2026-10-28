'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ViewerLabels, ViewerPhoto } from './gallery-viewer'

type Props = {
  photos: ViewerPhoto[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
  labels: ViewerLabels
}

const SWIPE_DISTANCE = 80
const SWIPE_SPEED = 400

/** Visionneuse plein écran : flèches, clavier (Échap, gauche, droite) et glisser du doigt. */
export default function Lightbox({ photos, index, onIndexChange, onClose, labels }: Props) {
  const [direction, setDirection] = useState(0)
  const dialog = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const photo = photos[index]

  const go = (delta: number) => {
    setDirection(delta)
    onIndexChange((index + delta + photos.length) % photos.length)
  }

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose()
    else if (event.key === 'ArrowLeft') go(-1)
    else if (event.key === 'ArrowRight') go(1)
    else if (event.key === 'Tab') trapFocus(event, dialog.current)
  })

  // Défilement de la page bloqué, focus et clavier dans la visionneuse tant qu'elle est ouverte.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const handler = (event: KeyboardEvent) => onKey(event)
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handler)
    }
  }, [])

  const position = labels.position.replace('{n}', String(index + 1)).replace('{total}', String(photos.length))

  return createPortal(
    <MotionConfig reducedMotion="user">
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={labels.dialog}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex flex-col overscroll-contain bg-bg-dark/95 text-on-dark"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <p className="text-sm text-on-dark-muted tabular-nums" aria-live="polite">
            {position}
          </p>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="flex size-11 items-center justify-center rounded-full border border-white/16 bg-white/5"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 md:px-20">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.figure
              key={photo.id}
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d * 80, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d * -80, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_SPEED) go(1)
                else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_SPEED) go(-1)
              }}
              className="flex max-h-full touch-pan-y flex-col items-center gap-3"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1280px) 1200px, 100vw"
                draggable={false}
                className="h-auto max-h-[calc(100dvh-170px)] w-auto max-w-full rounded-xl object-contain select-none"
              />
              {photo.caption && <figcaption className="text-center text-sm text-on-dark-muted md:text-base">{photo.caption}</figcaption>}
            </motion.figure>
          </AnimatePresence>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={labels.previous}
                className="absolute top-1/2 left-2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-bg-dark/60 md:left-5 md:flex"
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={labels.next}
                className="absolute top-1/2 right-2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-bg-dark/60 md:right-5 md:flex"
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Sur téléphone, les flèches passent sous la photo, à portée de pouce. */}
        {photos.length > 1 && (
          <div className="flex justify-center gap-3 px-4 pt-2 pb-5 md:hidden">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={labels.previous}
              className="flex size-12 items-center justify-center rounded-full border border-white/16 bg-white/5"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={labels.next}
              className="flex size-12 items-center justify-center rounded-full border border-white/16 bg-white/5"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </div>
        )}
      </motion.div>
    </MotionConfig>,
    document.body,
  )
}

/** Garde la tabulation à l'intérieur de la visionneuse. */
function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return
  const focusable = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled]), [href]')).filter(
    (el) => el.getClientRects().length > 0,
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

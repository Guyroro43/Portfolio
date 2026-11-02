'use client'

import { useId, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import type { Crop } from '@/lib/content/schema'
import { cn } from '@/lib/content/view'

type Aspect = Crop['aspect']

const ASPECTS: { value: Aspect; label: string; ratio: number }[] = [
  { value: 'free', label: 'Libre', ratio: 0 },
  { value: '2:3', label: 'Portrait 2:3', ratio: 2 / 3 },
  { value: '1:1', label: 'Carré', ratio: 1 },
  { value: '16:9', label: 'Paysage 16:9', ratio: 16 / 9 },
]

const round = (value: number) => Math.round(Math.min(100, Math.max(0, value)) * 100) / 100

/**
 * Cadrage (design/Media.dc.html) : la zone choisie est enregistrée en pourcentages de la photo
 * d'origine, qui reste intacte. « Libre » garde la photo entière.
 */
export function CropEditor({ src, width, height, crop, onChange }: {
  src: string
  width: number
  height: number
  crop: Crop | null
  onChange: (crop: Crop | null) => void
}) {
  const labelId = useId()
  const zoomId = useId()
  const [aspect, setAspect] = useState<Aspect>(crop?.aspect ?? 'free')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const ratio = ASPECTS.find((a) => a.value === aspect)!.ratio

  const choose = (next: Aspect) => {
    setAspect(next)
    setPosition({ x: 0, y: 0 })
    setZoom(1)
    if (next === 'free') onChange(null)
  }

  const complete = (area: Area) => {
    const next: Crop = { aspect, x: round(area.x), y: round(area.y), width: round(area.width), height: round(area.height) }
    if (next.width <= 0 || next.height <= 0) return
    // Le cadreur annonce aussi sa zone de départ : on n'enregistre que ce qui change vraiment.
    if (crop && crop.aspect === next.aspect && ['x', 'y', 'width', 'height'].every((k) => Math.abs(crop[k as keyof Area] - next[k as keyof Area]) < 0.1)) return
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-night" style={{ aspectRatio: aspect === 'free' ? `${width} / ${height}` : '4 / 3' }}>
        {aspect === 'free' ? (
          // Photo entière : chaque emplacement du site la centre (object-cover).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="absolute inset-0 size-full object-contain" />
        ) : (
          <Cropper
            image={src}
            aspect={ratio}
            crop={position}
            zoom={zoom}
            maxZoom={4}
            onCropChange={setPosition}
            onZoomChange={setZoom}
            onCropComplete={complete}
            initialCroppedAreaPercentages={crop?.aspect === aspect ? crop : undefined}
            objectFit="contain"
            keyboardStep={2}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span id={labelId} className="text-[13px] font-semibold">
          Cadrage
        </span>
        <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-1.5">
          {ASPECTS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={aspect === option.value}
              onClick={() => choose(option.value)}
              className={cn(
                'min-h-9 rounded-full border px-3 text-[13px] font-semibold',
                aspect === option.value ? 'border-night bg-night text-cream' : 'border-line-strong bg-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-ink-muted">
          {aspect === 'free'
            ? 'Photo entière : chaque emplacement la centre.'
            : 'Glisse la photo pour choisir la zone. Au clavier : flèches pour déplacer, réglette pour zoomer.'}
        </span>
      </div>

      {aspect !== 'free' && (
        <div className="flex items-center gap-3">
          <label htmlFor={zoomId} className="text-[13px] font-semibold">
            Zoom
          </label>
          <input
            id={zoomId}
            type="range"
            min={1}
            max={4}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1 accent-indigo"
          />
        </div>
      )}
    </div>
  )
}

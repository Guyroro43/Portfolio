'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/content/view'

type Props = {
  text: string
  labels: { short: string; long: string; done: string }
  className?: string
}

/** Met le texte dans le presse-papier et affiche « Copié » pendant 2 s. */
export function CopyButton({ text, labels, className }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Presse-papier refusé par le navigateur : le lien email reste utilisable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-[13px] font-semibold',
        className,
      )}
    >
      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-live="polite">
        {copied ? (
          labels.done
        ) : (
          <>
            <span className="md:hidden">{labels.long}</span>
            <span className="hidden md:inline">{labels.short}</span>
          </>
        )}
      </span>
    </button>
  )
}

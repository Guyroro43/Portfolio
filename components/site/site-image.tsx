import Image from 'next/image'
import type { MediaEntry } from '@/lib/content/schema'
import { mediaSrc } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'

type Props = {
  entry: MediaEntry
  lang: Locale
  sizes: string
  className?: string
  preload?: boolean
}

/**
 * Photo qui remplit son cadre (le parent fixe la taille, donc aucun saut de mise en page).
 * Le parent doit être en position relative.
 */
export function SiteImage({ entry, lang, sizes, className, preload = false }: Props) {
  return (
    <Image
      src={mediaSrc(entry)}
      alt={t(entry.alt, lang)}
      fill
      sizes={sizes}
      preload={preload}
      className={className ?? 'object-cover'}
    />
  )
}

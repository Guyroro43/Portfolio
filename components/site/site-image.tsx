import Image from 'next/image'
import type { MediaEntry } from '@/lib/content/schema'
import { mediaSrc } from '@/lib/content/view'
import { t, type Locale } from '@/lib/i18n'

type Props = {
  entry: MediaEntry
  lang: Locale
  sizes: string
  className?: string
  /**
   * Photo principale (LCP) : préchargée dans le head et prioritaire. Avec preload seul, Next 16
   * la laisse en priorité basse, à égalité avec les scripts qui se téléchargent en même temps.
   */
  preload?: boolean
}

/** Multiplie les largeurs d'un attribut sizes (« 420px », « 50vw ») : une photo cadrée s'affiche agrandie. */
function scaleSizes(sizes: string, factor: number): string {
  return sizes.replace(/(\d+(?:\.\d+)?)(px|vw)/g, (_, value: string, unit: string) => `${Math.round(Number(value) * factor)}${unit}`)
}

/**
 * Photo qui remplit son cadre (le parent fixe la taille, donc aucun saut de mise en page).
 * Le parent doit être en position relative.
 *
 * Avec un cadrage (choisi dans l'admin, la photo d'origine reste intacte) : la zone cadrée couvre
 * le cadre et y est centrée, comme object-cover, grâce aux unités de conteneur (cqw, cqh).
 */
export function SiteImage({ entry, lang, sizes, className, preload = false }: Props) {
  const alt = t(entry.alt, lang)
  const { crop } = entry
  const fetchPriority = preload ? 'high' : undefined
  if (!crop) {
    return (
      <Image
        src={mediaSrc(entry)}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        fetchPriority={fetchPriority}
        className={className ?? 'object-cover'}
      />
    )
  }

  const ratio = entry.width / entry.height
  // Largeur de la photo entière à l'écran : assez grande pour que la zone cadrée couvre le cadre.
  const width = `max(${(10000 / crop.width).toFixed(3)}cqw, ${((10000 * ratio) / crop.height).toFixed(3)}cqh)`
  const height = `calc(${width} / ${ratio.toFixed(5)})`
  const centerX = (crop.x + crop.width / 2) / 100
  const centerY = (crop.y + crop.height / 2) / 100

  return (
    <span className="absolute inset-0 overflow-hidden [container-type:size]">
      <Image
        src={mediaSrc(entry)}
        alt={alt}
        width={entry.width}
        height={entry.height}
        sizes={scaleSizes(sizes, Math.min(3, 100 / Math.min(crop.width, crop.height)))}
        preload={preload}
        fetchPriority={fetchPriority}
        style={{
          position: 'absolute',
          maxWidth: 'none',
          width,
          height,
          left: `calc(50cqw - ${width} * ${centerX.toFixed(5)})`,
          top: `calc(50cqh - ${height} * ${centerY.toFixed(5)})`,
        }}
      />
    </span>
  )
}

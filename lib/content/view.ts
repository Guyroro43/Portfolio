import type { MediaEntry, Section } from './schema'

/** Sections numérotées « 01 · À propos » : toutes les sections visibles sauf le haut de page et la bande de noms. */
export function sectionNumbers(sections: Section[]): Map<string, string> {
  const numbers = new Map<string, string>()
  let n = 0
  for (const section of sections) {
    if (section.type === 'hero' || section.type === 'marquee') continue
    n += 1
    numbers.set(section.id, String(n).padStart(2, '0'))
  }
  return numbers
}

/** Adresse publique d'une photo dans le bucket media de Supabase (autorisée dans next.config.ts). */
export function mediaSrc(entry: MediaEntry): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${entry.path}`
}

/** Assemble des classes CSS en ignorant les valeurs vides. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

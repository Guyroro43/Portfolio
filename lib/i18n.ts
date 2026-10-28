export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

export type I18n = { fr: string; en: string }

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Texte dans la langue demandée. Une case anglaise vide affiche le français. */
export function t(text: I18n, lang: Locale): string {
  if (lang === 'en' && text.en.trim() !== '') return text.en
  return text.fr
}

/** Adresse de la page d'accueil dans une langue : le français est à la racine. */
export function localePath(lang: Locale): string {
  return lang === 'fr' ? '/' : `/${lang}`
}

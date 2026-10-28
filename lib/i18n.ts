export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

export type I18n = { fr: string; en: string }

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Texte dans la langue demandée. Une case anglaise vide affiche le français. */
export function t(text: I18n, lang: Locale): string {
  const value = lang === 'en' && text.en.trim() !== '' ? text.en : frenchSpacing(text.fr)
  return curlyApostrophes(value)
}

/** Apostrophe typographique à l'affichage : « d'Ivoire » devient « d’Ivoire ». Le contenu saisi ne change pas. */
function curlyApostrophes(text: string): string {
  return text.replace(/(\p{L})'(\p{L})/gu, '$1’$2')
}

/** Espace insécable avant : ; ! ? et », pour qu'ils ne partent jamais seuls à la ligne. */
function frenchSpacing(text: string): string {
  return text.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ')
}

/** Adresse de la page d'accueil dans une langue : le français est à la racine. */
export function localePath(lang: Locale): string {
  return lang === 'fr' ? '/' : `/${lang}`
}

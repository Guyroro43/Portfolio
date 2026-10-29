import type { I18n, Locale } from './i18n'

// Textes fixes de l'interface du site public (boutons, libellés d'accessibilité).
// Le contenu modifiable, lui, vit dans le document JSON.

const UI = {
  skipLink: { fr: 'Aller au contenu', en: 'Skip to content' },
  mainNav: { fr: 'Navigation principale', en: 'Main navigation' },
  languageNav: { fr: 'Langue du site', en: 'Site language' },
  openMenu: { fr: 'Ouvrir le menu', en: 'Open menu' },
  closeMenu: { fr: 'Fermer le menu', en: 'Close menu' },
  backToTop: { fr: 'Retour en haut de la page', en: 'Back to the top of the page' },
  scrollCue: { fr: 'Défiler', en: 'Scroll' },
  marqueePause: { fr: 'Mettre en pause la bande de noms', en: 'Pause the scrolling names' },
  scrollCueLabel: { fr: 'Descendre vers la section suivante', en: 'Scroll to the next section' },
  featured: { fr: 'Projet phare', en: 'Featured project' },
  viewSite: { fr: 'Voir le site', en: 'View site' },
  sourceCode: { fr: 'Code source', en: 'Source code' },
  copy: { fr: 'Copier', en: 'Copy' },
  copyAddress: { fr: "Copier l'adresse", en: 'Copy address' },
  copied: { fr: 'Copié', en: 'Copied' },
  openPhoto: { fr: 'Agrandir la photo', en: 'Enlarge photo' },
  photoDialog: { fr: 'Photo agrandie', en: 'Enlarged photo' },
  closePhoto: { fr: 'Fermer', en: 'Close' },
  previousPhoto: { fr: 'Photo précédente', en: 'Previous photo' },
  nextPhoto: { fr: 'Photo suivante', en: 'Next photo' },
  photoPosition: { fr: '{n} sur {total}', en: '{n} of {total}' },
  newTab: { fr: "s'ouvre dans un nouvel onglet", en: 'opens in a new tab' },
} satisfies Record<string, I18n>

export type UiKey = keyof typeof UI

export function ui(key: UiKey, lang: Locale): string {
  return UI[key][lang]
}

import type { I18n } from '@/lib/i18n'

// Listes fixées dans le code : l'admin les propose, il ne les modifie pas.

export const ADINKRA = {
  dwennimmen: { name: 'Dwennimmen', meaning: { fr: "l'humilité et la force", en: 'humility and strength' } },
  aya: { name: 'Aya', meaning: { fr: "l'endurance et l'ingéniosité", en: 'endurance and resourcefulness' } },
  nkyinkyim: { name: 'Nkyinkyim', meaning: { fr: "l'initiative et la capacité d'adaptation", en: 'initiative and adaptability' } },
  'mate-masie': { name: 'Mate Masie', meaning: { fr: 'la sagesse et la connaissance', en: 'wisdom and knowledge' } },
  sankofa: { name: 'Sankofa', meaning: { fr: 'revenir à ses racines', en: "returning to one's roots" } },
  nkonsonkonson: { name: 'Nkonsonkonson', meaning: { fr: "l'unité et les liens humains", en: 'unity and human bonds' } },
  adinkrahene: { name: 'Adinkrahene', meaning: { fr: 'la grandeur et le leadership', en: 'greatness and leadership' } },
} as const satisfies Record<string, { name: string; meaning: I18n }>

export type AdinkraSymbol = keyof typeof ADINKRA
export const ADINKRA_KEYS = Object.keys(ADINKRA) as [AdinkraSymbol, ...AdinkraSymbol[]]

export const STATUSES = {
  'in-progress': { fr: 'En cours', en: 'In progress' },
  redesign: { fr: 'Refonte en cours', en: 'Redesign in progress' },
  delivered: { fr: 'Livré', en: 'Shipped' },
  'for-sale': { fr: 'En vente', en: 'On sale' },
} as const satisfies Record<string, I18n>

export type ProjectStatus = keyof typeof STATUSES
export const STATUS_KEYS = Object.keys(STATUSES) as [ProjectStatus, ...ProjectStatus[]]

// Fond d'une section. « light-alt » est un fond clair un peu plus soutenu, calculé depuis le fond clair.
export const TONES = ['dark', 'indigo', 'light', 'light-alt'] as const
export type Tone = (typeof TONES)[number]

// Icônes lucide proposées dans l'admin (nom lucide en kebab-case).
export const ICON_NAMES = [
  'graduation-cap',
  'users',
  'briefcase',
  'trophy',
  'shopping-bag',
  'map-pin',
  'file-text',
  'gamepad-2',
  'book-open',
  'trending-up',
  'database',
  'code',
  'film',
  'mail',
  'globe',
  'rocket',
  'lightbulb',
  'heart',
  'camera',
  'sparkles',
  'link',
] as const
export type IconName = (typeof ICON_NAMES)[number]

export const CROP_ASPECTS = ['free', '2:3', '1:1', '16:9'] as const

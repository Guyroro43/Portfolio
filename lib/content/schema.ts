import { z } from 'zod'
import { BODY_FONT_KEYS, HEADING_FONT_KEYS } from '@/lib/fonts-list'
import { ADINKRA_KEYS, CROP_ASPECTS, ICON_NAMES, STATUS_KEYS, TONES } from './constants'

// Schéma du document « site_content » : tout le site en un seul JSON.
// Chaque enregistrement de l'admin et chaque lecture passent par ces schémas.

const i18n = (max: number) => z.object({ fr: z.string().max(max), en: z.string().max(max) })
const shortText = i18n(200)
const longText = i18n(2000)

const id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/, 'Identifiant invalide')
const mediaId = id
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide, format attendu : #RRGGBB')
const link = z
  .string()
  .max(500)
  .refine((v) => v === '' || /^(https?:\/\/|mailto:)\S+$/.test(v), 'Lien invalide')
const icon = z.enum(ICON_NAMES)
const tag = z.object({ id, text: shortText })

// Données propres à chaque forme de section

const heroData = z.object({
  location: shortText,
  name: z.string().min(1).max(80),
  nickname: z.object({ prefix: shortText, name: z.string().max(40) }),
  role: shortText,
  lead: longText,
  buttons: z.array(z.object({ id, label: shortText, target: id })).max(2),
  stats: z
    .array(
      z
        .object({ id, value: z.string().min(1).max(12), suffix: z.string().max(12), count: z.boolean(), label: shortText })
        .refine((s) => !s.count || /^\d+$/.test(s.value), {
          message: 'Seul un nombre entier peut compter',
          path: ['count'],
        }),
    )
    .max(3),
  photo: mediaId.nullable(),
})

const marqueeData = z.object({
  items: z.array(z.object({ id, text: shortText })).min(1).max(12),
})

const textData = z.object({
  paragraphs: z.array(z.object({ id, text: longText })).max(6),
  side: z
    .discriminatedUnion('kind', [
      z.object({
        kind: z.literal('card'),
        title: shortText,
        rows: z.array(z.object({ id, icon, label: shortText, value: shortText })).max(10),
      }),
      z.object({ kind: z.literal('photo'), photo: mediaId }),
    ])
    .nullable(),
})

const cardsData = z.object({
  variant: z.enum(['projects', 'tags', 'pictures']),
  items: z
    .array(
      z.object({
        id,
        // Interrupteur de la carte dans l'admin. Absent des anciens documents : visible par défaut.
        visible: z.boolean().default(true),
        icon: icon.nullable(),
        kicker: shortText,
        title: shortText,
        text: longText,
        tags: z.array(tag).max(12),
        status: z.enum(STATUS_KEYS).nullable(),
        featured: z.boolean(),
        siteUrl: link,
        codeUrl: link,
        image: mediaId.nullable(),
      }),
    )
    .max(24),
})

const timelineData = z.object({
  steps: z.array(z.object({ id, date: shortText, title: shortText, text: longText })).max(20),
  note: z.object({ label: shortText, text: longText }).nullable(),
})

const galleryData = z.object({
  items: z.array(z.object({ id, photo: mediaId, tall: z.boolean() })).max(40),
})

const linksData = z.object({
  items: z
    .array(
      z.object({
        id,
        kind: z.enum(['email', 'github', 'linkedin', 'link']),
        label: shortText,
        display: z.string().max(120),
        href: link,
      }),
    )
    .max(8),
})

// Sections

const sectionBase = {
  id,
  visible: z.boolean(),
  inMenu: z.boolean(),
  label: shortText,
  title: shortText,
  intro: longText,
  symbol: z.enum(ADINKRA_KEYS).nullable(),
  tone: z.enum(TONES),
}

export const sectionSchema = z.discriminatedUnion('type', [
  z.object({ ...sectionBase, type: z.literal('hero'), data: heroData }),
  z.object({ ...sectionBase, type: z.literal('marquee'), data: marqueeData }),
  z.object({ ...sectionBase, type: z.literal('text'), data: textData }),
  z.object({ ...sectionBase, type: z.literal('cards'), data: cardsData }),
  z.object({ ...sectionBase, type: z.literal('timeline'), data: timelineData }),
  z.object({ ...sectionBase, type: z.literal('gallery'), data: galleryData }),
  z.object({ ...sectionBase, type: z.literal('links'), data: linksData }),
])

export const themeSchema = z.object({
  colors: z.object({
    bgDark: hexColor,
    bgIndigo: hexColor,
    bgLight: hexColor,
    accent: hexColor,
    text: hexColor,
    textMuted: hexColor,
  }),
  fonts: z.object({
    heading: z.enum(HEADING_FONT_KEYS),
    body: z.enum(BODY_FONT_KEYS),
  }),
})

export const cropSchema = z.object({
  aspect: z.enum(CROP_ASPECTS),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().gt(0).max(100),
  height: z.number().gt(0).max(100),
})

export const mediaEntrySchema = z.object({
  path: z.string().regex(/^(?!.*\.\.)[a-z0-9][a-z0-9/._-]{0,200}\.webp$/, 'Chemin de photo invalide'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  crop: cropSchema.nullable(),
  caption: shortText,
  alt: i18n(400),
})

const contentShape = {
  site: z.object({
    meta: z.object({ title: shortText, description: i18n(300) }),
    contactButton: shortText,
    footer: z.object({ left: shortText, right: shortText }),
  }),
  theme: themeSchema,
  sections: z.array(sectionSchema).max(30),
}

type ContentShape = z.infer<z.ZodObject<typeof contentShape>>

/** Règles qui portent sur plusieurs sections à la fois. */
function checkSections(content: ContentShape, ctx: z.RefinementCtx) {
  const ids = new Set<string>()
  content.sections.forEach((section, index) => {
    if (ids.has(section.id)) {
      ctx.addIssue({ code: 'custom', message: `Identifiant en double : ${section.id}`, path: ['sections', index, 'id'] })
    }
    ids.add(section.id)
    if (section.type === 'cards' && section.data.items.filter((item) => item.featured).length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Un seul projet phare par section', path: ['sections', index, 'data'] })
    }
  })
  for (const type of ['hero', 'marquee'] as const) {
    if (content.sections.filter((s) => s.type === type).length > 1) {
      ctx.addIssue({ code: 'custom', message: `La section « ${type} » est unique`, path: ['sections'] })
    }
  }
  content.sections.forEach((section, index) => {
    if (section.type !== 'hero') return
    section.data.buttons.forEach((button, b) => {
      if (!ids.has(button.target)) {
        ctx.addIssue({
          code: 'custom',
          message: `Le bouton mène à une section qui n'existe pas : ${button.target}`,
          path: ['sections', index, 'data', 'buttons', b, 'target'],
        })
      }
    })
  })
}

/** Le brouillon et ce que l'admin enregistre. */
export const contentSchema = z.object(contentShape).superRefine(checkSections)

/** La version publiée : le contenu, plus la copie des photos utilisées. */
export const publishedSchema = z
  .object({ ...contentShape, media: z.record(mediaId, mediaEntrySchema) })
  .superRefine((published, ctx) => {
    checkSections(published, ctx)
    for (const ref of mediaRefs(published)) {
      if (!(ref in published.media)) {
        ctx.addIssue({ code: 'custom', message: `Photo introuvable : ${ref}`, path: ['media'] })
      }
    }
  })

export type Content = z.infer<typeof contentSchema>
export type Published = z.infer<typeof publishedSchema>
export type Section = z.infer<typeof sectionSchema>
export type SectionType = Section['type']
export type SectionOf<T extends SectionType> = Extract<Section, { type: T }>
export type Theme = z.infer<typeof themeSchema>
export type MediaEntry = z.infer<typeof mediaEntrySchema>
export type Crop = z.infer<typeof cropSchema>

/** Toutes les photos utilisées par le contenu, sans doublon. */
export function mediaRefs(content: Pick<ContentShape, 'sections'>): string[] {
  const refs = new Set<string>()
  for (const section of content.sections) {
    switch (section.type) {
      case 'hero':
        if (section.data.photo) refs.add(section.data.photo)
        break
      case 'text':
        if (section.data.side?.kind === 'photo') refs.add(section.data.side.photo)
        break
      case 'cards':
        for (const item of section.data.items) if (item.image) refs.add(item.image)
        break
      case 'gallery':
        for (const item of section.data.items) refs.add(item.photo)
        break
    }
  }
  return [...refs]
}

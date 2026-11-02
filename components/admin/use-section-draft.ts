'use client'

import { saveSection } from '@/app/admin/draft-actions'
import { sectionSchema, type Section } from '@/lib/content/schema'
import { useDraftPart } from './use-draft-part'

export type { SaveStatus } from './use-draft-part'

const options = { schema: sectionSchema, save: saveSection }

/** Brouillon d'une section : enregistrement automatique, erreurs sous les champs (voir useDraftPart). */
export function useSectionDraft<S extends Section>(initial: S, initialHash: string) {
  const { value, update, ...rest } = useDraftPart<Section>(initial, initialHash, options)
  return {
    ...rest,
    section: value as S,
    // Une section ne change jamais de forme (saveSection le refuse) : elle reste un S.
    update: update as unknown as (change: (current: S) => S) => void,
  }
}

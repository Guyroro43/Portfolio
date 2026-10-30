'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { saveSection } from '@/app/admin/draft-actions'
import { errorsByPath } from '@/lib/admin/errors'
import { sectionSchema, type Section } from '@/lib/content/schema'
import { useSaveGuard } from './save-guard'

export type SaveStatus = 'saved' | 'pending' | 'saving' | 'invalid' | 'error' | 'conflict'

const DELAY = 1000

/**
 * Brouillon d'une section : chaque modification est validée tout de suite (erreurs sous les champs),
 * puis enregistrée une seconde après la dernière frappe. Une seule requête à la fois.
 */
export function useSectionDraft<S extends Section>(initial: S, initialHash: string) {
  const router = useRouter()
  const { register } = useSaveGuard()
  const [section, setSection] = useState<S>(initial)
  const [status, setStatus] = useState<SaveStatus>('saved')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const latest = useRef(initial)
  const hash = useRef(initialHash)
  const savedVersion = useRef<Section>(initial)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inFlight = useRef<Promise<boolean> | null>(null)
  const blocked = useRef(false)

  const save = useCallback(async (): Promise<boolean> => {
    clearTimeout(timer.current)
    if (inFlight.current) await inFlight.current
    if (blocked.current) return false
    const snapshot = latest.current
    if (snapshot === savedVersion.current) return true
    if (!sectionSchema.safeParse(snapshot).success) return false

    const request = (async () => {
      setStatus('saving')
      try {
        const result = await saveSection(snapshot, hash.current)
        if (result.ok) {
          hash.current = result.hash
          savedVersion.current = snapshot
          setSavedAt(Date.now())
          setMessage(null)
          setStatus(latest.current === snapshot ? 'saved' : 'pending')
          // Met à jour la barre du haut et le menu (noms de section, « pas encore publié »).
          router.refresh()
          return true
        }
        if (result.conflict) blocked.current = true
        setStatus(result.conflict ? 'conflict' : 'error')
        setMessage(result.error)
        return false
      } catch {
        setStatus('error')
        setMessage('Connexion perdue. Vérifie ta connexion, puis clique sur Enregistrer le brouillon.')
        return false
      }
    })()
    inFlight.current = request
    const ok = await request
    inFlight.current = null
    // Des frappes sont arrivées pendant l'envoi : on repart pour un tour.
    if (ok && latest.current !== snapshot) timer.current = setTimeout(save, DELAY)
    return ok
  }, [router])

  const update = useCallback(
    (change: (current: S) => S) => {
      const next = change(latest.current as S)
      latest.current = next
      setSection(next)
      const parsed = sectionSchema.safeParse(next)
      setErrors(parsed.success ? {} : errorsByPath(parsed.error))
      clearTimeout(timer.current)
      if (blocked.current) return
      if (!parsed.success) {
        setStatus('invalid')
        return
      }
      setStatus('pending')
      timer.current = setTimeout(save, DELAY)
    },
    [save],
  )

  // Changer de page dans l'admin : on termine d'abord l'enregistrement en cours.
  useEffect(() => register(save), [register, save])

  // Fermer l'onglet avec une modification non enregistrée : le navigateur demande confirmation.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (latest.current !== savedVersion.current) event.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { section, update, save, status, errors, message, savedAt }
}

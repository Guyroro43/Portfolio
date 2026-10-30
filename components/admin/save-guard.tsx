'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createContext, use, useCallback, useMemo, useRef } from 'react'

type Flush = () => Promise<boolean>

type Guard = {
  /** Une page d'édition déclare ici comment terminer son enregistrement en cours. */
  register: (flush: Flush) => () => void
  /** Termine tous les enregistrements en cours. Faux si l'un d'eux a échoué. */
  flushAll: () => Promise<boolean>
}

const GuardContext = createContext<Guard | null>(null)

/** Enveloppe l'espace admin : avant de changer de page, on finit d'enregistrer le brouillon. */
export function SaveGuardProvider({ children }: { children: React.ReactNode }) {
  const flushes = useRef(new Set<Flush>())
  const guard = useMemo<Guard>(
    () => ({
      register(flush) {
        flushes.current.add(flush)
        return () => flushes.current.delete(flush)
      },
      async flushAll() {
        const results = await Promise.all([...flushes.current].map((flush) => flush()))
        return results.every(Boolean)
      },
    }),
    [],
  )
  return <GuardContext value={guard}>{children}</GuardContext>
}

export function useSaveGuard(): Guard {
  const guard = use(GuardContext)
  if (!guard) throw new Error('useSaveGuard doit être utilisé dans SaveGuardProvider')
  return guard
}

/** Lien interne de l'admin qui attend la fin de l'enregistrement avant de partir. */
export function GuardedLink({ href, onClick, ...props }: React.ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter()
  const { flushAll } = useSaveGuard()
  const leaving = useRef(false)

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event)
      // Nouvel onglet ou clic modifié : le navigateur s'en charge, la page actuelle reste ouverte.
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
      event.preventDefault()
      if (leaving.current) return
      leaving.current = true
      const saved = await flushAll()
      leaving.current = false
      if (saved || window.confirm('Une modification n’a pas pu être enregistrée. Quitter quand même cette page ?')) {
        router.push(href)
      }
    },
    [flushAll, href, onClick, router],
  )

  return <Link href={href} onClick={handleClick} {...props} />
}

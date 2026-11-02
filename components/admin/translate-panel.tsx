import { Languages } from 'lucide-react'
import type { ToTranslate } from '@/lib/admin/translations'
import { GuardedLink } from './save-guard'

/** « À traduire » : les écrans où des textes attendent leur version anglaise. */
export function TranslatePanel({ items }: { items: ToTranslate[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <section aria-labelledby="titre-traduire" className="flex flex-col gap-1.5 rounded-[20px] border border-line bg-white p-[22px]">
      <h2 id="titre-traduire" className="mb-1.5 flex items-center gap-2 text-[15px] font-semibold">
        <Languages size={16} aria-hidden="true" />
        À traduire{total > 0 && ` (${total})`}
      </h2>
      {items.length === 0 ? (
        <p className="text-[13px] text-ink-muted">Rien : tout le site existe en anglais.</p>
      ) : (
        <>
          <p className="text-[13px] text-ink-muted">En attendant, le site anglais affiche le texte français.</p>
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.key} className="border-t border-line-soft">
                <GuardedLink href={item.href} className="flex min-h-11 items-center justify-between gap-3 py-2 text-[13px]">
                  <span className="min-w-0 font-semibold">{item.where}</span>
                  <span className="flex-none rounded-full bg-ocre-tint px-2 py-0.5 text-[11px] font-semibold text-ocre-deep">
                    {item.count} texte{item.count > 1 ? 's' : ''}
                  </span>
                </GuardedLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

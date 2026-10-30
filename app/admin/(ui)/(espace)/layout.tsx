import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { SaveGuardProvider } from '@/components/admin/save-guard'
import { getSiteContent } from '@/lib/admin/content'
import { sectionNavItems } from '@/lib/admin/summary'

export const instant = false

// Cadre commun des pages de l'admin. getSiteContent() vérifie la session ; chaque page la
// vérifie aussi, car un layout n'est pas recalculé à chaque navigation.
export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { draft } = await getSiteContent()

  return (
    <SaveGuardProvider>
      <div className="min-h-dvh lg:flex">
        <AdminSidebar sections={sectionNavItems(draft.sections)} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </SaveGuardProvider>
  )
}

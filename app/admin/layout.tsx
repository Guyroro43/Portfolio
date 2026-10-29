import type { Metadata, Viewport } from 'next'
import './admin.css'
import { fontClassNames } from '@/lib/fonts'

// Chaque page de l'admin attend la vérification de la session avant de s'afficher :
// rien n'est pré-généré, rien n'est montré à un visiteur non connecté.
export const instant = false

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin ANASSE' },
  robots: { index: false, follow: false, nocache: true },
}

export const viewport: Viewport = {
  themeColor: '#0B0E2E',
  colorScheme: 'light',
}

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <html lang="fr" className={fontClassNames({ heading: 'bricolage-grotesque', body: 'inter' })}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  )
}

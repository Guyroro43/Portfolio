import type { Metadata, Viewport } from 'next'
import './admin.css'
import { allFontClassNames } from '@/lib/fonts'

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

// Toutes les polices du site sont déclarées (sans être téléchargées tant qu'elles ne servent pas) :
// l'écran Apparence affiche un échantillon de chacune.
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <html lang="fr" className={allFontClassNames}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  )
}

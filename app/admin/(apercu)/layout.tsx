import type { Metadata } from 'next'
import '../../globals.css'
import './apercu.css'
import { allFontClassNames } from '@/lib/fonts'

// Page d'aperçu affichée dans un cadre par l'admin : feuille de style et polices du site public,
// pas celles de l'admin. Elle attend la vérification de la session, comme le reste de l'admin.
export const instant = false

export const metadata: Metadata = {
  title: 'Aperçu',
  robots: { index: false, follow: false, nocache: true },
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={allFontClassNames}>
      <body className="antialiased">{children}</body>
    </html>
  )
}

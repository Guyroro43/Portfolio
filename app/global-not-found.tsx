import type { Metadata } from 'next'
import './globals.css'

// Page 404 des adresses qui ne correspondent à aucune route.
// Elle n'a pas accès au thème publié : elle prend les couleurs de départ et la police du système.
export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false },
}

export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body className="grid min-h-dvh place-items-center bg-bg-dark p-6 text-center text-on-dark antialiased">
        <main className="flex flex-col items-center gap-4">
          <p className="text-6xl font-extrabold text-accent">404</p>
          <p className="text-on-dark-muted">Page introuvable. Page not found.</p>
          <a href="/" className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-semibold text-bg-dark">
            Retour à l&apos;accueil
          </a>
        </main>
      </body>
    </html>
  )
}

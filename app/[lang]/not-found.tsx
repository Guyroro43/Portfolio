import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg-dark p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <p className="font-heading text-6xl font-extrabold text-accent">404</p>
        <p className="text-on-dark-muted">Page introuvable. Page not found.</p>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-semibold text-bg-dark">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}

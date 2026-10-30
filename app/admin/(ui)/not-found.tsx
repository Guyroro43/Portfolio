import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-heading text-3xl font-bold">Cette page n’existe pas</h1>
      <p className="text-ink-muted">L’adresse est peut-être incomplète, ou la section a été supprimée.</p>
      <Link href="/admin" className="inline-flex min-h-11 items-center rounded-[10px] bg-ocre px-5 font-semibold text-night">
        Revenir à la vue d’ensemble
      </Link>
    </main>
  )
}

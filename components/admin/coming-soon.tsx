/** Écran pas encore construit : une carte qui dit ce qui viendra ici. */
export function ComingSoon({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="p-4 sm:p-8">
      <section className="flex max-w-[640px] flex-col gap-2 rounded-[20px] border border-line bg-white p-6">
        <h2 className="font-heading text-xl font-bold">{title}</h2>
        <p className="text-sm leading-relaxed text-ink-muted">{children}</p>
      </section>
    </main>
  )
}

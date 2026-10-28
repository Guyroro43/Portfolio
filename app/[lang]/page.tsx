import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getContent } from '@/lib/content/get-content'
import { BODY_FONTS, HEADING_FONTS } from '@/lib/fonts-list'
import { isLocale, LOCALES, localePath, t } from '@/lib/i18n'

// Page de contrôle de l'étape 2 : thème, polices et contenu lu depuis content/seed.json.
// Elle sera remplacée par le site complet à l'étape 3.

const THEME_SWATCHES = [
  { name: 'Fond sombre', key: 'bgDark', cls: 'bg-bg-dark' },
  { name: 'Fond indigo', key: 'bgIndigo', cls: 'bg-bg-indigo' },
  { name: 'Fond clair', key: 'bgLight', cls: 'bg-bg-light' },
  { name: 'Accent', key: 'accent', cls: 'bg-accent' },
  { name: 'Texte principal', key: 'text', cls: 'bg-ink' },
  { name: 'Texte secondaire', key: 'textMuted', cls: 'bg-ink-muted' },
] as const

const DERIVED_SWATCHES = [
  { name: 'Clair alterné', cls: 'bg-bg-light-alt' },
  { name: 'Ocre foncé', cls: 'bg-accent-ink' },
  { name: 'Texte courant', cls: 'bg-ink-soft' },
  { name: 'Libellés', cls: 'bg-ink-label' },
  { name: 'Bordure', cls: 'bg-line' },
  { name: 'Étiquette', cls: 'bg-chip' },
  { name: 'Pastille ocre', cls: 'bg-tile-warm' },
  { name: 'Pastille indigo', cls: 'bg-tile-indigo' },
  { name: 'Indigo vif', cls: 'bg-indigo-bright' },
  { name: 'Texte pâle sur foncé', cls: 'bg-on-dark-muted' },
  { name: 'Menu sur foncé', cls: 'bg-on-dark-nav' },
  { name: 'Surface foncée', cls: 'bg-surface-dark' },
] as const

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const content = await getContent()
  const { theme, sections } = content
  const hero = sections.find((s) => s.type === 'hero')

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-16 px-4 py-10 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-heading text-[22px] font-extrabold">
          ANASSE<span className="text-accent">.</span>
          <span className="ml-3 align-middle text-sm font-medium text-on-dark-faint">Étape 2, page de contrôle</span>
        </p>
        <nav aria-label="Langue du site" className="flex rounded-full border border-white/15 p-1">
          {LOCALES.map((code) => (
            <Link
              key={code}
              href={localePath(code)}
              aria-current={code === lang ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold uppercase ${code === lang ? 'bg-accent text-bg-dark' : 'text-on-dark-nav'}`}
            >
              {code}
            </Link>
          ))}
        </nav>
      </header>

      {hero && (
        <section className="flex flex-col gap-6">
          <h1 className="font-heading text-5xl leading-[0.98] font-extrabold tracking-[-0.025em] text-balance sm:text-[78px]">
            {hero.data.name}
          </h1>
          <p className="font-heading text-2xl font-semibold text-on-dark-nav sm:text-[30px]">
            {t(hero.data.nickname.prefix, lang)}{' '}
            <span className="font-extrabold tracking-[0.02em] text-accent">{hero.data.nickname.name}</span>
          </p>
          <span aria-hidden="true" className="block h-1 w-[132px] rounded bg-accent" />
          <p className="text-[22px] font-semibold">{t(hero.data.role, lang)}</p>
          <p className="max-w-[560px] text-[17px] leading-[1.65] text-pretty text-on-dark-muted">{t(hero.data.lead, lang)}</p>
        </section>
      )}

      <section className="flex flex-col gap-6 rounded-3xl bg-bg-light p-6 text-ink sm:p-8">
        <h2 className="font-heading text-3xl font-bold">Les 6 couleurs du thème</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {THEME_SWATCHES.map((swatch) => (
            <li key={swatch.key} className="flex flex-col gap-2">
              <span className={`h-20 rounded-2xl border border-line ${swatch.cls}`} />
              <span className="text-sm font-semibold">{swatch.name}</span>
              <span className="font-mono text-xs text-ink-label">{theme.colors[swatch.key]}</span>
            </li>
          ))}
        </ul>
        <h2 className="font-heading text-2xl font-bold">Teintes calculées</h2>
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {DERIVED_SWATCHES.map((swatch) => (
            <li key={swatch.cls} className="flex flex-col gap-2">
              <span className={`h-14 rounded-xl border border-line ${swatch.cls}`} />
              <span className="text-xs text-ink-soft">{swatch.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-3xl bg-bg-indigo p-6 sm:p-8">
          <p className="text-sm font-semibold tracking-[0.04em] text-accent">Titres</p>
          <p className="font-heading text-4xl font-bold">{HEADING_FONTS[theme.fonts.heading]}</p>
          <p className="font-heading text-xl font-semibold text-on-dark-muted">
            Aa Bb Cc, é è à ç ô, 0123456789
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-3xl bg-bg-indigo p-6 sm:p-8">
          <p className="text-sm font-semibold tracking-[0.04em] text-accent">Texte</p>
          <p className="text-4xl font-semibold">{BODY_FONTS[theme.fonts.body]}</p>
          <p className="text-base leading-relaxed text-on-dark-muted">
            Aa Bb Cc, é è à ç ô, 0123456789. Le texte courant reste lisible à petite taille.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-bg-light-alt p-6 text-ink sm:p-8">
        <h2 className="font-heading text-3xl font-bold">Sections lues dans le JSON ({sections.length})</h2>
        <ol className="flex flex-col divide-y divide-line">
          {sections.map((section, index) => (
            <li key={section.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
              <span className="w-8 font-mono text-sm text-ink-label">{String(index).padStart(2, '0')}</span>
              <span className="font-semibold">{t(section.label, lang)}</span>
              <span className="text-ink-muted">{t(section.title, lang)}</span>
              <span className="ml-auto rounded-lg bg-chip px-2.5 py-1 font-mono text-xs text-ink-muted">{section.type}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

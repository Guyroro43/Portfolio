import type { Metadata } from 'next'
import '../globals.css'
import { getContent } from '@/lib/content/get-content'
import { fontClassNames } from '@/lib/fonts'
import { DEFAULT_LOCALE, isLocale, LOCALES, localePath, t } from '@/lib/i18n'
import { SITE_URL } from '@/lib/site'
import { themeCss } from '@/lib/theme'

// Les pages publiques sont entièrement pré-générées : le build échoue si quelque chose
// les rendait dépendantes de la requête.
export const ensureStatic = 'navigation'

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const { site } = await getContent()
  return {
    metadataBase: new URL(SITE_URL),
    title: t(site.meta.title, locale),
    description: t(site.meta.description, locale),
    alternates: {
      canonical: localePath(locale),
      languages: { fr: '/', en: '/en', 'x-default': '/' },
    },
    openGraph: {
      type: 'website',
      title: t(site.meta.title, locale),
      description: t(site.meta.description, locale),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
  }
}

export default async function SiteLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const { theme } = await getContent()

  return (
    <html lang={locale} className={fontClassNames(theme.fonts)}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      </head>
      <body className="bg-bg-dark text-on-dark antialiased">{children}</body>
    </html>
  )
}

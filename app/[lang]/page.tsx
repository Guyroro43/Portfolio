import { notFound } from 'next/navigation'
import { SitePage } from '@/components/site/site-page'
import { getContent } from '@/lib/content/get-content'
import { isLocale } from '@/lib/i18n'

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const content = await getContent()
  return <SitePage content={content} lang={lang} />
}

import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { DraftBanner } from '@/components/site/draft-banner'
import { SitePage } from '@/components/site/site-page'
import { getContent } from '@/lib/content/get-content'
import { isLocale } from '@/lib/i18n'

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const content = await getContent()
  // Toujours faux pendant la génération des pages : le bandeau n'existe que dans l'aperçu de l'admin.
  const { isEnabled: preview } = await draftMode()

  return (
    <>
      <SitePage content={content} lang={lang} />
      {preview && <DraftBanner />}
    </>
  )
}

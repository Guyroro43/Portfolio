// Script d'import : remplit Supabase avec le contenu de départ.
// Usage : npm run seed            (s'arrête si le brouillon existe déjà)
//         npm run seed -- --force (remplace le brouillon et la version publiée)
//
// 1. Envoie les photos de content/images/ dans le bucket media, sous un nom unique.
// 2. Crée leurs lignes dans la table media.
// 3. Écrit content/seed.json dans le brouillon et dans la version publiée, plus une première version.
//
// Il utilise la clé secrète de .env.local : il ne tourne que sur ce PC, jamais sur Vercel.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import mediaSeed from '@/content/media.json'
import contentSeed from '@/content/seed.json'
import { contentSchema, mediaEntrySchema, mediaRefs, publishedSchema, type MediaEntry } from '@/lib/content/schema'

async function main() {
  process.loadEnvFile('.env.local')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !secretKey) fail('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manque dans .env.local')
  const force = process.argv.includes('--force')

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  // Le contenu de départ est validé avant toute écriture.
  const draft = contentSchema.parse(contentSeed)

  const { data: existing, error: readError } = await supabase
    .from('site_content')
    .select('key')
    .eq('key', 'draft')
    .maybeSingle()
  if (readError) fail(`Lecture de site_content impossible (le SQL a-t-il été lancé ?) : ${readError.message}`)
  if (existing && !force) {
    fail('Le brouillon existe déjà. Relance avec « npm run seed -- --force » pour le remplacer par le contenu de départ.')
  }

  console.log('Photos :')
  const media: Record<string, MediaEntry> = {}
  for (const [id, source] of Object.entries(mediaSeed)) {
    const file = readFileSync(join('content', source.path))
    // Nom tiré du contenu : une photo modifiée aura un autre nom, donc jamais d'ancienne version en cache.
    const hash = createHash('sha256').update(file).digest('hex').slice(0, 10)
    const entry = mediaEntrySchema.parse({ ...source, path: `${id}-${hash}.webp` })

    const { error } = await supabase.storage.from('media').upload(entry.path, file, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true,
    })
    if (error) fail(`Envoi de ${source.path} impossible : ${error.message}`)

    media[id] = entry
    console.log(`  ${entry.path} (${Math.round(file.length / 1024)} Ko)`)
  }

  const { error: mediaError } = await supabase
    .from('media')
    .upsert(Object.entries(media).map(([id, entry]) => ({ id, ...entry })), { onConflict: 'id' })
  if (mediaError) fail(`Écriture de la table media impossible : ${mediaError.message}`)

  // La version publiée embarque la copie des photos qu'elle utilise.
  const published = publishedSchema.parse({
    ...draft,
    media: Object.fromEntries(mediaRefs(draft).map((id) => [id, media[id]])),
  })

  const { error: contentError } = await supabase.from('site_content').upsert(
    [
      { key: 'draft', content: draft },
      { key: 'published', content: published },
    ],
    { onConflict: 'key' },
  )
  if (contentError) fail(`Écriture du contenu impossible : ${contentError.message}`)

  const { error: versionError } = await supabase.from('site_versions').insert({ content: published })
  if (versionError) fail(`Écriture de la première version impossible : ${versionError.message}`)

  console.log(`\nTerminé : ${Object.keys(media).length} photos, brouillon et version publiée écrits.`)
}

function fail(message: string): never {
  console.error(`\nArrêt : ${message}`)
  process.exit(1)
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)))

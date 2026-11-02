import type { SupabaseClient } from '@supabase/supabase-js'

/** Le fichier envoyé par le navigateur est-il bien dans le bucket ? */
export async function fileExists(supabase: SupabaseClient, path: string) {
  const { data } = await supabase.storage.from('media').list('', { search: path, limit: 5 })
  return !!data?.some((object) => object.name === path)
}

/**
 * Efface du bucket les fichiers qui ne servent plus : ni dans la table media, ni dans la version
 * en ligne, ni dans les publications précédentes (qu'on peut remettre dans le brouillon).
 * Un fichier de moins d'une heure est gardé (envoi en cours dans un autre onglet).
 * Appelée par des actions qui ont déjà vérifié l'admin, avec sa session (règles RLS du stockage).
 */
export async function removeOrphanFiles(supabase: SupabaseClient) {
  const [{ data: objects }, { data: rows }, { data: published }, { data: versions }] = await Promise.all([
    supabase.storage.from('media').list('', { limit: 1000 }),
    supabase.from('media').select('path'),
    supabase.from('site_content').select('content').eq('key', 'published').single(),
    supabase.from('site_versions').select('content'),
  ])
  // Une lecture a échoué : dans le doute, on n'efface rien.
  if (!objects || !rows || !published || !versions) return

  const keep = new Set(rows.map((row) => row.path as string))
  for (const { content } of [published, ...versions]) {
    const media = (content as { media?: Record<string, { path?: string }> }).media ?? {}
    for (const entry of Object.values(media)) if (entry.path) keep.add(entry.path)
  }

  const hourAgo = Date.now() - 3600_000
  const orphans = objects
    .filter((object) => object.id && object.created_at && !keep.has(object.name) && new Date(object.created_at).getTime() < hourAgo)
    .map((object) => object.name)
  if (orphans.length) await supabase.storage.from('media').remove(orphans)
}

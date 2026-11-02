import { timingSafeEqual } from 'node:crypto'
import { createPublicClient } from '@/lib/supabase/public'

/**
 * Tâche anti-pause (vercel.json, une fois par jour) : un projet Supabase gratuit se met en pause
 * après une semaine sans activité. Une lecture d'une ligne suffit à l'en empêcher.
 * Lire l'en-tête de la requête rend la route dynamique : jamais mise en cache, elle touche la base à chaque appel.
 */
export async function GET(request: Request) {
  if (!fromVercelCron(request.headers.get('authorization'))) {
    return Response.json({ ok: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  const { error } = await createPublicClient().from('site_content').select('key').eq('key', 'published').limit(1)
  // Vercel ne relance pas une tâche en échec : le statut 503 la signale dans ses journaux.
  return Response.json({ ok: !error }, { status: error ? 503 : 200, headers: { 'Cache-Control': 'no-store' } })
}

/**
 * Vercel envoie « Authorization: Bearer CRON_SECRET » quand la variable existe.
 * Sans variable (ou trop courte), tout est refusé. Comparaison à durée constante.
 */
function fromVercelCron(header: string | null) {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 16 || !header) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(header)
  return received.length === expected.length && timingSafeEqual(received, expected)
}

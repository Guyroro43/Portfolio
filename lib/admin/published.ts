import { mediaRefs, type Content, type Published } from '@/lib/content/schema'

/**
 * La version publiée : le contenu, plus la copie des photos qu'il utilise (chemin, taille,
 * légende...). Le site public lit ainsi une seule ligne. Une photo introuvable est laissée
 * de côté : publishedSchema la signale ensuite.
 */
export function buildPublished(content: Content, library: Published['media']): Published {
  const media = Object.fromEntries(mediaRefs(content).flatMap((id) => (library[id] ? [[id, library[id]]] : [])))
  return { ...content, media }
}

// Compression dans le navigateur, avant l'envoi : WebP, 2000 px au plus sur le grand côté.
// Le plan gratuit de Supabase ne transforme pas les images : on envoie directement la bonne taille.

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIDE = 2000
const QUALITY = 0.82

export type CompressedImage = { blob: Blob; width: number; height: number }

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error(`${file.name} : seuls les JPG, PNG et WebP sont acceptés.`)

  let bitmap: ImageBitmap
  try {
    // from-image : une photo de téléphone tournée s'affiche dans le bon sens.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`${file.name} : impossible de lire cette image.`)
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Ton navigateur ne permet pas de compresser les photos.')
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
  // Certains navigateurs renvoient du PNG quand ils ne savent pas écrire le WebP.
  if (!blob || blob.type !== 'image/webp') throw new Error('Ton navigateur ne sait pas créer de WebP : utilise Chrome, Edge ou Firefox.')
  return { blob, width, height }
}

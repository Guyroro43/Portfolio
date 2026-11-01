/**
 * Identifiant d'un nouvel élément (paragraphe, étape, carte...) : 10 caractères hexadécimaux,
 * acceptés par le schéma. getRandomValues marche aussi hors HTTPS, contrairement à randomUUID.
 */
export function newId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(5)), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

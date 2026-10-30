import type { z } from 'zod'

/** Message lisible pour une erreur de validation, en français. */
export function issueMessage(issue: z.core.$ZodIssue): string {
  switch (issue.code) {
    case 'too_big':
      return issue.origin === 'array' ? `${issue.maximum} éléments au plus.` : `${issue.maximum} caractères au plus.`
    case 'too_small':
      return issue.origin === 'array' ? `Il en faut au moins ${issue.minimum}.` : 'Ce champ ne peut pas rester vide.'
    case 'invalid_value':
    case 'invalid_type':
    case 'invalid_union':
      return 'Valeur invalide.'
    default:
      // Les messages écrits dans le schéma (lien, couleur, compteur...) sont déjà en français.
      return issue.message
  }
}

/** Erreurs rangées par chemin (« title.fr », « data.items.2.href ») pour les afficher sous chaque champ. */
export function errorsByPath(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    errors[key] ??= issueMessage(issue)
  }
  return errors
}

/** Première erreur, pour un message général. */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0]
  return issue ? issueMessage(issue) : 'Contenu invalide.'
}

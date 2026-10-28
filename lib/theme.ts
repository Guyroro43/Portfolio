import { themeSchema, type Theme } from './content/schema'

/**
 * Variables CSS du thème publié. Les teintes secondaires (bordures, étiquettes, textes pâles)
 * en sont dérivées dans app/globals.css, donc changer une couleur met tout le site à jour.
 * Le résultat est écrit tel quel dans une balise <style> : le thème est revalidé ici, ce qui
 * garantit des couleurs #RRGGBB et des polices de la liste, rien d'autre.
 */
export function themeCss(theme: Theme): string {
  const { colors, fonts } = themeSchema.parse(theme)
  const declarations = [
    `--c-bg-dark:${colors.bgDark}`,
    `--c-bg-indigo:${colors.bgIndigo}`,
    `--c-bg-light:${colors.bgLight}`,
    `--c-accent:${colors.accent}`,
    `--c-text:${colors.text}`,
    `--c-text-muted:${colors.textMuted}`,
    `--f-heading:var(--font-${fonts.heading})`,
    `--f-body:var(--font-${fonts.body})`,
  ]
  // html:root l'emporte sur les valeurs de départ de globals.css, quel que soit l'ordre des balises.
  return `html:root{${declarations.join(';')}}`
}

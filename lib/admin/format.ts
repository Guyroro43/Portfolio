/** « 29 octobre 2026, 9 h 12 », à l'heure d'Abidjan. */
export function formatDate(iso: string): string {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Abidjan',
  }).formatToParts(new Date(iso))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('day')} ${part('month')} ${part('year')}, ${Number(part('hour'))} h ${part('minute')}`
}

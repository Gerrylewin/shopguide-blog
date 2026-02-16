/**
 * Format a date for display. Uses the calendar date (year, month, day) so the
 * same day is shown in all timezones. Avoids UTC midnight being displayed
 * as the previous day in US timezones (e.g. 2025-02-15 showing as Feb 14).
 */
export function formatDate(date: string, locale = 'en-US'): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const dateStr = typeof date === 'string' ? date : String(date)
  const datePart = dateStr.split('T')[0]
  if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split('-').map(Number)
    const localDate = new Date(y, m - 1, d)
    return localDate.toLocaleDateString(locale, options)
  }
  return new Date(date).toLocaleDateString(locale, options)
}

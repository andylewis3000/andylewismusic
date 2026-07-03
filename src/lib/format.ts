/**
 * Formatting helpers for dates and related display strings.
 * All dates render in the site locale (en-GB) for consistency.
 */
import { site } from './settings';

const LOCALE = site.locale.replace('_', '-');

/** e.g. "3 October 2025" */
export function formatDate(date: Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, opts ?? { day: 'numeric', month: 'long', year: 'numeric' }).format(
    date
  );
}

/** Machine-readable ISO string for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString();
}

/** Just the year, e.g. "2025". */
export function year(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, { year: 'numeric' }).format(date);
}

/** Structured parts for event date badges. */
export function eventDateParts(date: Date) {
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(LOCALE, o).format(date);
  return {
    day: fmt({ day: '2-digit' }),
    month: fmt({ month: 'short' }).toUpperCase(),
    weekday: fmt({ weekday: 'short' }),
    year: fmt({ year: 'numeric' }),
    time: fmt({ hour: '2-digit', minute: '2-digit' }),
    full: fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

/** Human reading time from a word count. */
export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

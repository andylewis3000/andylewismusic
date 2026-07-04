/**
 * Shared types + helpers for section blocks (the composable page library).
 * Every block accepts the same prop shape so SectionRenderer can spread into
 * any of them uniformly.
 */
import type { Tone } from './pages';

export interface BlockProps {
  heading?: string;
  subheading?: string;
  /** Markdown body, used by the rich-text block. */
  body?: string;
  /** Max items for list blocks. `0` means "all"; undefined uses the default. */
  limit?: number;
  tone?: Tone;
  backgroundImage?: string;
  backgroundAlt?: string;
  parallax?: boolean;
}

/** Slice a list for a block: `0` = all, undefined = default count. */
export function take<T>(arr: T[], limit: number | undefined, def: number): T[] {
  if (limit === 0) return arr;
  return arr.slice(0, limit ?? def);
}

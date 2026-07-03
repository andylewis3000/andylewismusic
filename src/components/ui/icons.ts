/**
 * Icon definitions — shared type + SVG path data.
 * Kept in a plain .ts module so the type can be imported anywhere (exporting
 * types from .astro files is unreliable). Icon.astro renders these.
 */
export type IconName =
  | 'menu'
  | 'close'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'search'
  | 'calendar'
  | 'instagram'
  | 'youtube'
  | 'spotify'
  | 'appleMusic'
  | 'bandcamp'
  | 'soundcloud'
  | 'tiktok'
  | 'facebook'
  | 'x'
  | 'email'
  | 'rss';

/** Icons that render filled (fill=currentColor) rather than stroked. */
export const solidIcons = new Set<IconName>(['bandcamp', 'facebook', 'x']);

/** Inner SVG markup for each icon, drawn on a 24×24 viewBox. */
export const iconBodies: Record<IconName, string> = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-up-right': '<path d="M7 17L17 7M9 7h8v8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="16.8" cy="7.2" r="1.1" fill="currentColor" stroke="none"/>',
  youtube:
    '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.2l5 2.8-5 2.8z" fill="currentColor" stroke="none"/>',
  spotify:
    '<circle cx="12" cy="12" r="9.2"/><path d="M7 10c3.2-1 7.4-.6 10 1.2"/><path d="M7.6 13c2.6-.8 6.2-.4 8.4 1.1"/><path d="M8.2 15.6c2-.6 4.7-.3 6.3.8"/>',
  appleMusic:
    '<path d="M9 18.5a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z"/><path d="M9 14.3V6.6l8-1.6v8.1"/><path d="M17 15.1a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4z"/>',
  bandcamp: '<path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z"/>',
  soundcloud:
    '<path d="M8 17V11M5 17v-4M11 17V9M14 17V8a4 4 0 014 4h.5a2.5 2.5 0 010 5H14z"/>',
  tiktok: '<path d="M14 4v9.5a3.5 3.5 0 11-3.5-3.5"/><path d="M14 6.5A4.5 4.5 0 0018.5 11"/>',
  facebook:
    '<path d="M15.5 8.5H14c-.7 0-1 .4-1 1v1.8h2.4l-.4 2.6H13V21h-2.8v-6.1H8.2v-2.6h2V9.2C10.2 7 11.5 6 13.4 6c.9 0 1.7.1 2.1.1z"/>',
  x: '<path d="M18.9 2.5h3.3l-7.2 8.2 8.5 11.3h-6.6l-5.2-6.8-6 6.8H2.4l7.7-8.8L2 2.5h6.8l4.7 6.2 5.4-6.2z"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/>',
  rss: '<circle cx="6" cy="18" r="1.6" fill="currentColor" stroke="none"/><path d="M5 11a8 8 0 018 8"/><path d="M5 5.5A12.5 12.5 0 0117.5 18"/>',
};

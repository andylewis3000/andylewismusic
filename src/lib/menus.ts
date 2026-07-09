/**
 * Menus — resolve the CMS "Menus" collection into concrete link lists for the
 * header and footer.
 *
 * A menu is a list of groups; each group has links that point at a page (by
 * slug) or a custom URL. Publishing a menu means setting its `location` to
 * `main` (header) or `footer`. When a location has a published menu it replaces
 * the built-in navigation/footer settings; otherwise those settings are the
 * fallback so the site always has a menu.
 */
import { getCollection } from 'astro:content';
import { navigation, footer } from './settings';
import { getHiddenHrefs, filterLinks } from './pages';

export type MenuLink = { label: string; href: string };
export type MenuColumn = { heading: string; links: MenuLink[] };

async function pageTitles(): Promise<Map<string, string>> {
  const pages = await getCollection('pages');
  return new Map(pages.map((p) => [p.id, p.data.title]));
}

/** Turn one menu item into a { label, href }, or null if it points nowhere. */
function resolveLink(
  link: { label?: string; page?: string; url?: string },
  titles: Map<string, string>
): MenuLink | null {
  const page = link.page?.trim();
  const url = link.url?.trim();
  let href: string;
  let label = link.label?.trim() ?? '';

  if (page) {
    href = `/${page}/`;
    if (!label) label = titles.get(page) ?? page;
  } else if (url) {
    href = url;
  } else {
    return null;
  }
  if (!label) label = href;
  return { label, href };
}

async function menuForLocation(location: 'main' | 'footer') {
  const menus = await getCollection('menus');
  // First published menu wins — keep one menu per location.
  return menus.find((m) => m.data.location === location);
}

/** Header navigation. Falls back to the Navigation settings when unpublished. */
export async function getMainMenu(): Promise<MenuLink[]> {
  const hidden = await getHiddenHrefs();
  const menu = await menuForLocation('main');

  if (menu) {
    const titles = await pageTitles();
    const links = menu.data.groups
      .flatMap((g) => g.links)
      .map((l) => resolveLink(l, titles))
      .filter((l): l is MenuLink => l !== null);
    const visible = filterLinks(links, hidden);
    if (visible.length) return visible;
  }

  return filterLinks(navigation.primary, hidden);
}

/** Footer link columns. Falls back to the Footer settings when unpublished. */
export async function getFooterMenu(): Promise<MenuColumn[]> {
  const hidden = await getHiddenHrefs();
  const menu = await menuForLocation('footer');

  if (menu) {
    const titles = await pageTitles();
    const columns = menu.data.groups
      .map((g) => ({
        heading: g.heading?.trim() ?? '',
        links: filterLinks(
          g.links.map((l) => resolveLink(l, titles)).filter((l): l is MenuLink => l !== null),
          hidden
        ),
      }))
      .filter((c) => c.links.length > 0);
    if (columns.length) return columns;
  }

  return footer.columns
    .map((c) => ({ heading: c.heading, links: filterLinks(c.links, hidden) }))
    .filter((c) => c.links.length > 0);
}

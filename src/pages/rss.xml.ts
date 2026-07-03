/**
 * RSS feed for the News/Blog section. Served at /rss.xml.
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '@lib/content';
import { site } from '@lib/settings';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.name} — News`,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
    customData: `<language>${site.locale.replace('_', '-')}</language>`,
  });
}

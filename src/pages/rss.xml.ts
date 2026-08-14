import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../lib/profile';

export async function GET(context: APIContext) {
  const posts = (await getCollection('writing'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

  return rss({
    title: `${SITE.name} — Writing`,
    description: 'Technical write-ups on architecture, Linux and software engineering.',
    site: context.site ?? SITE.github,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/writing/${post.id}/`,
    })),
  });
}
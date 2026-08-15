import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    year: z.string(),
    order: z.number(),
    status: z.enum(['featured', 'additional']),
    summary: z.string(),
    tags: z.array(z.string()),
    repo: z.string().url(),
    /** Ordered case-study sections: problem / architecture / implementation ... */
    sections: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        /** short supporting note shown as a caption under the section title */
        note: z.string().optional(),
      }),
    ),
    metrics: z.array(z.string()).optional(),
  }),
});

export const collections = { projects };

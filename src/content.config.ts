import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Load Markdown and MDX files in the `src/content/blog/` directory.
const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// Optional. With no image the post gets a generated hatch banner instead.
			heroImage: z.optional(image()),
			heroCaption: z.string().optional(),
			// Shown as the ember eyebrow above the title, e.g. 'Engineering'.
			category: z.string().optional(),
			// Drives /topics and /topics/<tag>.
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };

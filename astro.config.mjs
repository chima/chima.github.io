// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Fonts are loaded from Google Fonts in BaseHead.astro (Source Serif 4 + IBM Plex Mono).
// The old local Atkinson provider is gone — src/assets/fonts/ can be deleted.
export default defineConfig({
	site: 'https://chima.github.io',
	integrations: [mdx(), sitemap()],
});

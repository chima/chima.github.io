// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// Fonts are downloaded at build time and served from this origin — no request ever
// reaches Google. `latin-ext` is not optional: Croatian diacritics (č ć š ž đ) live
// there, and the site writes them (Omiš on /now).
export default defineConfig({
	site: 'https://chima.github.io',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Source Serif 4',
			cssVariable: '--font-serif',
			// Variable font: one range covers every weight the design uses.
			weights: ['300 700'],
			styles: ['normal', 'italic'],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['Georgia', 'Times New Roman', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-mono',
			weights: [400, 500, 600],
			styles: ['normal'],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
		},
	],
});

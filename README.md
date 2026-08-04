# chima.github.io

Source for **Chima's cavern** — a personal site and blog. Static, built with Astro,
deployed to GitHub Pages at <https://chima.github.io>.

Mostly engineering notes. Written to think, published in case it helps.

## Stack

- [Astro](https://astro.build) 7, static output, zero client-side JavaScript
- `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`
- Hand-written CSS in `src/styles/global.css` — no framework, no build-time CSS tooling
- Dark palette only, no theme toggle. See [DESIGN.md](DESIGN.md)
- No analytics, no tracking, no cookie banner, no forms

Requires Node 22.12 or newer.

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server on `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Serve the built output locally |
| `npm run astro check` | Type-check components and content frontmatter |

## Structure

```text
src/
├── components/    BaseHead, Header, Footer, PostList, HatchBanner, PullQuote, Sidenote
├── content/blog/  posts, one Markdown file each
├── layouts/       Base (shell) and BlogPost (reading column)
├── lib/posts.ts   shared post queries — sorting, draft filtering, tag collection
├── pages/         routes; file name is the URL
├── styles/        global.css, the whole stylesheet
├── consts.ts      site title, description, author, email, links
└── content.config.ts   the blog collection schema
public/            favicons, served from the root
```

Routes: `/`, `/blog`, `/blog/<slug>`, `/topics`, `/topics/<tag>`, `/about`, `/now`,
`/contact`, plus `/rss.xml` and `/sitemap-index.xml`.

## Writing a post

Add a Markdown file to `src/content/blog/`. The file name becomes the URL slug.
Frontmatter is validated against the schema in `src/content.config.ts`:

```yaml
---
title: Taking apart the blog
description: One sentence, used in listings, RSS, and meta tags.
pubDate: 2026-08-03
updatedDate: 2026-08-04   # optional
category: Engineering     # optional, shown as the eyebrow above the title
tags: [astro, design]     # optional, drives /topics
heroImage: ../../assets/thing.jpg   # optional; omit for a generated hatch banner
heroCaption: What the image shows.  # optional
draft: false              # true keeps it out of listings, RSS, and the sitemap
---
```

A post with no `heroImage` gets a `HatchBanner` — a CSS band carrying the title's
initial. That is deliberate; do not fill the slot with stock art.

## Deploying

Push to `main`. `.github/workflows/deploy.yml` builds with `withastro/action` and
publishes to GitHub Pages. There is no staging environment and no PR flow.

`site:` in `astro.config.mjs` must match the deployed origin — it is compiled into the
sitemap and the RSS feed's absolute URLs at build time.

## Notes for contributors and agents

[DESIGN.md](DESIGN.md) holds the design rules and the colour and type tokens.
[CLAUDE.md](CLAUDE.md) holds instructions for coding agents.

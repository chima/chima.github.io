# Design notes — Chima's cavern

Direction: **Quiet Press, dark only**. There is no light theme and no theme toggle.
If you add one later, tune it as its own palette — do not invert these values.

## Colour

| Token | Value | Used for |
| --- | --- | --- |
| `--bg` | #211f1c | page ground (warm graphite) |
| `--bg-elevated` | #282520 | code blocks |
| `--bg-code` | #2e2b25 | inline code |
| `--bg-slot` | #2b2823 | hatch banner ground |
| `--footer-bg` | #1b1916 | footer |
| `--rule` | #302d28 | list dividers |
| `--rule-strong` | #35322c | section rules |
| `--border` | #423e36 | tag outlines |
| `--heading` | #f4f1e8 | headings, post titles |
| `--text` | #e0dbd0 | body copy |
| `--text-secondary` | #c3bdb0 | descriptions, taglines |
| `--text-muted` | #9c9486 | dates, labels, captions |
| `--accent` | #d98a5f | ember: links, eyebrows, pull-quote rule |

Every text colour above clears WCAG AA (4.5:1) on its background. `--text-muted`
is the floor at 5.47:1 — do not lighten the ground or darken that grey.

## Type

- **Source Serif 4** — everything you read. Body 20px / 1.72, measure 34em.
- **IBM Plex Mono** — everything you scan. Dates, labels, captions, sidenotes, code.
- Wordmark: all caps mono, .24em tracking. No italic, no cursive.
- Headings are serif, weight 400 for page titles and 600 for in-post h2.

## Rules that matter

1. **No stock photography.** A post without a photo gets `HatchBanner` — a CSS hatch
   band carrying the title's initial. Never fill the slot with generic art.
2. **One pull-quote treatment**: 2px ember rule on the left, italic serif. See
   `PullQuote.astro`. Do not add centred or quote-mark variants.
3. **Captions** are mono, small, left-aligned. Never centred.
4. **Metadata never interrupts the reading column** — it sits above the title or in
   the margin as a sidenote.
5. Navigation is two-tier: Writing / About / RSS in the header, everything else in
   the footer directory. Do not grow the header.
6. No forms, no newsletter box, no cookie banner, no tracking.

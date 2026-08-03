---
title: 'Taking apart the blog'
description: 'The site was still the Astro starter. A day of decisions later, it is not.'
pubDate: 'Aug 03 2026'
category: 'Notes'
tags: ['design', 'astro', 'tooling']
draft: false
---

Until today this site said **Astro Blog** at the top and **Your name here** at the
bottom. The three social links in the header pointed at Astro's own accounts. Every
post carried the same stock photograph, because the starter ships with five of them
and I had never swapped any of them out.

That is not a complaint about the starter. It is a starter. The problem was that I had
been treating *set up a blog* and *have a blog* as the same task.

## Three directions, one chosen

I looked at three of them side by side rather than arguing about one in the abstract.

One was reading-first: serif, warm ground, a dated list, almost no furniture. One
leaned hard into the name — dark, textured, a landing page with projects and a *now*
strip. The third was a card catalog, where the homepage *is* the archive, built for
someone posting weekly.

I picked the first and made it dark only. Not dark *mode* — dark, full stop. A toggle
means designing two palettes and maintaining both, and I would only ever use one.
Dropping it also removed the one control in the header, which turned out to be the
best thing about the decision.

## The rules that came out of it

Four decisions did most of the work:

- **A measure, and a real one.** 34em, about 68 characters. Everything else on the
  page arranges itself around that column.
- **Two typefaces with different jobs.** Source Serif 4 for anything you read. IBM
  Plex Mono for anything you scan — dates, labels, captions, code. Once that split
  existed, every "what size should this be" question answered itself.
- **No stock photography, ever.** A post with no photo now gets a hatch band drawn in
  CSS carrying the title's first letter. It costs nothing, it never rots, and it never
  looks like a photo I forgot to replace.
- **One pull quote.** Left ember rule, italic serif. I was shown three treatments and
  wanted two of them. Picking one was the more useful answer.

## What I got wrong

Two things, both worth recording.

I said "tagline" and meant the small orange line under the title. It got built as an
italic serif line instead, which is a perfectly good tagline treatment and not the one
I had in my head. That is what happens when you name a slot by its content instead of
pointing at it.

The other was contrast. The first pass had dates and captions in a grey that measured
2.4:1 against the background. It looked right and was unreadable. Metadata is the
layer most likely to be set too quiet, because it is the layer you are least likely to
actually read while you are designing.

> You don't find out whether a design works by looking at it. You find out by having
> to write in it.

Which is why this post exists. It is the first real thing in the new layout, and it
has already done its job: it has a heading structure, a list, inline `code`, a pull
quote and no hero image, and every one of those was a thing I had to decide about
rather than assume.

## Writing the decisions down

The last step was the least interesting and probably the most valuable. The palette,
the type scale and the rules above now live in a `DESIGN.md` in the repository, next
to the code they describe.

Not for other people. For me in four months, when I want to add a page and cannot
remember whether captions were centred.

I did all of this from a beach in Omiš, which is either a good sign for the process or
a bad sign for the holiday.

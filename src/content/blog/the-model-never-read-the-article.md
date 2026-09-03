---
title: 'The model never read the article'
description: 'A drafting tool that had been writing from search snippets for months, the checker that cried wolf, and what I learned turning both around.'
pubDate: 'Sep 03 2026'
category: 'Build log'
tags: ['llm', 'architecture', 'testing']
draft: false
---

I have been building a drafting tool that runs two profiles off one codebase, a
different prompt in each. Every morning it is supposed to find ten stories from the last
seventy-two hours and rewrite each one in house style. The results land on a local page
where a human editor decides what runs.

It works. An editor took seven of the ten items on its first real outing. What I want to
write about is not that it works — it is the month between that outing and the day I
found out what it had actually been doing.

## What it was actually doing

The pipeline makes one call to Gemini with Google Search grounding. That call comes back
with everything: headline, body, tags, category, source URL. One request, ten finished
articles. I had been reading that as *the model found the article and wrote it up*.

It had not. Grounding returns search *results* — a headline, a link, and a snippet of
maybe forty words. The model was taking that forty-word blurb and producing a 270-word
article from it.

Once you see it, three separate things you had filed as unrelated collapse into one
cause. Bodies padded, because forty words have to become two hundred and seventy
somehow. The two runs reported different money figures for the same story on the same
morning — one said €7.7 million, the other €14.2 million — because neither run had the
source in front of it. And the fact-checker was producing nonsense, which I will come
back to.

> I had not been misled by anything. The call was named `discover`, the prompt said
> *research*, and I filled in the rest.

The tell was there in the logs the whole time and I had been reading past it for weeks.
What finally surfaced it was not an audit. It was a question — *so who writes the body,
is it built into the call?* — asked by someone with no reason to know the answer and
every reason to ask.

## The checker that cried wolf

The tool had a fact-check step: send the draft and the article to a second, non-grounded
model call and ask *which numbers, names or dates in this draft are not in this source?*

It never worked. It flagged everything. At one point it produced an eighteen-item
mismatch list for a single story, all of it invented. The response had been to bolt on
suppressions — skip the check when the URL never resolved, skip it when the page
returned a non-200 — each one narrowing the circumstances in which the useless output
could appear.

Both suppressions are individually correct. Together they are a signal nobody read.

> When you are on your second patch to stop a check from producing noise, the thing to
> question is not the noise. It is whether the check is comparing the right two things.

It was not. It was holding a padded paraphrase *of a snippet* against a full article and
reporting every difference. Of course they differed everywhere. The check was working
perfectly and answering a question nobody had asked.

The immediate fix was to turn it off — one line, since it had been hardcoded on with no
way to disable it short of editing source. But turning it off exposed a second-order
problem that took me longer to appreciate.

## Silence is not a signal

With the check off, a run produces no mismatch warnings. With the check on and
everything clean, a run also produces no mismatch warnings. Those two states look
identical and mean opposite things.

So the setting is now printed at startup and written into every run log: `claim-check:
off`. The same reasoning added a per-item marker saying whether a body came from the
real article or from a snippet. Not because anyone asked for it, but because "no
warning" needed to stop being ambiguous.

This turned out to be a theme. A checker that is off, a page that could not be fetched,
a field the model declined to fill — all of them look like *fine* if you only render
findings and never render state.

The sharpest version of it came from a parser. The prompt ends each item with a menu:

```
* SELECT CATEGORY: ( flowers | shrubs | trees )
```

The model is meant to pick one. For one of the two profiles it never did — it echoed the
menu back, verbatim, on ten items out of ten in one run and five out of five in another.
Every card from that profile had been shipping with no category for weeks, and nobody
noticed, because a missing field just does not render.

The parser could easily have grabbed the first word inside the parentheses. If it had,
everything would have been labelled `flowers`, it would have looked like a working
feature, and the defect would have been invisible forever. It refuses, deliberately, and
that refusal is the only reason the problem ever surfaced.

> A silent default does not fix a broken input. It converts a visible gap into an
> invisible wrong answer.

The cause, when I went looking, was prompt asymmetry: the profile that picks correctly
has a section headed `CATEGORIES` that says *assign every item exactly one category*.
The one that echoes has a section describing its coverage areas and never issues the
instruction. The model was arguably obeying.

## Writing from the source

The fix for the snippet problem was smaller than it should have been, because the data
was already in hand. The fact-check step downloads each article to read its publication
date — and then throws the text away. It had been doing that for months.

So: keep the text, send it back to a non-grounded call, and have the model rewrite the
body from the real thing. No second fetch. No grounding cost.

Two decisions in that step are worth more than the step itself.

**The spec said to stop asking the model for a body at all.** Leads only — headline,
link, category — and rewrite everything from the fetched article. I did not do that,
because the logs said eleven of seventeen resolved URLs answered non-200. Google's
grounding index is full of dead links. If two thirds of items arrive unfetchable and
discovery no longer writes a body, two thirds of items arrive empty. The same spec
called for falling back to a snippet-written body when a fetch fails — a fallback it had
removed three paragraphs earlier.

That contradiction is only visible if you check the spec against measurements taken
after the spec was written.

**The expensive call goes last.** The rewrite is one model request *per article*, in a
pipeline whose free tier allows twenty requests a day, total. Put it before
deduplication and you pay for articles you then throw away as duplicates or over the
display cap. Moved to the end, after every filter, it only ever runs on items a human
will actually see.

That twenty-a-day cap deserves its own note. It had been documented in the repo for two
months and I had never done the arithmetic against it. One discovery call plus one check
per article is about eleven requests. Two runs is twenty-two. The day the quota
mysteriously ran out was not mysterious; it was two runs.

## The check that needs no model

With bodies now written from the article, the original fact-check question finally
becomes answerable. But it does not need a model to answer it.

For numbers specifically — which is what anyone actually worries about — the question is
not a judgement call. Pull every figure out of the draft, and check each one appears in
the article text you already have. `€6.4 million`, `80%`, `1,420`, `2028`. Present or
absent. String matching.

No model call. No quota. Runs in seconds. It has no false-alarm problem because it is
not inferring anything.

On the live run I checked, it found thirty-seven figures across four articles, every one
of them present in its source. Which is exactly the point where I nearly made a mistake:
*zero unsourced* proves the checker is quiet, not that it works. So I planted a
fabricated `€3.1 million` in a real body and audited it against the real page. Caught,
with context, while the untampered version stayed clean.

Two constraints on it matter more than the matching:

It runs **whether or not the rewrite succeeded**. A snippet-written body checked against
a readable article is precisely the case where an invented figure is most likely — that
is the €7.7 million story from the opening.

And an article whose page could not be fetched is **not flagged**. There is nothing for
a figure to be unsourced *against*, and flagging it would blame the article for our own
blocked request. Those items already carry a "could not read this page" marker, which is
the honest signal.

The wording on the card is *not found in the source*, never *wrong*. The check proves a
figure is absent from a page. It does not prove the claim is false, and it says nothing
about whether a correctly-sourced number was attached to the right quantity. It catches
invention, not misattribution. Overstating that on a card would be a worse failure than
not having the check.

## The log that quietly stopped being true

Changing where the body comes from broke two things that had nothing to do with the
body.

The run log recorded the raw model output. That used to be sufficient, because the raw
output *was* the text on the card. After the rewrite it was not, and nothing in the log
said so. The morning's actual output existed only in an open browser window.

Worse, the replay feature — rebuild a past run with no model call — matched items to the
log by title. The rewrite changes titles. So replaying that run returned every rewritten
item with an *empty* body, silently. I had checked that replay would not spend quota. I
had not checked that it still meant anything.

> A feature that reads your own output is coupled to your output. Change what you
> produce and you have changed it, whether or not you touched its file.

Both are fixed: the log now records the items exactly as shown, as JSON so they
round-trip byte for byte, and replay prefers those over re-deriving. The old path stays
for logs written before the change, which are the only copies of runs I cannot
reproduce.

## What you can recover, and what you cannot

The oldest open item on this project was eight articles sent to an editor a month ago
and never reviewed in session. By the time I got to it they could not recall which they
had turned down.

Half of that was recoverable. The site publishes what it publishes, so I fetched
everything it had run since, and matched the eight against it. Five had gone out, all
inside a week. Four of the five under a rewritten headline, which is why matching on
exact titles finds almost nothing and word-overlap ranking is the wrong tool used
alone — one item's real match scored lower than an unrelated story and only surfaced in
another item's candidate list. Every negative had to be confirmed a second way, by
searching for the item's distinguishing entity directly.

The other half is gone permanently. Not *which* three were dropped — that is just the
complement. **Why.** No amount of scraping recovers a reason that was never written
down.

> Outcomes are recoverable from the world. Reasons only exist if you captured them at
> the moment someone had them.

Which reframes what the decision-capture feature is for. I had been treating it as a
record. It is the only part of the loop that cannot be reconstructed, and it is the part
that actually teaches the pipeline something — a rejection with a reason changes
tomorrow's search, a rejection without one just suppresses a story.

That is also why I wrote only the five confirmed outcomes into the decision log and left
the three alone. "Absent from the site a month later" is not the same fact as "the
editor rejected it". They may never have got to them. Recording the guess would have
made the tool act on it — the rejection list feeds directly into the next prompt as *do
not return these*.

## What I would tell myself a month ago

Know what your model is looking at. Not what the function is called, not what the prompt
says it should do — what is actually in the context window when it writes. Nearly
everything above follows from getting that one thing wrong.

When you patch a check to stop it complaining, stop and ask whether it is checking the
right things. Two suppressions in one afternoon was the signal, and I read it as
progress.

Log the state of your checks, not only their findings. Off and clean must never look the
same.

Refuse to guess in parsers. The gap you leave visible is worth more than the plausible
default you fill it with.

Use the model where judgement is required and nothing else. Numbers are not a judgement
call, and a deterministic check has no bad days, no cost, and no opinions.

And when someone outside the code asks a naive question about how the thing works,
answer it properly. That question was worth more than the month of work it corrected.

---
title: 'Five words I nodded at'
description: 'Trade idioms that came up while working with Claude Code, what I had quietly assumed they meant, and the skill that came out of it.'
pubDate: 'Aug 04 2026'
category: 'Notes'
tags: ['tooling', 'language']
draft: false
---

Working with Claude Code, I keep meeting words that everyone in the conversation
appears to already understand. Not technical terms — I can look up a technical term
without embarrassment. These are trade idioms: phrases that carry a whole assumption
about how software gets made, and that nobody stops to define, because stopping to
define them would be strange.

I never had any formal English education. Croatian is my first language, and everything
I have in English came from games, films and television, and years of reading code and
documentation. That is a lot of input, and it is unevenly weighted: I know *spike* from
a bar and not from a planning meeting. None of these five ever came up in any of it.

So I wrote five of them down as they came up, and did not look them up. Below: the
real definition first, then what I had privately assumed. The gap between the two is
the interesting part, and it is not always small.

## Dogfood

> Dogfood — to use the thing you are building for your own real work, before anyone
> outside the team has to.

**What I thought it meant:** Nothing at all. This was the first one I asked about, because I had no guess
available to be wrong about.

From a 1988 Microsoft memo titled *Eating our own Dogfood*, which borrowed it from dog
food advertising, where the executive was supposed to be seen eating the product.

## Fire in anger

> Fire in anger — to run something for real, against a live target, rather than in a
> rehearsal. A tool nobody has fired in anger has only ever been tested.

**What I thought it meant:** The opposite. I read it as *fired off in anger* — done by mistake, a knee-jerk
reaction. So I heard *this has never been fired in anger* as reassurance, when it is a
warning.

Artillery. A gun fired in anger has been fired at an enemy rather than on the range,
and the distinction mattered because the two do not wear the same way.

## Rubber stamp

> Rubber stamp — to approve without examining. The review happened; the reading did
> not.

**What I thought it meant:** Nothing again, and I asked about this one too.

The literal office stamp, applied by a clerk with no authority to disagree. It is the
only one of the five that is an accusation.

## Spike

> Spike — a short, deliberately throwaway piece of work whose only output is an
> answer. If you keep the code, it was not a spike.

**What I thought it meant:** To spike a drink. Coffee with bourbon in it. That is a real meaning of the word, and
it is the one you get from films rather than from planning meetings.

From Extreme Programming, on the image of driving a spike through a problem to find
out how deep it goes.

## Cut

> Cut — to fix a release at a point in time and give it a number. Also, confusingly,
> to remove something from that release. Same word, opposite direction.

**What I thought it meant:** The opposite, or half of it. I had *cut* as crop — remove something from the release,
or delete it from the codebase. That is genuinely one of the two meanings, which is why
it never corrected itself. I was right often enough.

Film and print, where a cut was a physical act performed once on the only copy.

## What the five have in common

None of them come from software. They come from advertising, artillery, the civil
service, carpentry and film — five trades where the thing being described had weight,
or cost money, or went off. We borrowed the vocabulary of consequences for work that
mostly does not have any.

There is a pattern in my own guesses, too. The two I had no guess for cost me nothing,
because I asked the same day. The three I did have a guess for went unchallenged for
weeks: *spike* was harmless, *cut* was right half the time, and *fire in anger* had me
reading a warning as reassurance. A wrong definition is worse than no definition,
because a wrong one does not feel like a question.

The words were never the problem. The problem is that guessing worked well enough that
I never had to stop.

## The part that actually worries me

All five of these landed in my first weeks on the project, which is exactly the window
where you are most lost and least likely to say so. I got through it by guessing, and it
worked. Anyone arriving after me will get through it the same way: not confused for a
fortnight and then fine, but confused, and then no longer noticing, which is worse and
looks identical from outside.

And I am not the hardest case here. I only have weeks on this project, but I do have
years of English behind me; someone can arrive with neither. A glossary that assumes its
reader learned the trade in English is not a glossary, it is a filter.

The symmetric version is the real problem. There are terms I now use without thinking
that mean nothing to someone new — not idioms from the trade, but ones specific to this
project. I cannot list them, because the whole property of knowing a word is that you
stop seeing it.

> A glossary written by the person who understands the most is a list of the words that
> were never the difficulty.

So the useful artefact is not that. It is a list of the things that have actually
confused somebody.

## The skill: `/explain`

Three things, in order.

1. **Explain it in the project's own scope.** Not a dictionary entry. What `cut` means
   in this repository, on this branch, given how releases actually get made here. The
   general definition is the easy half and the half that does not help.
2. **Record it.** Every term explained gets appended to a list of things that were not
   obvious to someone already working here. No author, no judgement. The N+1 person who
   joins gets the list on their first day instead of assembling it privately over two
   months.
3. **Publish it as a field guide.** One HTML page generated from that list, regenerated
   on each commit when the list has changed. Always current, because staying current is
   not somebody's job.

The third part is the one I would have skipped a year ago. A list nobody reads is the
same as no list, and a list that is three months stale is worse than both.

The failure mode is not that the tooling breaks. It is that nobody on the project has
been new for a year, and the guide quietly stops growing.

---
title: 'Right about the bug, wrong about why'
description: 'A browser roguelite from blank page to playable combat: two renderer prototypes, a headless combat core, and three balance bugs — two of them fixed correctly on explanations that turned out to be wrong.'
pubDate: 'Aug 10 2026'
category: 'Build log'
tags: ['gamedev', 'architecture', 'testing']
draft: false
---

I have been building a roguelite that runs in a browser — isometric dungeon, party of
four, turn-based fights. One of six planned stages is done. Nothing about it is
shippable yet, and the interesting part so far has had almost nothing to do with the
game and almost everything to do with how wrong I was about my own bugs.

## Two prototypes instead of an argument

The constraint was a browser target and an isometric look. That splits into two stacks
that are not cosmetically different from each other, and picking between them by
reasoning turned out to be a waste of an afternoon.

One is sprite-based isometric — Diablo, Age of Empires, RollerCoaster Tycoon. Depth is
a painter's algorithm you sort by hand every frame. Rotation means redrawing every
asset at four angles. Lighting is painted into the sprites. The other is real 3D under
an orthographic camera, which is what most modern indie isometric games actually are.
The z-buffer handles depth for free, rotation is free, and picking is a raycast that is
always correct.

So I built both, with an identical twelve-by-twelve map, identical pathfinding,
identical movement speed and controls. Only the render surface differed. Then four
tests, each picked to expose a structural difference rather than a matter of taste.

Walking behind a tall block occludes correctly in both — but the Canvas rig only
manages it because every object is sorted by `x + y` each frame. Add a two-by-two
building or a bridge and that sort starts returning wrong answers. Tapping the top face
of a tall block in the Canvas rig selects the tile *behind* it, because screen-to-tile
maths inverts onto the ground plane; height-aware picking needs a separate depth pass I
would have to write. The Canvas shadow is a painted ellipse and the 3D one is cast, a
gap that widens the moment you want a torch or a time of day.

The uncomfortable part is that the bake-off was not fair. The 3D rig was fully
representative — code-generated geometry and real lighting is what the finished thing
would look like. The Canvas rig was deliberately under-sold, because producing genuine
pixel art was not possible in this workflow, so its tiles were procedural stand-ins for
art that did not exist.

> The path that could be demonstrated honestly at zero cost was the path with no asset
> dependency. That asymmetry is not a flaw in the test. It is the result.

3D won. The prototype pulled a four-year-old build of the library because that is what
the sandbox environment reliably serves, so moving to a current version will need a
colour-space rename and a full retune of every light intensity — physically-correct
lighting is now the default and the scene looks blown out until you fix it. The camera
rig, the raycast picking, the pathfinding and the waypoint movement all port unchanged.

## Combat draws nothing

The game is three surfaces, not one. The dungeon is 3D. The hub — roster, gear,
upgrades — is DOM. And combat, which is roughly half the screen time, is also DOM.

That middle one is the load-bearing decision. A combat view is health bars, damage
popups, tooltips and an initiative queue. HTML and CSS do all of that well and canvas
does all of it painfully. Attack lunges, number pops and hit shake are CSS keyframes.
The 3D library ends up being about a quarter of the codebase rather than the whole of
it.

Underneath all three surfaces, combat resolution is a pure function that renders
nothing:

```
resolve(state, action, rng) -> { state', events[] }
```

The view consumes that event list as an animation queue. This buys four things that are
miserable to retrofit later: it is testable without a browser, deterministic for a given
seed, skippable because fast-forward just drains the queue with no delays, and
replayable because a whole run is its seed plus the list of player actions.

I expected the third and fourth to be the payoff. It was the first, by a distance.

One more decision that looks like fussiness and is not: the randomness runs as several
independent streams off one seed rather than a single shared stream. With one stream, a
single different combat roll reshuffles the entire dungeon layout, and every bug report
stops reproducing. `Math.random()` appears nowhere in the core.

## What survives a run

Permadeath, with progression split into two pools. The hero pool — level, experience,
stat gains, equipped items — dies with the hero. The account pool is permanent:
unlocked classes, hub upgrades, the stash, currency, and the level new recruits arrive
at.

That last one carries the whole design. Permadeath's real danger is not harshness, it
is the spiral: your best heroes die, so you are weaker, so more die. Players respond
rationally by hoarding their good units and never fielding them, which is the exact
opposite of the intent. Tying recruit quality to account tier means a wipe costs you
your investment in four specific people, not your position in the game.

Two mechanics support it. At zero HP a hero is not dead — they gain a flag, sit at
zero, and act normally, and the next damage of any size kills them. Healing above zero
clears it. It is one flag, and it converts most deaths from an ambush into a decision
the player watched themselves make. The other is retreat: abandon the run, forfeit all
loot, keep the heroes. Permadeath becomes a risk you chose rather than a punishment
delivered.

Fights use four rank slots per side. Every ability declares which slots it can be used
*from* and which enemy slots it can *reach*, so a greatsword works from the front two
and hits the front two, while a longbow works from the back two and hits anything. Push
sends a target backward, pull drags it forward, and everyone else slides to fill the
gap. It is the cheapest source of tactical depth in the design — one "shove the healer
to the front" ability creates more interesting turns than three new damage skills.

## The tank was invincible

Because combat is headless, I could run thousands of fights in Node with a stand-in
policy for the player: heal when someone is badly hurt, otherwise swing the biggest
available stick.

The first run of that harness, before a human had played a single fight, reported win
rates of 100%, 100% and 88.7% across the three encounters, with an average of zero
casualties. Every fight in the game was trivially winnable.

Damage is subtractive and floored at one:

```
damage = max(1, round(raw × crit) − targetBlock)
```

Monster attack values were sitting *below* hero block. The weakest monster produced 5.4
raw damage against a tank with 5 block, which floors to 1. Against the opening
encounter the tank was not merely durable, he was literally invincible. Monster attacks
went up across the board, and one monster's block came down, because at 6 it had the
same failure mirrored back at me.

The rule of thumb I got out of it: with subtractive armour, block wants to sit around
20–35% of a typical incoming hit. Above that it stops being mitigation and becomes
immunity, and the damage floor of 1 hides that rather than solving it.

## The same bug, reflected

The second bug came from three human playtests, and the report was: *I am using Brace
almost by default.*

Brace was the tank's defensive ability — plus five block, taunt, two rounds. His base
block was five, so Brace made it ten, and the raw damage of every non-boss attack in
the game sat below ten. All of it floored to 1. Taunt then pulled the entire enemy team
onto the one actor who was immune to them. Measured on the boss fight, using Brace on
cooldown won 83.3% of fights and never using it won 34.0%. One ability was worth
forty-nine percentage points.

The harness had missed it completely. The stand-in policy prefers offensive abilities,
so it never discovered the dominant line at all.

## The fix worked and the reason was wrong

I cut the block bonus from +5 to +2. The boss win rate moved from 83.3% to 79.5%.
Essentially nothing.

So I swept the variants — three thousand fights each — and made Brace actively *worse*
at defending: zero bonus, then a two-point *penalty*. It was still worth eighteen
points over a party that rarely used it. The block was never the driver. The taunt was.
Moving damage off a 24 HP hero onto a 38 HP hero is inherently strong no matter what
the defensive numbers say.

The real diagnosis was not that Brace was overpowered. It was that Brace was free. The
tank had the party's lowest attack, so his basic swing landed about four damage.
Bracing forfeited four damage to prevent roughly fourteen on the most fragile hero in
the party. Nobody declines that trade, and no amount of nerfing the defensive half
changes the arithmetic.

## How to tell whether an ability is a decision

Win rate cannot answer that question, which is why I kept getting confident wrong
answers out of it. What worked was running several conditional policies against each
other: always brace when available; brace only when an ally is hurt; brace only when
the tank himself is healthy; never brace.

> If "always" wins, the ability is an auto-pick. If "never" wins, it is a trap. A
> decision exists only when a board-reading policy beats both extremes.

Two more wrong turns showed up under that test, and both were caught only because I
measured *after* the fix rather than before it.

Extending the cooldown made Brace weaker without making it optional — its contribution
fell and it stayed automatic. Cost creates decisions; scarcity only creates rationing.
And pushing the modifier to a three-point penalty overshot straight into the mirror
image of the original failure: never bracing became the best policy, at 46.5% against
36.8% for always. The ability had turned into a trap. The window between "always
correct" and "never correct" was one point of block wide.

It settled at a two-point penalty, with the tank's basic attack made stronger so that
bracing costs something real. Brace now reads as *I step out and draw their fire, and I
am more exposed doing it.* Always and never now sit within a point of each other, and
reading the board beats both by about six.

## Three instruments, each blind to the others

Nine thousand auto-battles found broken arithmetic that was invisible in hand-play, and
were blind to dominant strategy, because a dummy policy never discovers one. Three
human playtests found the dominant strategy in an afternoon, and were wrong about its
cause. Variant sweeps caught that the first fix rested on a wrong theory and that a
later one overshot, and told me nothing whatsoever about whether any of it is fun.

> Automated testing finds broken arithmetic, humans find broken strategy, and measuring
> the fix catches wrong theories about both.

The second-order point is the one I want to keep. Two consecutive fixes went in on
explanations that were wrong. Both fixes improved the game. Both would have stood
indefinitely, looking like successes, if I had not gone back and measured them.
Diagnosing a bug and verifying its fix are separate activities with separate failure
modes, and the second is the one nobody schedules.

## Where it actually stands

Stage one of six. A combat sandbox and nothing else — no loot, no dungeon, no run
structure, no hub. The blocking item is that enemies can shove heroes out of position
and nothing puts them back, so a displaced melee hero has a permanently dead turn for
the rest of the fight. The healer's cleanse ability, meanwhile, has nothing to clean,
because the only debuffs that exist are two stat reductions that nobody minds.

Every stage ends at a gate — a question that can kill the project cheaply. Stage one's
was whether the fights are interesting *before* loot exists, on the theory that if they
are not, loot will not fix it. That one passed.

The gate I trust least is stage five's: is run twenty meaningfully different from run
two? Nine thousand simulated fights have told me a great deal, and not one of them has
told me anything about that.

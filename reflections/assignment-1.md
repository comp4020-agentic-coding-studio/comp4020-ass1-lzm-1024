# Assignment 1 reflection

## What was the breakthrough that moved the work forward?

The breakthrough was recognising that a control is not explanatory merely
because it moves. In my earlier Moon prototype, the slider changed position
while the focal-length readout stayed at 28 mm and the Moon stayed the same
size. My first instinct was to repair the event handler. Instead, I treated the
failure as a problem with the concept: the interface did not yet have one
consequence that carried the explanation.

Stopping distance gave the interaction that consequence. A speed change now
flows through one model into reaction distance, braking distance, total
distance and the vehicle's stopping point. The later obstacle and
hazard-perception tasks reuse that relationship rather than adding separate
effects. Pure-function tests and rendered viewport checks made the explanation
measurable, not just visually plausible.

## What did this change about the developer I want to be?

I want to be a developer who treats uncertainty and discarded work as part of
the design process. Researching tyre tread challenged the simple story I
expected to tell: the wet-road effect was substantial, while the controlled
dry-road result was small and did not justify a broad safety claim. Keeping the
datasets separate made the page less dramatic but more trustworthy.

This project also changed how I direct an agent. I now want failures to produce
lasting constraints: calculations belong in testable functions, interface
state must have one source of truth, claims stay bounded to their evidence, and
browser checks must include keyboard and mobile use. That is more valuable than
re-prompting until one screenshot looks correct.

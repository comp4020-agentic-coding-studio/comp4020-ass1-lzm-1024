# Process overview

This is a reading guide to three decisions that shaped **Stopping Distance**.
Each moment identifies the problem, the alternative I rejected, the evidence
used to accept the replacement, and the exact history range or commit where a
reviewer can inspect the supporting work in context.

## What I built

**Stopping Distance** is an interactive road-safety explainer. Visitors change
speed, road condition and tyre tread, then see reaction, braking and total
distance update on a shared road visual. A second page applies the same model
through reaction, obstacle, following-gap, speed-comparison and
hazard-perception activities. The central lesson is that reaction distance
grows with speed, while braking distance grows with speed squared.

## The moments that mattered

### 1. Make the control change the explanation

An earlier Moon prototype exposed the failure I wanted to avoid: the slider
thumb moved, but the focal length remained 28 mm and the Moon did not change.
The captured states are available as [minimum-position evidence](process-images/moon-slider-left.png),
[middle-position evidence](process-images/moon-slider-middle.png) and
[maximum-position evidence](process-images/moon-slider-right.png). They made it
clear that visible input feedback was not proof of a working explanation.

I rejected separate handlers for each label and graphic because they could
silently disagree. I made one pure stopping calculation the source of every
distance, road marker and comparison, with presets passing through the same
controls. Review the replacement in
[`59163ba...d68d701`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-lzm-1024/compare/59163ba8a4dcf204131e98bcaca5b9f82a8063db...d68d701d575a7760525fb70b5f06ae9a7c3b35e9),
especially [`stopping-distance.ts`](stopping-distance.ts),
[`stopping-distance.test.ts`](stopping-distance.test.ts) and
[`main.test.ts`](main.test.ts). The tests verify that controls change the
calculation and road together, and that doubling speed doubles reaction
distance but quadruples braking distance under unchanged conditions.

### 2. Preserve the limits of the tyre evidence

My first assumption was that shallower tread should always increase braking
distance. Wet-road evidence supported that direction, but the dry test showed
a small result in the opposite direction. A universal tread multiplier would
have created a clearer interaction by making a claim the evidence did not
support, so I rejected it.

I used the Queensland table for the stopping baseline, Continental test points
for wet tread and the smaller Tire Rack result for dry tread. Intermediate
values are labelled as interpolation rather than measured results. I also kept
the Northern Territory truck comparison separate because its published values
do not isolate tread, load, weather and vehicle configuration. Review the model, source
notes and boundary tests in
[`d68d701`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-lzm-1024/commit/d68d701d575a7760525fb70b5f06ae9a7c3b35e9),
particularly [`stopping-distance.test.ts`](stopping-distance.test.ts),
[`truck-stopping.test.ts`](truck-stopping.test.ts) and
[`spec/assignment-1.test.ts`](spec/assignment-1.test.ts). These tests preserve
the measured anchors and prevent the interface from silently broadening its
claims. The visible qualification that shallow dry tread is not necessarily
safe is therefore part of the model, not an optional disclaimer.

### 3. Turn calculated distance into a decision

The first working page calculated stopping distance but still allowed visitors
to remain passive. I considered road-safety video, but fixed footage could not
respond to an individual visitor's timing or choice, and realism alone would
not demonstrate causality. I instead built challenges in which visitors react
to a random hazard, choose a speed, predict a following gap and receive
distance or impact-speed feedback.

I rejected simple success and failure messages because they hide how close a
decision was. The activities report distance travelled, remaining space,
residual collision speed or the cost of another half-second. Review the
implementation in
[`090561d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-lzm-1024/commit/090561d0dcbb2c2350e7e0dadbe789f29dedcd21),
especially [`hazard-perception.test.ts`](hazard-perception.test.ts),
[`braking-challenge.test.ts`](braking-challenge.test.ts),
[`road-games.test.ts`](road-games.test.ts) and
[`experiments.test.ts`](experiments.test.ts). They verify reaction distance,
collision outcomes, predictions and interaction state. Manual checks at desktop
and mobile sizes also covered keyboard input, random scenario completion and
overflow, while the interface acknowledges device latency rather than
presenting the browser result as a clinical measurement.

## Before you ship

`pnpm test` passes 77 tests across 11 files. `pnpm check` also runs type
checking, production build and linting, while `pnpm check:evidence` verifies
that every cited history reference resolves.

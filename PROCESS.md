# Process overview

Four decisions turned an unreliable visual control into a stopping-distance
explainer where every action changes a meaningful outcome. Each records a
rejected shortcut and the evidence
used to accept its replacement.

## What I built

**Stopping Distance** explains how much road a
driver needs before a vehicle can stop. Speed, tyre tread and road condition
change reaction, braking and total distance together. Reaction, obstacle,
following-gap and hazard tasks reuse the model.
The central idea is that danger begins before braking: reaction distance grows
with speed, while braking distance grows with speed squared.

## The moments that mattered

### 1. Make every control change the model, not only its appearance

An earlier Moon prototype had a slider whose thumb moved while focal length
stayed at 28 mm and the Moon remained unchanged. Patching the displayed number
could leave the interface and explanation out of sync again. I instead made
all stopping-distance outputs derive from one pure calculation. The
core-interaction requirement began red and reached the model in
[`59163ba...d68d701`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-lzm-1024/compare/59163ba...d68d701d575a7760525fb70b5f06ae9a7c3b35e9).
Boundary, interpolation and speed-change tests in
[`stopping-distance.test.ts`](stopping-distance.test.ts), plus DOM tests in
[`main.test.ts`](main.test.ts), verify that a control changes the visible model
rather than only its position.

### 2. Show evidence limits instead of forcing a simple tyre story

The first model made tread change braking in one direction, a story unsupported
on dry roads. I rejected a universal coefficient: Queensland data calibrates
the baseline, Continental points adjust wet braking, and a Tire Rack result
supplies the smaller dry adjustment. The page states that this does not make
damaged tyres safe. I kept the Northern Territory car–truck comparison separate
because its figures do not isolate tread, weather, load or configuration.
Source boundaries are checked in [`stopping-distance.test.ts`](stopping-distance.test.ts),
[`truck-stopping.test.ts`](truck-stopping.test.ts) and
[`spec/assignment-1.test.ts`](spec/assignment-1.test.ts). The model
landed in [`d68d701`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-lzm-1024/commit/d68d701d575a7760525fb70b5f06ae9a7c3b35e9).

### 3. Replace stock video with a testable hazard simulation

Video looked immersive but introduced copyright, download and fixed-timing
problems. I built an SVG dashcam scene that randomly reveals a pedestrian,
cyclist or stopped vehicle. An early click is a false alarm; a later click
becomes distance travelled plus the cost of another half-second. The model is
tested in [`hazard-perception.test.ts`](hazard-perception.test.ts). At
1920x1080 and 390x844, random scenarios reached a result, keyboard input worked
and neither viewport overflowed. When a screenshot exposed untranslated copy,
I audited both pages and added regression coverage in
[`i18n.test.ts`](i18n.test.ts). It landed in
[`090561d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-lzm-1024/commit/090561d0dcbb2c2350e7e0dadbe789f29dedcd21).

### 4. Turn a calculator into decisions, not disconnected games

A readout can show a formula without making the visitor use it. I rejected
decorative mini-games; each experiment instead asks whether road runs out
before the vehicle stops. Measured reaction time transfers into the obstacle
model, which reports remaining space or impact speed. Following-gap and 10
km/h comparisons hide the answer until the visitor chooses. Tests in
[`braking-challenge.test.ts`](braking-challenge.test.ts),
[`road-games.test.ts`](road-games.test.ts) and
[`experiments.test.ts`](experiments.test.ts) verify collision speed, safer
speed, prediction outcomes and interaction state
([`d68d701...090561d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-lzm-1024/compare/d68d701d575a7760525fb70b5f06ae9a7c3b35e9...090561d0dcbb2c2350e7e0dadbe789f29dedcd21)).

## Before you ship

`pnpm test` passes 77 tests across 11 files; `pnpm check` also passes type
checking, production build and linting. I manually checked both
viewports, keyboard input and horizontal overflow. `pnpm check:evidence`
locally resolves every cited commit; the GitHub links become public after the
repository is pushed and shipped.

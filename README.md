# Stopping Distance

An interactive explainer of how speed, reaction time, tyre tread and road grip
change the amount of road a driver needs before a vehicle can stop.

The central claim is simple: danger begins before the brakes are applied.
Reaction distance grows with speed, while idealised braking distance grows
approximately with speed squared. The page makes that relationship visible
rather than asking visitors to accept the formula.

## Core interaction

On the main page, visitors change vehicle speed, tread depth and road condition.
The same calculation updates:

- reaction distance;
- braking distance;
- total stopping distance; and
- the vehicle's stopping point on the road visualisation.

The experiment page reuses the model for a personal reaction test, obstacle
challenge, following-gap comparison, 10 km/h speed duel, prediction quiz and
randomised hazard-perception simulation. Both pages support English, Simplified
Chinese, Traditional Chinese, Japanese and Korean.

## Model and evidence

The educational model separates reaction and braking:

```text
reaction distance = speed x reaction time
braking distance = speed squared / (2 x grip x gravity)
total distance = reaction distance + braking distance
```

Baseline car values are calibrated to published Queensland stopping-distance
guidance. Wet-tread adjustments use Continental test points, while the smaller
dry-tread adjustment is bounded to a controlled Tire Rack result. The car–truck
comparison uses separate Northern Territory Government figures and does not
claim to isolate tread, weather, load or vehicle configuration.

This is an educational model, not a source of real-world driving distances.
Actual results depend on the vehicle, driver, tyres, brakes, gradient, load,
road and weather.

## Run locally

Requirements: Node.js and pnpm versions matching `mise.toml`.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. The main page is `index.html`; the extended
interaction page is `experiments.html`.

## Verify

```sh
pnpm test
pnpm check
pnpm check:evidence
pnpm build
pnpm dlx linkinator ./dist --silent
```

`pnpm check` runs type checking, the production build, TypeScript and CSS
linting, and the Vitest suite. The marked layouts are 1920x1080 and 390x844,
so both must also be inspected in Chrome, including keyboard navigation and a
resize during interaction.

## Project structure

- `stopping-distance.ts` — passenger-car stopping model;
- `truck-stopping.ts` — separate published heavy-vehicle comparison;
- `braking-challenge.ts` and `road-games.ts` — challenge calculations;
- `hazard-perception.ts` — response-time analysis;
- `main.ts` and `experiments.ts` — page interaction state;
- `i18n.ts` — five-language localisation; and
- `spec/` and `*.test.ts` — assignment, model and interaction checks.

The production output is written to `dist/` and deployed as a static GitHub
Pages site.

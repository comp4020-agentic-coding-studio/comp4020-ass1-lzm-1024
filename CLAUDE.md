# COMP4020 prototype

This is your starter repo for a COMP4020 prototype: a static site written in
HTML/CSS/TypeScript that builds to plain HTML/CSS/JS and deploys to GitHub
Pages. The **deployed site is what gets marked** --- not this repo, and not "it
works on my machine". It's marked live in Chrome against the deployed URL at two
viewports --- 1920×1080 (desktop) and 390×844 (phone) --- and both count in
full, so make that artefact good at both and use the checks below to know
whether it is.

The course website publishes this deliverable's brief and spec. The brief poses
the problem; the spec is the fixed contract every response must satisfy. This
repo's name tells you which deliverable applies. Run the course plugin's
**start** skill at the start of each week: it pulls the right spec from the
course API, carries your harness forward from last week, and helps you turn the
spec's checkable lines into tests of your own. Read the brief and spec before
you plan or build, and see `spec/README.md` for how the checks relate to them.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Before you push, run `pnpm check`. It runs most of what CI runs --- build,
  lint, and the spec --- so you catch those in seconds instead of waiting for
  the pipeline. The links check, the evidence check, the secrets scan, and the
  deploy itself only run in CI; run `pnpm dlx linkinator ./dist --silent`
  locally against a fresh `pnpm build` for the links check without waiting for
  CI.
- To see what the page actually looks like rather than what you assume it looks
  like, open it in a browser (the `agent-browser` CLI, documented on
  [the course site](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/backpressure/#agent-browser-the-rendered-page-as-ground-truth),
  works well for this). The rendered page is the truth; your mental model of it
  isn't.
- When a check fails, read its output before changing anything. Each check below
  names what it measures, and the failure message is the instruction: it tells
  you the file, the line, or the contract. Treat a red check as authoritative
  --- the page is wrong until the check is green, not until you decide it should
  be.
- Commit when the checks pass. Never commit a red state.

## The checks (your sensors)

CI runs these on every push once your repo is public. GitHub's checks UI shows
two jobs, `check` and `deploy` --- not one status per sensor below --- and
within `check` the steps run in sequence (`pnpm check` chains typecheck, build,
lint, and the spec with `&&`), so an early failure like a broken build stops the
later sensors from running for that push; fix it and push again to see the rest.
While the repo is private (all week, until you ship) the CI jobs stay skipped
--- `pnpm check` is the same roster on your machine, and it's the faster loop
anyway. They aren't hoops. Each is a different way of finding out something true
about the site that you can't reliably see by looking at it.

They also carry a mark at a crit: the sweep runs fifteen minutes after your
cutoff, and green checks there are worth half that week's shipped mark. Still
running counts as not green, so ship with time for CI to finish.

- **typecheck** --- `tsc --noEmit` runs first in `pnpm check`, so a type error
  stops the roster before the build even starts. The types are extra
  backpressure: a red here is the compiler telling you a claim in the code is
  false.
- **build** --- the site must build (`pnpm build`). A build failure means the
  deployed site is broken or stale, so nothing else matters until this is green.
- **deploy / online** --- the live GitHub Pages URL must load and return the
  page you expect. An asset that 404s on the deployed URL counts as broken even
  if it loads locally.
- **spec** --- `spec/invariants.test.ts` asserts what's true of any good
  website, whatever the week's brief asks; the tests you write for the week's
  spec run alongside it (any `spec/*.test.ts`). A failure names the contract
  you haven't met yet.
- **lint** --- `stylelint` for CSS, `oxlint` for TypeScript. Flags code that's
  wrong, fragile, or non-idiomatic. Read the rule it names.
- **tests** --- any other tests you write, wherever you put them (co-located
  with your source is fine, not just `spec/`), must pass. Vitest picks up both
  this and the spec suite in one `vitest run`, the last step of `pnpm check`. A
  failing test is a claim about the site that's no longer true.
- **evidence** (`pnpm check:evidence`) --- checks your process evidence:
  `PROCESS.md`'s citations resolve to real commits, the current deliverable's
  exact reflection is in `reflections/` (worked out from this repo's name
  against the public course API), and your `CLAUDE.md` is present. Evidence
  gates the deploy --- `deploy` needs `check` to pass, so failing evidence
  blocks the deploy alongside everything else. See
  [Your process is part of the mark](#your-process-is-part-of-the-mark) below,
  and the course website's
  [assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
  for what counts as evidence.
- **links** --- internal links must resolve. A broken link is a dead end you
  didn't mean to ship.
- **secrets** --- the repo is scanned for committed credentials. Never put a
  key, token, or password in a tracked file. If one leaks, rotate it. A local
  pre-commit hook (`.githooks/pre-commit`, installed by `pnpm install`) also
  blocks any commit containing something shaped like an API key --- by the time
  CI sees a key it's already pushed, so the hook is the sensor that matters.

Nothing here measures **accessibility** or **performance** --- wiring those
sensors (`axe-core`, Lighthouse, or whatever you choose) is your work, and later
in the course the spec will ask you to show how you tested both. When you do,
read a green performance result honestly: it's a lab estimate from one run on a
CI machine, not proof the site is fast for real users.

## The stack is swappable

Out of the box this is plain HTML/CSS/TypeScript on Vite, and every `.html` file
in the repo is a page: add pages, link them, and the build picks them up with no
config. That's a default, not a rule (unless the week's spec says otherwise).
You can swap in Astro or any other static generator, because nothing in CI names
a tool --- the whole contract is:

- `pnpm build` emits the complete site into `dist/`
- the `package.json` scripts (`check`, `check:evidence`, `build`) keep working
- whatever lands in `dist/` still passes the invariants in `spec/`

Two things bite in a swap. The deployed site lives under a path
(`…github.io/<repo>/`), so configure your generator's base path --- this
template's Vite config uses relative asset URLs to sidestep that, but most
generators (Astro included) need `base` set explicitly, and getting it wrong
looks fine locally while every asset 404s on the live URL. And commit the
updated `pnpm-lock.yaml`: CI installs with `--frozen-lockfile`.

## Your process is part of the mark

The deployed page is only half of it. How you got there is marked too: your
commit history, your agent files, and the decisions visible across them. The
checks above can't see any of that, so a person reads it directly --- which
means building legibly is part of building well.

- **Commit as you go.** Small, frequent commits are the record of how the work
  came together, and that record is read, not just the final state. A trail that
  grew alongside the code is the strongest evidence of your process; a single
  dump the night before is the weakest.
- **Keep a process overview** (`PROCESS.md`). A short reading-guide, not an
  essay: what you built, the moments that mattered --- each pointing at a
  commit, a `CLAUDE.md` change, or a prompt and the commit it produced --- and
  where to look in the history. It points a marker at the evidence; it doesn't
  stand in for it, and claims the history doesn't back don't count. The
  `PROCESS.md` in this repo is a template showing the shape and the citation
  format (link text the commit hash or range, target the commit or compare URL);
  `pnpm check:evidence` verifies your citations resolve to real commits before
  you ship. Markers follow those citations and don't trawl the repo for evidence
  you didn't cite.
- **Write your reflection in `reflections/`** --- a short markdown file in this
  repo, named for the deliverable it answers, so the number in the filename is
  the number in this repo's name (`crit-1.md` in `comp4020-crit1-<you>`,
  `assignment-1.md` in `comp4020-ass1-<you>`); `reflections/README.md` has the
  full rule. `pnpm check:evidence` checks the exact current name against the
  course API, not merely the presence of any well-named file. It answers the two
  standing prompts: the breakthrough that moved the work forward, and what this
  work changed about the developer you want to be. It stays out of the deployed
  site. It's due at the cutoff, and if it isn't in the repo by then the week
  doesn't count as shipped, however good the prototype is.
- **This file is process evidence.** The harness you build to direct the agent,
  this `CLAUDE.md` and any `AGENTS.md`, is itself read as part of how you
  worked. Keep it honest and current (see below).

You don't need a name, a student number, or any identity file in the repo: we
know whose repo it is. Spend the effort on the work.

## This file is yours

This CLAUDE.md is a starting point, not a fixed rulebook. As you learn what your
prototype needs --- a convention to hold the agent to, a sensor that keeps
catching you out, a fact about the stack the agent keeps getting wrong --- write
it down here. Growing this file is the work of harness engineering, and the gap
between this boilerplate and your own version is part of what your prototype
says about the developer you're becoming.

### Project-specific engineering rules

Carried forward from crit 2, minus the rules specific to that week's brief
(the ANU Sport redesign). These are general conventions that held up across a
build and are worth holding the agent to again.

- **Keep the technical contract intact.** The shipped site must remain plain
  HTML and CSS with no frameworks, component runtimes, or third-party UI/JS
  libraries. Do not introduce a new dependency when the same result can be
  expressed clearly with the existing stack.
- **Use JavaScript as progressive enhancement.** Vanilla TypeScript or
  JavaScript may power the core interaction, filtering, saved preferences,
  accessibility controls, and motion. Core content must remain readable
  without it, and all motion must be neutralised under
  `prefers-reduced-motion: reduce`.
- **Separate structure from presentation.** HTML owns content, document
  structure, links, labels, and accessibility semantics. `styles.css` owns all
  visual presentation. Do not use inline `style` attributes or presentational
  markup to work around the stylesheet.
- **Use small reusable CSS components.** Reuse existing component classes for
  repeated ideas. Prefer one clear class with a narrow responsibility over
  long selectors that depend on a particular DOM nesting structure. Add a new
  component class only when a pattern is repeated or has a distinct meaning.
- **Use design tokens for repeated visual decisions.** Shared colours,
  spacing, type scale, radius, elevation, and motion durations/easings belong
  in CSS custom properties near the top of `styles.css`. Do not scatter
  unexplained near-duplicate values through the file.
- **Keep CSS organised from general to specific.** Maintain this order:
  design tokens and reset, global typography and links, shared layout,
  reusable components, page-specific sections, responsive rules, and
  reduced-motion rules. Put a short heading comment above each major section;
  do not split the stylesheet merely to make the file tree look more
  sophisticated.
- **Make content and markup readable.** Use semantic elements, descriptive
  class names, correctly associated form labels, useful image `alt` text, and
  concise headings. Keep indentation consistent. Comments should explain a
  non-obvious decision or constraint, not repeat what the code already says.
- **Represent static interactions honestly.** There is no backend. Keep
  static-demo notices visible where relevant and use `type="button"` where
  submission would otherwise imply a working server.
- **Change the smallest coherent unit.** Before editing, inspect the relevant
  HTML, its shared styles, and the tests that express its contract. Avoid
  broad rewrites for a local change. When a shared pattern changes, verify
  every page that uses it at desktop and mobile sizes.
- **Prefer evidence over assumptions.** After a meaningful change, run
  `pnpm check`, then inspect the rendered result at 1920x1080 and 390x844.
  Check focus visibility, text contrast, overflow, navigation, image loading,
  and form labels. A green test suite does not replace visual inspection.
- **Do not over-engineer.** Do not create utility layers, naming systems,
  templates, generators, or abstractions for a single use. Duplication is
  worth removing when it represents a stable shared concept; two superficially
  similar blocks may remain separate when combining them would make either one
  harder to understand or change.

### Assignment 1 corrections now enforced

These rules were added after failures in the stopping-distance explainer. They
are project constraints, not presentation preferences.

- **One source of truth for every control.** A slider value, displayed value,
  calculated output and visual position must derive from the same state. A
  control that moves without changing the model is a failing interaction.
- **Keep calculations pure and testable.** Stopping, collision, following-gap,
  truck and hazard-response calculations belong in typed pure functions. UI
  modules may format or animate their results but must not duplicate formulas.
  Every boundary, interpolation rule and new outcome requires a unit test.
- **Bound claims to their evidence.** Do not turn one tyre, road or vehicle test
  into a universal safety claim. Show the source, preserve the measured
  direction and size of the effect, and state what the data cannot establish.
- **Never merge incompatible datasets.** The passenger-car model and published
  car–truck comparison remain separate unless a source controls for tread,
  surface, load and vehicle configuration. Missing variables must stay visible
  in the copy.
- **Keep one explanatory spine.** New activities must reuse the relationship
  between speed, reaction, grip and stopping distance. Reject features that are
  decorative, disconnected from that model, or add breadth without teaching
  the central idea.
- **Treat localisation as a completeness requirement.** Any new visible text,
  dynamic feedback, accessible name or disclaimer must have all five language
  variants. After copy changes, run localisation tests and audit both pages for
  residual English in non-English mode; proper names and units are the only
  intentional exceptions.
- **Verify interaction states, not only initial screenshots.** At 1920x1080 and
  390x844, operate the core control, reaction test, collision outcome and
  hazard result; resize during an interaction; tab through controls; confirm
  live feedback remains understandable without colour alone. `pnpm check`
  must run `scripts/browser-evidence.mjs` in real Chrome and preserve its
  desktop, mobile, keyboard, random-scenario and overflow evidence under
  `browser-evidence/`; JSDOM tests alone do not satisfy this rule.
- **Make motion optional and latency explicit.** Keyboard input must work for
  time-critical activities, device latency must be disclosed, and meaningful
  content must remain usable under `prefers-reduced-motion: reduce`.

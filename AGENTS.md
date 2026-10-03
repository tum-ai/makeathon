<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TUM.ai Makeathon site

Next 16 (App Router) / React 19 / Tailwind 4 on the TUM.ai design system `@tum.ai/ui-kit`
(from npm, pinned to an exact version). Bun, TypeScript, ESLint, Prettier, Vitest, Playwright.
Preserve unrelated work; no commits, pushes or deployments without authorization.

## Rules

- **Facts live in `src/config/makeathon.ts` only.** Copy in `src/content` is written as functions
  of them. Unknown facts stay `null` or `confirmed: false` with a `TODO(content)` note; never fill
  them with a plausible guess. `makeathon.test.ts` pins the number of open TODOs.
- **Copy:** plain, confident sentences in sentence case; no em or en dashes (a test scans `src`);
  labels never in capitals.
- **Colour:** the kit's tone tokens. The one addition is the Makeathon sun ramp (`--color-sun-*`
  in `globals.css`), only for the sun, the halftone dots and the weekend clock; a test keeps it
  to `src/styles/{sun,hero,weekend,close}.css`.
- **Motion:** transform and opacity only, `ease-brand`, behind `motion-safe:` or a
  reduced-motion check. Scroll-driven code writes custom properties and text, never React state.
- **Server/client:** the solar model and the weekend builder (`src/lib/solar.ts`,
  `src/lib/weekend.ts`) run on the server; client code reads `src/lib/weekend-view.ts`. ESLint
  enforces it.
- **Kit:** import from `@tum.ai/ui-kit` and `@tum.ai/ui-kit/shell` only. Read the kit's
  `docs/design-system.md` (in the sibling checkout `../ui-kit` or on GitHub; the npm package ships
  no docs) before UI changes; fix kit problems in the kit, not here.

## New components

Before creating a component, ask whether another TUM.ai site could use it: generic, with no
Makeathon facts, no sun ramp and no section-specific layout. If so, **stop and tell the user**
before writing it, and propose building it in the kit. Only once they agree: build it in
`../ui-kit` on its own branch, following the kit's `AGENTS.md` and PR template, open a pull
request on `tum-ai/ui-kit`, and use it here once released (`update-kit`). If the user says to
keep it local, build it here and say why in the PR's ui-kit checkbox.

## The signature pieces

- `src/halftone/`: the WebGL2 halftone field (shader, renderer, `HalftoneField`), with a CSS
  fallback rendered on the server.
- `src/sections/weekend/weekend-replay.tsx`: the pinned 48-hour replay, driven by scroll, with an
  ARIA slider and a static path for reduced motion.
- `src/components/nav-scroll.tsx`: in-page links glide past pinned scenes (`data-scroll-skip`).

## Safari bars

Safari 26 on iPhone ignores `theme-color` and tints its status bar and toolbar from the page: from
the root canvas at the page's ends and from fixed or sticky elements touching an edge. Mid-page
the page should show through both bars, as on tum-ai.com.

- The root canvas is brand black (the kit's `shell.css`), and the page starts on the night hero
  and ends on the kit footer, whose `TopBlend` fades into it, so both ends meet the bars without
  a seam.
- The kit header floats 10 px below the top edge so it doesn't tint the status bar.
- No sticky or fixed element may touch a screen edge. Once Safari has tinted the bars from one,
  the tint stays for the rest of the page. The pinned 48-hour replay therefore doesn't use
  `position: sticky` where scroll timelines exist: a scroll-driven translate holds the stage
  instead (`src/styles/weekend.css`), and an e2e test checks it stays still and isn't sticky.
- As on tum-ai.com, nothing dark spans the whole document (`src/app/layout.tsx`): no
  `color-scheme` meta and no tone on `#app-root`. Every band sets its own `data-tone`, which also
  gives the dark ones `color-scheme: dark`.
- Playwright WebKit doesn't render the bar tint. Check on a real iPhone (see `ui-verify`).

## Checks

`bun run lint`, `bun run typecheck`, `bun run test` while working; `bun run verify` (adds format,
the production build with the kit CSS sentinel, and Playwright in Chromium, WebKit and a phone
profile) before delivery. Run `next dev` and Playwright outside the Claude Code sandbox. CI
(`.github/workflows/ci.yml`) runs the same steps plus typos (`_typos.toml`) and actionlint, and
gates on `Verify`.

## Delivery

`main` deploys to production on Vercel (config in `vercel.json`) through
`.github/workflows/vercel-production.yml` once CI passes; Vercel's own Git deploys are off. The
workflow needs the repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
There are no automatic PR previews.

`main` changes only through pull requests (ruleset in `.github/rulesets/main.json`): squash merge,
a green `Verify`, `Validate PR title` and `Validate PR body`, resolved threads, and approval from
the code owner (`.github/CODEOWNERS`). Repository admins can merge their own pull requests
without that approval but can't push to `main` directly.

Pull requests fill in `.github/pull_request_template.md` completely; `Validate PR body`
(`scripts/pr-body.mjs`) checks it. Every verification box is ticked or marked `n/a` with a
reason. A pull request that changes anything under `src/` or `public/` (tests excluded) needs at
least two images under `## Screenshots`, phone (390) and desktop (1440), unless it carries the
`no-visual-change` label. Take them with `ui-verify` and attach them with
`gh pr create --attach phone.png --attach desktop.png` (or `gh pr edit --attach`), then check
they ended up in the Screenshots table and move them there if not.

Claude Code: `.claude/skills/` has `pr-ready`, `ui-verify` and `update-kit`; `.claude/agents/`
has read-only `design-reviewer` and `a11y-reviewer`.

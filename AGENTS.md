<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TUM.ai Makeathon site

Next 16 (App Router) / React 19 / Tailwind 4 on the TUM.ai design system `@tum.ai/ui-kit`
(vendored tarball, see `vendor/README.md`). Bun, TypeScript, ESLint, Prettier, Vitest, Playwright.
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
  `docs/design-system.md` (in the sibling checkout `../ui-kit` or on GitHub; the tarball ships no
  docs) before UI changes; fix kit problems in the kit, not here.

## The signature pieces

- `src/halftone/`: the WebGL2 halftone field (shader, renderer, `HalftoneField`), with a CSS
  fallback rendered on the server.
- `src/sections/weekend/weekend-replay.tsx`: the pinned 48-hour replay, driven by scroll, with an
  ARIA slider and a static path for reduced motion.
- `src/components/nav-scroll.tsx`: in-page links glide past pinned scenes (`data-scroll-skip`).

## Checks

`bun run lint`, `bun run typecheck`, `bun run test` while working; `bun run verify` (adds format,
the production build with the kit CSS sentinel, and Playwright in Chromium, WebKit and a phone
profile) before delivery. Run `next dev` and Playwright outside the Claude Code sandbox. CI
(`.github/workflows/ci.yml`) runs the same steps plus typos (`_typos.toml`) and actionlint, and
gates on `Verify`.

## Delivery

`main` deploys to production on Vercel (team `tum-ai`, project `makeathon`, config in
`vercel.json`); pull requests get preview deployments. makeathon.tum-ai.com still points at the
old `makeathon2022` project until the cutover.

Claude Code: `.claude/skills/` has `pr-ready`, `ui-verify` and `update-kit`; `.claude/agents/`
has read-only `design-reviewer` and `a11y-reviewer`.

# Contributing

Thanks for helping with the TUM.ai Makeathon site. The site is maintained by the Makeathon team
at TUM.ai. Corrections and fixes from outside are welcome; for larger changes, please open an
issue first so we can agree on the approach.

## Setup

You need Node 24.19.0 and Bun 1.4.2 (pinned in `.node-version` and `packageManager`).

```sh
bun install --frozen-lockfile   # also installs the Git hooks in githooks/
bun run dev                     # http://localhost:3130
```

## Checks

Run these while you work:

```sh
bun run lint
bun run typecheck
bun run test
```

Before opening a pull request, run `bun run verify`. It adds the format check, the production
build and the Playwright suite in Chromium, WebKit and a phone profile, which is what CI runs.

## Conventions

- **Facts live in [`src/config/makeathon.ts`](src/config/makeathon.ts) only.** Copy in
  `src/content` is written as functions of them. An unknown fact stays `null` or
  `confirmed: false` with a `TODO(content)` note, never a plausible guess.
- **Copy** is plain and confident, in sentence case, without em or en dashes. Labels are never
  set in capitals.
- **Design** comes from the TUM.ai design system, [`@tum.ai/ui-kit`](https://github.com/tum-ai/ui-kit).
  Problems in shared components are fixed in the kit, not here.
- **Motion** animates transform and opacity only and respects reduced motion.

[`AGENTS.md`](AGENTS.md) documents these rules and the site's signature pieces in more depth.

## Commits and pull requests

- Commit subjects follow [Conventional Commits](https://www.conventionalcommits.org) with a
  lowercase summary of at most 72 characters, for example `fix(weekend): hold the clock on resize`.
  The `commit-msg` hook checks this; pull request titles are checked the same way.
- Keep each pull request to one change and fill in the template, including how you verified it.
- `main` deploys to production once CI passes, so every pull request needs a green `Verify` check
  and a review.

By contributing, you agree that TUM.ai may use your contribution as part of this site.

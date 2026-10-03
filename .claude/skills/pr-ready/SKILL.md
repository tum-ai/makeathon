---
name: pr-ready
description: Final check before delivering a Makeathon site change. Use before committing, pushing or opening a pull request.
---

# pr-ready

1. Run `bun run verify` outside the sandbox (lint, format, types, unit, production build with the
   kit CSS sentinel, Playwright in Chromium, WebKit and the phone profile). Run `typos` too.
2. For UI changes, run the `design-reviewer` and `a11y-reviewer` agents on the touched files and
   the `ui-verify` skill for anything visual or scroll-driven.
3. Check that new facts went into `src/config/makeathon.ts`, open facts stay `TODO(content)`, and
   the TODO count in `makeathon.test.ts` still matches.
4. Fill in the PR template completely (`Validate PR body` checks it; see "Delivery" in
   AGENTS.md). For changes under `src/` or `public/`, attach phone and desktop screenshots with
   `gh pr create --attach`. Check that any new component went through the kit question ("New
   components" in AGENTS.md).
5. Report what actually ran and what didn't (VoiceOver, real iPhone Safari, slow GPUs). Never
   report a check as passed if it didn't run.

Pushing to `main` deploys to production on Vercel. Commit, push or deploy only when the user
authorizes it.

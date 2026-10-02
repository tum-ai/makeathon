---
paths:
  - "package.json"
  - "bun.lock"
---

- `@tum.ai/ui-kit` comes from npm at an exact version. Bump it through the `update-kit` skill.
- Never edit the ui-kit working tree from this repo; kit fixes go to `tum-ai/ui-kit`.
- Dependencies are pinned to exact versions. Keep `bun.lock` in sync (`bun install`); CI installs
  with `--frozen-lockfile`.

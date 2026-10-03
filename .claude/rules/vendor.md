---
paths:
  - "package.json"
  - "bun.lock"
---

- `@tum.ai/ui-kit` comes from npm at an exact version. Bump it through the `update-kit` skill.
- Edit the ui-kit working tree (`../ui-kit`) only for a kit change the user agreed to, on its own
  branch there, delivered as a pull request on `tum-ai/ui-kit`.
- Dependencies are pinned to exact versions. Keep `bun.lock` in sync (`bun install`); CI installs
  with `--frozen-lockfile`.

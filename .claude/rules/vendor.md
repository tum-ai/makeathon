---
paths:
  - "vendor/**"
  - "package.json"
  - "bun.lock"
---

- `@tum.ai/ui-kit` is a vendored tarball. Change it only through the `update-kit` skill
  (`vendor/README.md`): the commit SHA belongs in the file name, because Bun caches `file:`
  tarballs by name.
- Never edit the ui-kit working tree from this repo; kit fixes go to `tum-ai/ui-kit`.
- Dependencies are pinned to exact versions. Keep `bun.lock` in sync (`bun install`); CI installs
  with `--frozen-lockfile`.

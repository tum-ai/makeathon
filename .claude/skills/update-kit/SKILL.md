---
name: update-kit
description: Update the TUM.ai ui-kit (`@tum.ai/ui-kit` from npm) in the Makeathon site. Use when a new kit version is released and the site needs it.
---

# update-kit

1. Find the release: `npm view @tum.ai/ui-kit version`. Read what changed in
   [tum-ai/ui-kit](https://github.com/tum-ai/ui-kit) between the installed and the new version.
2. `bun add -E @tum.ai/ui-kit@<version>`: the version stays exact and `bun.lock` follows.
3. Run `bun run build` (the postbuild kit CSS sentinel catches missing kit styles), then the
   `pr-ready` skill.

Kit problems are fixed and released in the kit, never patched here.

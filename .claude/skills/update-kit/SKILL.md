---
name: update-kit
description: Re-vendor the TUM.ai ui-kit tarball into the Makeathon site. Use when the kit changed and the site needs the new build, or when switching to the npm registry release.
---

# update-kit

Follow `vendor/README.md` exactly:

1. Work from a clean ui-kit checkout (`../ui-kit`) at a committed SHA, and don't edit it. If it has
   uncommitted changes, ask first.
2. `bun install --frozen-lockfile && bun run build && npm pack --ignore-scripts --pack-destination artifacts`
   in the kit.
3. Copy the tarball to `vendor/tum.ai-ui-kit-<version>-<sha7>.tgz`, point `package.json` at it,
   run `bun install`, and delete the old tarball.
4. Update the table in `vendor/README.md`: file, version, source SHA, date, `shasum -a 256`.
5. Run `bun run build` (the postbuild kit CSS sentinel catches missing kit styles), then the
   `pr-ready` skill.

Once `@tum.ai/ui-kit` is on the registry, switch to the exact version, delete `vendor/`, and
remove the Dependabot ignore for the kit.

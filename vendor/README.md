# Vendored packages

## `@tum.ai/ui-kit`

The TUM.ai design system ([tum-ai/ui-kit](https://github.com/tum-ai/ui-kit)) is not on the npm
registry yet, and its repository does not commit `dist/`, so a Git dependency cannot install it.
Until the first registry release, this site installs the packed tarball from this folder.

| File | `tum.ai-ui-kit-0.1.0-342f83a.tgz` |
| --- | --- |
| Package | `@tum.ai/ui-kit@0.1.0` |
| Built from | ui-kit `342f83a` plus uncommitted changes (the rename to `@tum.ai/ui-kit`), 2026-10-02 |
| sha256 | `76a6773366bfb5e7ccbc79f301566d2557a4588f5eb1be6ecb2312de46d95792` |

The kit commit is part of the file name because Bun caches `file:` tarballs by name.

### Updating

In a clean ui-kit checkout:

```sh
bun install --frozen-lockfile
bun run build
npm pack --ignore-scripts --pack-destination artifacts
```

Copy `artifacts/tum.ai-ui-kit-<version>.tgz` here as `tum.ai-ui-kit-<version>-<sha7>.tgz`, point
`package.json` at it, run `bun install`, delete the old tarball and update the table above.

### Switching to the registry

Once `@tum.ai/ui-kit` is published, replace the `file:` specifier with the exact version, run
`bun install` and delete this folder.

# TUM.ai Makeathon

[![CI](https://github.com/tum-ai/makeathon/actions/workflows/ci.yml/badge.svg)](https://github.com/tum-ai/makeathon/actions/workflows/ci.yml)

The website of the TUM.ai Makeathon, TUM.ai's 48-hour AI hackathon in Munich
([makeathon.tum-ai.com](https://makeathon.tum-ai.com)). Built on the TUM.ai design system,
[`@tum.ai/ui-kit`](https://github.com/tum-ai/ui-kit).

The page grows out of the Makeathon's posters: a sun rising behind the name over a field of amber
halftone dots. Its centrepiece replays the 2026 weekend hour by hour as you scroll, with the sun on
its real path over the TUM Main Campus, and it ends with the sun rising again on the next edition.

## Development

Use Node 24.19.0 and Bun 1.4.2.

```sh
bun install --frozen-lockfile
bun run dev            # http://localhost:3130
```

| Script             | What it does                                                          |
| ------------------ | --------------------------------------------------------------------- |
| `bun run dev`      | Development server on port 3130                                       |
| `bun run build`    | Production build, then a check that the kit's CSS made it in          |
| `bun run test`     | Unit and component tests (Vitest, with axe)                           |
| `bun run test:e2e` | Playwright in Chromium, WebKit and a phone profile, against the build |
| `bun run verify`   | Everything CI runs                                                    |

`MAKEATHON_NOW=2027-03-01T12:00:00+01:00 bun run dev` pins the clock outside production, to preview
another phase of the next edition.

## Editing content

Every date, figure, name and link is in [`src/config/makeathon.ts`](src/config/makeathon.ts). When
the 2027 edition is fixed, fill in `nextEdition`. The page then moves through its phases on its own:
announced, applications open (with a countdown), applications closed, live, and recap.

Facts that are not confirmed yet stay empty in the config and carry a `TODO(content)` note, so
the page never shows a guess.

## The ui-kit

The kit is installed from npm at an exact version. To update it, run
`bun add -E @tum.ai/ui-kit@<version>`, then `bun run verify`; the production build's kit CSS
sentinel catches kit styles that went missing.

## Contributing

Corrections and fixes are welcome. [`CONTRIBUTING.md`](CONTRIBUTING.md) covers setup, checks and
conventions, and [`AGENTS.md`](AGENTS.md) documents the site's rules in depth. Everyone taking
part agrees to the [code of conduct](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately, as described in [`SECURITY.md`](SECURITY.md).

## Licence

Copyright (c) 2026 TUM.ai. All rights reserved; see [`LICENSE`](LICENSE). The source is public to
read, but no licence to reuse it is granted. Partner logos, photos and posters belong to their
owners.

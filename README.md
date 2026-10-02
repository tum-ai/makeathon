# TUM.ai Makeathon

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

Open content questions (each is a `TODO(content)` in the config):

1. The 2026 schedule: kick-off, workshop, submission, pitch and award times.
2. The 2027 dates, venue, application window and link, and a sign-up link for "tell me when
   applications open".
3. Which edition the two photos show, and more photos, especially from 2026.
4. Whether the osapiens outcome ("40 competing teams, 20+ applications") was the Makeathon 2026.

## The ui-kit

The kit is not on npm yet, so it is installed from a packed tarball in [`vendor/`](vendor/README.md),
which also explains how to update it or switch to the registry.

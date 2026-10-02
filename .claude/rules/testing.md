---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "e2e/**"
  - "test/**"
---

- Assert behaviour a visitor or editor would notice, not implementation details. Facts come from
  `src/config/makeathon.ts`; tests read them rather than hard-coding copy.
- Axe failures are errors (`test/axe.ts`); never skip a rule wholesale.
- No live network data in tests. Solar fixtures are USNO values; sunrise-sunset.org uses a
  different horizon and will not match.
- Playwright runs against the production build (`bun run build` first) on port 3131. Run it and
  `next dev` outside the Claude Code sandbox.
- Never regenerate screenshot baselines unless asked.

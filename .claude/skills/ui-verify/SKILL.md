---
name: ui-verify
description: Look at a Makeathon site change in a real browser. Use after changing sections, styles, the halftone field, the weekend replay or navigation.
---

# ui-verify

1. Start `bun run dev` (port 3130) outside the sandbox, or reuse a running server.
2. Screenshot the affected sections at 320, 390, 768 and 1440 pixels with Playwright and look at
   them. Scroll through the whole page, not just the first screen.
3. Check the signature pieces:
   - The hero dots dissolve smoothly into the next band.
   - The pinned weekend replay fades in during the approach and veils into the results ink.
   - The FAQ to close boundary stays a flat edge.
   - Nav links glide past pinned scenes (`data-scroll-skip`).
4. Repeat with `prefers-reduced-motion: reduce` (static replay path) and with WebGL off (the CSS
   halftone fallback; the `chromium-no-webgl` Playwright project).
5. Use the keyboard on the replay slider and the nav, and check focus visibility.
6. List what you checked separately from what still needs a human: VoiceOver, real iPhone
   Safari, zoom and reflow. On the iPhone ("Safari bars" in AGENTS.md):
   - On load the status bar is the hero's brand black, with no strip above the hero.
   - Mid-page (results, the FAQ, after the replay) the page shows through both bars.
   - Overscrolling past either end shows brand black.

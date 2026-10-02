import { Container, CountUp } from "@tum.ai/ui-kit";

import { weekendCopy } from "@/content/copy";
import type { WeekendView } from "@/lib/weekend-view";

import { WeekendReplay } from "./weekend-replay";

/** The 2026 weekend: one sentence of figures, then the 48 hours themselves. */
export function WeekendSection({ view }: { view: WeekendView }) {
  const { year, builders, teams, challenges, hours } = weekendCopy.title;
  return (
    <section
      id="weekend"
      aria-labelledby="weekend-title"
      data-tone="night"
      className="relative scroll-mt-header bg-transparent text-fg"
    >
      <Container className="pt-[clamp(5rem,12vw,10rem)] pb-[clamp(3rem,6vw,5.5rem)]">
        <h2 id="weekend-title" className="max-w-[18ch] text-display-xl text-fg">
          In {year}, <CountUp value={builders} className="text-highlight" /> builders formed{" "}
          <CountUp value={teams} className="text-highlight" /> teams and took on {challenges}{" "}
          challenges in {hours} hours.
        </h2>
        <p className="mt-8 max-w-2xl text-lead text-fg-muted">{weekendCopy.lead}</p>
        <a
          href="#results"
          className="sr-only rounded-md px-3 py-2 text-small font-semibold focus:not-sr-only focus:absolute focus:mt-4 focus:bg-white focus:text-ink-950"
        >
          {weekendCopy.skip}
        </a>
      </Container>
      <WeekendReplay view={view} />
    </section>
  );
}

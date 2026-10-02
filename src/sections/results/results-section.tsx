import { Container, Section, TextLink } from "@tum.ai/ui-kit";
import Image from "next/image";

import { HalftoneSeam } from "@/components/halftone-seam";
import { league, organizations, results2026 } from "@/config/makeathon";
import { resultsCopy } from "@/content/copy";

/**
 * The 2026 podiums: four challenges, five places each, exactly as the league
 * lists them, with the partners' own white artwork on ink.
 */
export function ResultsSection() {
  return (
    <Section
      id="results"
      tone="ink"
      spacing="lg"
      aria-labelledby="results-title"
      className="scroll-mt-header"
    >
      <Container>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-16">
          <h2 id="results-title" className="max-w-[14ch] text-display-lg">
            {resultsCopy.title}
          </h2>
          <p className="text-lead text-fg-muted">{resultsCopy.lead}</p>
        </div>

        <div className="mt-14 grid gap-x-10 sm:grid-cols-2 xl:grid-cols-4">
          {results2026.challenges.map((challenge) => {
            const org = organizations[challenge.partner];
            const logo = org.logoOnDark;
            return (
              <section
                key={challenge.partner}
                aria-labelledby={`challenge-${challenge.partner}`}
                className="border-t border-hairline-strong pt-6 pb-10"
              >
                <h3
                  id={`challenge-${challenge.partner}`}
                  className="flex min-h-14 flex-col gap-3 text-meta text-fg-subtle"
                >
                  {resultsCopy.challengeLabel}
                  {logo ? (
                    <Image
                      src={logo.src}
                      alt={org.name}
                      width={logo.width}
                      height={logo.height}
                      className="h-6 w-auto max-w-[11rem] object-contain object-left"
                    />
                  ) : (
                    <span className="text-heading-md text-fg">{org.name}</span>
                  )}
                </h3>
                <ol className="mt-7">
                  {challenge.teams.map((team, place) => {
                    const points = league.points[place] ?? 0;
                    return (
                      <li
                        key={team}
                        className="flex items-baseline gap-4 border-t border-hairline py-3 first:border-t-0"
                      >
                        <span
                          className="w-5 shrink-0 text-small text-fg-subtle tabular"
                          aria-hidden="true"
                        >
                          {place + 1}
                        </span>
                        <span
                          className={
                            place === 0
                              ? "min-w-0 text-heading-sm [overflow-wrap:anywhere] text-fg"
                              : "min-w-0 text-body [overflow-wrap:anywhere] text-fg-muted"
                          }
                        >
                          <span className="sr-only">Place {place + 1}: </span>
                          {team}
                        </span>
                        <span className="ml-auto shrink-0 text-meta text-fg-subtle tabular">
                          <span aria-hidden="true">+{points}</span>
                          <span className="sr-only">{resultsCopy.pointsLabel(points)}</span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        <div className="flex flex-col gap-6 border-t border-hairline-strong pt-8 lg:flex-row lg:items-center lg:gap-12">
          <h3 className="shrink-0 text-small font-semibold text-fg">{resultsCopy.techTitle}</h3>
          <ul className="flex flex-wrap items-center gap-x-10 gap-y-5">
            {results2026.techPartners.map((key) => {
              const org = organizations[key];
              const logo = org.logoOnDark;
              return (
                <li key={key}>
                  {logo ? (
                    <Image
                      src={logo.src}
                      alt={org.name}
                      width={logo.width}
                      height={logo.height}
                      className="h-5 w-auto opacity-80 md:h-6"
                    />
                  ) : (
                    org.name
                  )}
                </li>
              );
            })}
          </ul>
          <TextLink href={league.matchUrl} arrow className="lg:ml-auto">
            {resultsCopy.leagueLink}
          </TextLink>
        </div>
      </Container>
      <HalftoneSeam edge="bottom" />
    </Section>
  );
}

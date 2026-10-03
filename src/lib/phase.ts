/**
 * Where the next edition stands, from its dates alone, and what the hero and
 * header say about it. Pure: the server renders it for its own clock, and the
 * client re-runs it after hydration to correct a page cached across a
 * boundary (see `HeroStatus`).
 */
import { league, type NextEdition, site } from "@/config/makeathon";

import { calendarDateOf, formatDateRange, parseInstant } from "./time";

export type Phase = "announced" | "applications-open" | "applications-closed" | "live" | "recap";

export function getPhase(edition: NextEdition, now: number): Phase {
  const { weekend, applications } = edition;
  if (weekend && now >= parseInstant(weekend.end)) return "recap";
  if (weekend && now >= parseInstant(weekend.kickoff)) return "live";
  if (applications.closes && now >= parseInstant(applications.closes)) return "applications-closed";
  if (applications.opens && applications.url && now >= parseInstant(applications.opens))
    return "applications-open";
  return "announced";
}

export type Action = { href: string; label: string; external?: boolean };

export type HeroView = {
  phase: Phase;
  /** The status line: what is happening now. */
  status: string;
  /** The facts under it: dates and place, or where the dates will appear. */
  detail: string;
  /** A countdown target, when there is one worth counting to. */
  countdown?: { to: number; label: string };
  /** The student action (apply, follow) and the partner action. */
  primary: Action;
  secondary: Action;
};

export const partnerAction: Action = { href: "#partners", label: "Partner with us" };
const weekendAction: Action = { href: "#weekend", label: "Relive the 2026 weekend" };

function datesAndPlace(edition: NextEdition): string | null {
  if (!edition.weekend) return null;
  const range = formatDateRange(
    calendarDateOf(parseInstant(edition.weekend.kickoff)),
    calendarDateOf(parseInstant(edition.weekend.end)),
  );
  return edition.venue ? `${range}, ${edition.venue}` : range;
}

export function heroView(edition: NextEdition, now: number): HeroView {
  const phase = getPhase(edition, now);
  const when = datesAndPlace(edition);
  const kickoff = edition.weekend ? parseInstant(edition.weekend.kickoff) : null;

  switch (phase) {
    case "applications-open":
      return {
        phase,
        status: "Applications are open",
        detail: when ?? `The Makeathon ${edition.year}`,
        countdown: edition.applications.closes
          ? { to: parseInstant(edition.applications.closes), label: "Applications close in" }
          : undefined,
        primary: { href: edition.applications.url ?? "#faq", label: "Apply now" },
        secondary: partnerAction,
      };
    case "applications-closed":
      return {
        phase,
        status: "Applications are closed",
        detail: when ?? `The Makeathon ${edition.year}`,
        countdown: kickoff ? { to: kickoff, label: "Kick-off in" } : undefined,
        primary: partnerAction,
        secondary: weekendAction,
      };
    case "live":
      return {
        phase,
        status: "Live now",
        detail: when ?? `The Makeathon ${edition.year}`,
        primary: { href: site.social.instagram, label: "Follow along", external: true },
        secondary: partnerAction,
      };
    case "recap":
      return {
        phase,
        status: `The Makeathon ${edition.year} is over`,
        detail: "Thank you to every team. See you at the next Makeathon.",
        primary: partnerAction,
        secondary: { href: league.url, label: league.name, external: true },
      };
    case "announced":
      return {
        phase,
        status: when
          ? `The Makeathon ${edition.year}`
          : `The Makeathon ${edition.year} is in the making`,
        detail: when ?? "Dates, challenges and applications appear here first.",
        countdown:
          edition.applications.opens && edition.applications.url
            ? { to: parseInstant(edition.applications.opens), label: "Applications open in" }
            : undefined,
        primary: edition.notifyUrl
          ? { href: edition.notifyUrl, label: "Get notified", external: true }
          : { href: site.social.instagram, label: "Follow for the dates", external: true },
        secondary: partnerAction,
      };
  }
}

/**
 * The close's two actions: the student's next step for the phase, and the
 * partner's, by email this time (the partner section is above).
 */
export function closeActions(edition: NextEdition, now: number): [Action, Action] {
  const phase = getPhase(edition, now);
  const partner: Action = {
    href: `mailto:${site.partnerEmail}?subject=${encodeURIComponent("Partnering on the Makeathon")}`,
    label: "Partner with us",
  };
  if (phase === "applications-open" && edition.applications.url)
    return [{ href: edition.applications.url, label: "Apply now", external: true }, partner];
  if (edition.notifyUrl && (phase === "announced" || phase === "recap"))
    return [{ href: edition.notifyUrl, label: "Get notified", external: true }, partner];
  return [{ href: site.social.instagram, label: "Follow on Instagram", external: true }, partner];
}

/** The header's call to action for a phase. */
export function headerAction(edition: NextEdition, now: number): Action {
  const phase = getPhase(edition, now);
  if (phase === "applications-open" && edition.applications.url)
    return { href: edition.applications.url, label: "Apply now", external: true };
  return partnerAction;
}

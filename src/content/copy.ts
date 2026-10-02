/**
 * The site's copy, written as functions of the facts in `config/makeathon`.
 * Rules (AGENTS.md): plain, confident sentences; sentence case; no em or en
 * dashes; no figure typed here that config already holds.
 */
import {
  editions,
  league,
  type NextEdition,
  referenceWeekend,
  results2026,
  site,
} from "@/config/makeathon";
import { calendarDateOf, formatDate, formatDateRange, parseInstant } from "@/lib/time";

const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
] as const;

/** Small counts in words ("four"), larger ones as figures. */
export function inWords(n: number): string {
  return WORDS[n] ?? String(n);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const hours = referenceWeekend.hours;
const firstYear = site.since;
const editionCount = editions.length;
const weekendDays = formatDateRange(
  calendarDateOf(parseInstant(referenceWeekend.start)),
  calendarDateOf(parseInstant(referenceWeekend.start) + hours * 3600_000),
);

export const heroCopy = {
  title: "Makeathon",
  tagline: "AI for everyone.",
  lead: `A ${hours}-hour hackathon at TUM in Munich. Students and young professionals build AI for problems that companies, hospitals and research labs bring. Free to take part.`,
};

export const weekendCopy = {
  /** Rendered with the figures counted up; see WeekendSection. */
  title: {
    year: results2026.edition,
    builders: `${results2026.builders}+`,
    teams: results2026.teams,
    challenges: inWords(results2026.challenges.length),
    hours,
  },
  lead: `Scroll through that weekend hour by hour, under the sky it had: the sun's real path over the ${referenceWeekend.place.name} from ${weekendDays}.`,
  skip: `Skip the ${hours} hours`,
  sliderLabel: `The ${hours} hours of the Makeathon ${referenceWeekend.edition}`,
  momentsTitle: `The ${hours} hours, moment by moment`,
  east: "East",
  south: "South",
  west: "West",
  elevation: (degrees: number) =>
    degrees >= 0
      ? `Sun ${degrees.toFixed(1)}° above the horizon`
      : `Sun ${Math.abs(degrees).toFixed(1)}° below the horizon`,
  startNote: referenceWeekend.startConfirmed
    ? null
    : "Schedule times are approximate; sunrise and sunset are exact.",
};

export const resultsCopy = {
  title: `${capitalize(inWords(results2026.challenges.length))} challenges. ${capitalize(
    inWords(results2026.challenges[0].teams.length),
  )} places each.`,
  lead: `The ${results2026.edition} results opened the ${league.name}: the top ${inWords(
    results2026.challenges[0].teams.length,
  )} of every challenge took its first points, and every Makeathon team joined its first season.`,
  challengeLabel: "Challenge by",
  techTitle: "Tech partners",
  leagueLink: "The match on the league's site",
  pointsLabel: (points: number) => `${points} league points`,
};

export const editionsCopy = {
  title: `${capitalize(inWords(editionCount))} editions since ${firstYear}.`,
  lead: "From a weekend with GPT-3 to the first match of a European league.",
  listLabel: "Every Makeathon, newest first",
};

export const partnersCopy = {
  title: "Bring a challenge.",
  lead: "Partners set the problems the Makeathon is built around. A challenge comes with:",
  action: "Email the Makeathon team",
  actionHref: `mailto:${site.partnerEmail}?subject=${encodeURIComponent("Partnering on the Makeathon")}`,
  pastTitle: "Partners of past editions",
};

/** The next edition in one sentence, for the FAQ and the close. */
export function nextEditionSentence(edition: NextEdition): string {
  if (!edition.weekend)
    return `The ${edition.year} dates are not out yet. They appear on this page first.`;
  const range = formatDateRange(
    calendarDateOf(parseInstant(edition.weekend.kickoff)),
    calendarDateOf(parseInstant(edition.weekend.end)),
  );
  const where = edition.venue ? ` at ${edition.venue}` : "";
  const closes = edition.applications.closes
    ? ` Applications close on ${formatDate(calendarDateOf(parseInstant(edition.applications.closes)))}.`
    : "";
  return `The Makeathon ${edition.year} runs from ${range}${where}.${closes}`;
}

export function closeCopy(edition: NextEdition) {
  return {
    title: edition.weekend
      ? `The sun rises again on ${formatDate(calendarDateOf(parseInstant(edition.weekend.kickoff)))}.`
      : `The sun rises again in ${edition.year}.`,
    lead: "Be in the room when it does.",
  };
}

export const footerCopy = {
  tagline: `${hours} hours. Two sunrises. One prototype.`,
  bottomLine: (year: number) => `© ${year} TUM.ai. The Makeathon, every year since ${site.since}.`,
};

export const navigation = [
  { href: "#weekend", label: "Weekend" },
  { href: "#results", label: "Results" },
  { href: "#editions", label: "Editions" },
  { href: "#partners", label: "Partners" },
  { href: "#faq", label: "FAQ" },
] as const;

/**
 * Munich time for the whole site. Everything renders in Europe/Berlin, on the
 * server and in every visitor's browser, so the clock of the weekend reads
 * the same in Munich and in Lisbon.
 */
import type { CalendarDate, Instant } from "@/config/makeathon";

export const TIME_ZONE = "Europe/Berlin";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const partsFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "long",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const offsetFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  timeZoneName: "longOffset",
});

/** Munich wall-clock parts of a moment. */
export function berlinParts(ms: number) {
  const parts: Record<string, string> = {};
  for (const part of partsFormat.formatToParts(ms)) parts[part.type] = part.value;
  return {
    weekday: parts.weekday ?? "",
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** Munich's offset from UTC at a moment, in minutes (60 in winter, 120 in summer). */
export function berlinOffsetMinutes(ms: number): number {
  const name = offsetFormat.formatToParts(ms).find((part) => part.type === "timeZoneName")?.value;
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? "");
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

/** The offset written in an instant ("+02:00"), in minutes. */
export function instantOffsetMinutes(instant: Instant): number {
  const match = /([+-])(\d{2}):(\d{2})$/.exec(instant);
  if (!match) throw new Error(`Instant without an explicit offset: ${instant}`);
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

export function parseInstant(instant: Instant): number {
  instantOffsetMinutes(instant);
  const ms = Date.parse(instant);
  if (Number.isNaN(ms)) throw new Error(`Invalid instant: ${instant}`);
  return ms;
}

/** Munich midnight at the start of a calendar day, as epoch milliseconds. */
export function berlinMidnight(day: CalendarDate): number {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  const utcMidnight = Date.UTC(year, month - 1, date);
  // Munich switches DST at 01:00 UTC, after local midnight, so the offset in
  // force a few hours before UTC midnight is the one at local midnight.
  const offset = berlinOffsetMinutes(utcMidnight - 3 * 3600_000);
  return utcMidnight - offset * 60_000;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "07:42" */
export function formatClock(ms: number): string {
  const { hour, minute } = berlinParts(ms);
  return `${pad(hour)}:${pad(minute)}`;
}

/** "Sat 07:42" */
export function formatWeekdayClock(ms: number): string {
  const { weekday } = berlinParts(ms);
  return `${weekday.slice(0, 3)} ${formatClock(ms)}`;
}

/** "Saturday" */
export function formatWeekday(ms: number): string {
  return berlinParts(ms).weekday;
}

/** Elapsed time since the start of the weekend: "13:42" (hours may exceed 24). */
export function formatElapsed(minutes: number): string {
  const whole = Math.max(0, Math.floor(minutes));
  return `${pad(Math.floor(whole / 60))}:${pad(whole % 60)}`;
}

function splitDate(date: CalendarDate) {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  return { year, month, day };
}

/** "17 April 2026" */
export function formatDate(date: CalendarDate): string {
  const { year, month, day } = splitDate(date);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** The Munich calendar date of a moment. */
export function calendarDateOf(ms: number): CalendarDate {
  const { year, month, day } = berlinParts(ms);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * A date span in words, without dashes: "17 to 19 April 2026",
 * "30 September to 2 October 2022".
 */
export function formatDateRange(start: CalendarDate, end: CalendarDate): string {
  const a = splitDate(start);
  const b = splitDate(end);
  if (a.year !== b.year) return `${formatDate(start)} to ${formatDate(end)}`;
  if (a.month !== b.month)
    return `${a.day} ${MONTHS[a.month - 1]} to ${b.day} ${MONTHS[b.month - 1]} ${b.year}`;
  return `${a.day} to ${b.day} ${MONTHS[b.month - 1]} ${b.year}`;
}

/** "April 2026" */
export function formatMonth(date: CalendarDate): string {
  const { year, month } = splitDate(date);
  return `${MONTHS[month - 1]} ${year}`;
}

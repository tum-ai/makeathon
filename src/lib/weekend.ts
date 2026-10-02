/**
 * The 48-hour replay's data, built on the server from the reference weekend
 * and the solar model. The client gets only this plain view: sampled sun
 * positions (tenths of a degree, every ten minutes), the night spans, and
 * the moments placed on the timeline with their display labels.
 */
import type { MomentTime, ReferenceWeekend } from "@/config/makeathon";

import { HORIZON, sunEvents, sunPosition } from "./solar";
import {
  berlinMidnight,
  calendarDateOf,
  formatClock,
  formatWeekday,
  formatWeekdayClock,
  parseInstant,
} from "./time";
import type { WeekendView } from "./weekend-view";

const MINUTE = 60_000;

function resolveMoment(time: MomentTime, w: ReferenceWeekend): number {
  if ("at" in time) return parseInstant(time.at);
  if ("midnight" in time) return berlinMidnight(time.midnight);
  const from = berlinMidnight(time.day);
  const to = from + 24 * 3600_000;
  const events = sunEvents(from, to, w.place.latitude, w.place.longitude);
  const at = time.sun === "rise" ? events.sunrise : events.sunset;
  if (at === null) throw new Error(`No sun${time.sun} on ${time.day}`);
  return at;
}

export function buildWeekendView(w: ReferenceWeekend, step = 10): WeekendView {
  const start = parseInstant(w.start);
  const minutes = w.hours * 60;
  const { latitude, longitude } = w.place;

  const elevation: number[] = [];
  const azimuth: number[] = [];
  for (let m = 0; m <= minutes; m += step) {
    const sun = sunPosition(start + m * MINUTE, latitude, longitude);
    elevation.push(Math.round(sun.elevation * 10));
    azimuth.push(Math.round(sun.azimuth * 10));
  }

  // Night spans from the sun's horizon crossings, clipped to the window.
  const end = start + minutes * MINUTE;
  const toMinutes = (ms: number) => Math.round((ms - start) / MINUTE);
  const marks: { at: number; rising: boolean }[] = [];
  for (let day = berlinMidnight(calendarDateOf(start)); day < end; day += 24 * 3600_000) {
    const events = sunEvents(day, day + 24 * 3600_000, latitude, longitude);
    if (events.sunrise !== null) marks.push({ at: events.sunrise, rising: true });
    if (events.sunset !== null) marks.push({ at: events.sunset, rising: false });
  }
  marks.sort((a, b) => a.at - b.at);
  const nights: { from: number; to: number }[] = [];
  let nightFrom: number | null =
    sunPosition(start, latitude, longitude).elevation < HORIZON ? 0 : null;
  for (const mark of marks) {
    const at = toMinutes(mark.at);
    if (at <= 0 || at >= minutes) continue;
    if (!mark.rising) nightFrom = at;
    else if (nightFrom !== null) {
      nights.push({ from: nightFrom, to: at });
      nightFrom = null;
    }
  }
  if (nightFrom !== null) nights.push({ from: nightFrom, to: minutes });

  const days: WeekendView["days"] = [];
  const ticks: WeekendView["ticks"] = [];
  if (formatClock(start) !== "00:00") days.push({ at: 0, label: formatWeekday(start) });
  for (let m = 0; m <= minutes; m += 60) {
    const ms = start + m * MINUTE;
    const clock = formatClock(ms);
    if (clock === "00:00") days.push({ at: m, label: formatWeekday(ms) });
    if (["00:00", "06:00", "12:00", "18:00"].includes(clock)) ticks.push({ at: m, label: clock });
  }

  const moments = w.moments
    .map((moment) => {
      const ms = resolveMoment(moment.time, w);
      // Shown to the nearest minute, as almanacs print sun times.
      const shown = Math.round(ms / MINUTE) * MINUTE;
      return {
        key: moment.key,
        title: moment.title,
        text: moment.text,
        at: toMinutes(ms),
        when: moment.confirmed
          ? `${formatWeekday(shown)} ${formatClock(shown)}`
          : (moment.approx ?? formatWeekday(ms)),
        confirmed: moment.confirmed,
      };
    })
    .sort((a, b) => a.at - b.at);

  const endMs = start + minutes * MINUTE;
  return {
    edition: w.edition,
    place: `${w.place.name}, ${w.place.city}`,
    start,
    minutes,
    step,
    elevation,
    azimuth,
    nights,
    days,
    ticks,
    moments,
    startConfirmed: w.startConfirmed,
    startLabel: w.startConfirmed
      ? formatWeekdayClock(start)
      : (w.moments.find((moment) => moment.key === "kickoff")?.approx ?? formatWeekday(start)),
    endLabel: w.startConfirmed ? formatWeekdayClock(endMs) : `${formatWeekday(endMs)} evening`,
  };
}

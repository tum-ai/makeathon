/**
 * The shape of the 48-hour replay's data (built by `weekend.ts` on the
 * server) and the client-safe helpers that read it.
 */

export type WeekendMomentView = {
  key: string;
  title: string;
  text: string;
  /** Minutes since the start of the weekend. */
  at: number;
  /** "Saturday 06:16" for a confirmed time, else the approximate wording. */
  when: string;
  confirmed: boolean;
};

export type WeekendView = {
  edition: string;
  place: string;
  /** The start of the weekend, epoch milliseconds. */
  start: number;
  /** Length in minutes (2880 for 48 hours). */
  minutes: number;
  /** Minutes between samples. */
  step: number;
  /** Sun elevation per sample, in tenths of a degree. */
  elevation: number[];
  /** Sun azimuth per sample, in tenths of a degree. */
  azimuth: number[];
  /** Spans with the sun below the horizon, in minutes since the start. */
  nights: { from: number; to: number }[];
  /** Day changes on the ruler: minutes since the start and the new day's name. */
  days: { at: number; label: string }[];
  /** Clock ticks every six hours. */
  ticks: { at: number; label: string }[];
  moments: WeekendMomentView[];
  startConfirmed: boolean;
  /** "Friday 18:00", or "Friday evening" while the start is a placeholder. */
  startLabel: string;
  endLabel: string;
};

/** Linear interpolation of the sampled sun at a minute of the weekend (client-safe). */
export function sampleSun(
  view: Pick<WeekendView, "elevation" | "azimuth" | "step">,
  minute: number,
) {
  const i = Math.max(0, minute / view.step);
  const lo = Math.min(Math.floor(i), view.elevation.length - 1);
  const hi = Math.min(lo + 1, view.elevation.length - 1);
  const t = i - lo;
  const el = (view.elevation[lo] ?? 0) * (1 - t) + (view.elevation[hi] ?? 0) * t;
  const az = (view.azimuth[lo] ?? 0) * (1 - t) + (view.azimuth[hi] ?? 0) * t;
  return { elevation: el / 10, azimuth: az / 10 };
}

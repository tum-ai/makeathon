import { describe, expect, it } from "vitest";

import { referenceWeekend } from "@/config/makeathon";

import { solarNoon, sunEvents, sunPosition } from "./solar";
import { berlinMidnight } from "./time";

const { latitude, longitude } = referenceWeekend.place;

/**
 * The US Naval Observatory's published times for the TUM Main Campus
 * (48.1497 N, 11.5679 E), in UTC and to the minute, retrieved 2026-10-02 from
 * aa.usno.navy.mil/api/rstt/oneday. USNO uses the standard horizon of
 * -0.833° (refraction and the sun's semi-diameter), like this model.
 */
const REFERENCE = [
  {
    day: "2026-04-17",
    sunrise: "2026-04-17T04:21Z",
    sunset: "2026-04-17T18:07Z",
    noon: "2026-04-17T11:13Z",
    civilDawn: "2026-04-17T03:48Z",
    civilDusk: "2026-04-17T18:40Z",
  },
  {
    day: "2026-04-18",
    sunrise: "2026-04-18T04:19Z",
    sunset: "2026-04-18T18:08Z",
    noon: "2026-04-18T11:13Z",
    civilDawn: "2026-04-18T03:46Z",
    civilDusk: "2026-04-18T18:42Z",
  },
  {
    day: "2026-04-19",
    sunrise: "2026-04-19T04:17Z",
    sunset: "2026-04-19T18:10Z",
    noon: "2026-04-19T11:13Z",
    civilDawn: "2026-04-19T03:44Z",
    civilDusk: "2026-04-19T18:43Z",
  },
  {
    day: "2026-06-21",
    sunrise: "2026-06-21T03:13Z",
    sunset: "2026-06-21T19:18Z",
    noon: "2026-06-21T11:16Z",
    civilDawn: "2026-06-21T02:32Z",
    civilDusk: "2026-06-21T19:59Z",
  },
];

const MINUTE = 60_000;
// USNO rounds to the minute, so allow that plus half a minute of model error.
const close = (actual: number | null, expected: string, minutes = 1.5) => {
  expect(actual).not.toBeNull();
  expect(Math.abs((actual as number) - Date.parse(expected)) / MINUTE).toBeLessThan(minutes);
};

describe("solar model", () => {
  it.each(REFERENCE)("matches published sun times on $day", (ref) => {
    const from = berlinMidnight(ref.day);
    const to = from + 24 * 3600_000;
    const events = sunEvents(from, to, latitude, longitude);
    close(events.sunrise, ref.sunrise);
    close(events.sunset, ref.sunset);
    close(events.civilDawn, ref.civilDawn);
    close(events.civilDusk, ref.civilDusk);
    close(solarNoon(from, to, latitude, longitude), ref.noon);
  });

  it("puts the sun at about 52.8° at noon on 18 April and 65.3° at the solstice", () => {
    const april = sunPosition(Date.parse("2026-04-18T11:13:00Z"), latitude, longitude);
    expect(april.elevation).toBeGreaterThan(52.3);
    expect(april.elevation).toBeLessThan(53.3);
    expect(april.azimuth).toBeGreaterThan(178);
    expect(april.azimuth).toBeLessThan(182);
    const june = sunPosition(Date.parse("2026-06-21T11:16:00Z"), latitude, longitude);
    expect(june.elevation).toBeGreaterThan(64.8);
    expect(june.elevation).toBeLessThan(65.8);
  });

  it("rises in the east and sets in the west", () => {
    const morning = sunPosition(Date.parse("2026-04-18T05:00:00Z"), latitude, longitude);
    const evening = sunPosition(Date.parse("2026-04-18T17:30:00Z"), latitude, longitude);
    expect(morning.azimuth).toBeGreaterThan(60);
    expect(morning.azimuth).toBeLessThan(120);
    expect(evening.azimuth).toBeGreaterThan(240);
    expect(evening.azimuth).toBeLessThan(300);
  });
});

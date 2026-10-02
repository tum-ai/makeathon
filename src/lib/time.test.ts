import { describe, expect, it } from "vitest";

import {
  berlinMidnight,
  berlinOffsetMinutes,
  calendarDateOf,
  formatDateRange,
  formatElapsed,
  formatWeekdayClock,
  instantOffsetMinutes,
  parseInstant,
} from "./time";

describe("Munich time", () => {
  it("formats date spans in words, without dashes", () => {
    expect(formatDateRange("2026-04-17", "2026-04-19")).toBe("17 to 19 April 2026");
    expect(formatDateRange("2022-09-30", "2022-10-02")).toBe("30 September to 2 October 2022");
    expect(formatDateRange("2026-12-31", "2027-01-02")).toBe("31 December 2026 to 2 January 2027");
  });

  it("finds Munich midnight on either side of the DST switches", () => {
    expect(new Date(berlinMidnight("2026-03-29")).toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(new Date(berlinMidnight("2026-03-30")).toISOString()).toBe("2026-03-29T22:00:00.000Z");
    expect(new Date(berlinMidnight("2026-10-25")).toISOString()).toBe("2026-10-24T22:00:00.000Z");
    expect(new Date(berlinMidnight("2026-10-26")).toISOString()).toBe("2026-10-25T23:00:00.000Z");
  });

  it("reads clocks and offsets in Munich", () => {
    const kickoff = parseInstant("2026-04-17T18:00:00+02:00");
    expect(formatWeekdayClock(kickoff)).toBe("Fri 18:00");
    expect(calendarDateOf(kickoff + 7 * 3600_000)).toBe("2026-04-18");
    expect(berlinOffsetMinutes(kickoff)).toBe(120);
    expect(berlinOffsetMinutes(Date.parse("2026-01-15T12:00:00Z"))).toBe(60);
    expect(instantOffsetMinutes("2026-04-17T18:00:00+02:00")).toBe(120);
  });

  it("counts elapsed weekend time past 24 hours", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(822)).toBe("13:42");
    expect(formatElapsed(2880)).toBe("48:00");
  });

  it("rejects instants without an explicit offset", () => {
    expect(() => parseInstant("2026-04-17T18:00:00")).toThrow(/offset/);
  });
});

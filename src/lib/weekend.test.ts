import { describe, expect, it } from "vitest";

import { referenceWeekend } from "@/config/makeathon";

import { contrast, SKY_STOPS, skyWeights } from "./sky";
import { buildWeekendView } from "./weekend";
import { sampleSun } from "./weekend-view";

const view = buildWeekendView(referenceWeekend);

describe("weekend view", () => {
  it("samples the sun every ten minutes across the 48 hours", () => {
    expect(view.minutes).toBe(2880);
    expect(view.elevation).toHaveLength(289);
    expect(view.azimuth).toHaveLength(289);
  });

  it("has two nights inside the window, from the computed sunsets", () => {
    expect(view.nights).toHaveLength(2);
    for (const night of view.nights) {
      expect(night.to - night.from).toBeGreaterThan(9 * 60);
      expect(night.to - night.from).toBeLessThan(11 * 60);
      expect(sampleSun(view, (night.from + night.to) / 2).elevation).toBeLessThan(-10);
    }
  });

  it("places every moment inside the window, in order", () => {
    const times = view.moments.map((moment) => moment.at);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    for (const at of times) {
      expect(at).toBeGreaterThanOrEqual(0);
      expect(at).toBeLessThanOrEqual(view.minutes);
    }
  });

  it("labels sunrise with its computed time, and unknown times in words", () => {
    const sunrise = view.moments.find((moment) => moment.key === "sunrise-saturday");
    expect(sunrise?.when).toBe("Saturday 06:19");
    const pitches = view.moments.find((moment) => moment.key === "pitches");
    expect(pitches?.when).toBe("Sunday afternoon");
  });

  it("labels the days on the ruler", () => {
    expect(view.days.map((day) => day.label)).toEqual(["Friday", "Saturday", "Sunday"]);
  });
});

describe("sky", () => {
  it("is night below civil twilight and day well above the horizon", () => {
    expect(skyWeights(-20).night).toBeCloseTo(1);
    expect(skyWeights(-20).day).toBeCloseTo(0);
    expect(skyWeights(30).day).toBeCloseTo(1);
    expect(skyWeights(-2).twilight).toBeGreaterThan(0.5);
  });

  it("keeps white text readable on every sky colour", () => {
    for (const stop of Object.values(SKY_STOPS).flat())
      expect(contrast("#ffffff", stop)).toBeGreaterThanOrEqual(4.5);
  });
});

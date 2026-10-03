import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { berlinOffsetMinutes, instantOffsetMinutes, parseInstant } from "@/lib/time";

import {
  editions,
  league,
  nextEdition,
  organizations,
  partners,
  photos,
  referenceWeekend,
  results2026,
} from "./makeathon";

const publicFile = (src: string) => join(process.cwd(), "public", src);

function instants(value: unknown, found: string[] = []): string[] {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) found.push(value);
  else if (value && typeof value === "object")
    for (const v of Object.values(value)) instants(v, found);
  return found;
}

describe("config", () => {
  it("lists every edition once, oldest first, with a poster on disk", () => {
    expect(editions).toHaveLength(8);
    expect(new Set(editions.map((e) => e.key)).size).toBe(editions.length);
    const starts = editions.map((e) => e.start);
    expect(starts).toEqual([...starts].sort());
    for (const edition of editions) {
      expect(edition.start <= edition.end).toBe(true);
      expect(existsSync(publicFile(edition.poster.src))).toBe(true);
      expect(edition.poster.alt.length).toBeGreaterThan(20);
    }
  });

  it("has every logo and photo on disk", () => {
    for (const org of Object.values(organizations)) {
      if ("logo" in org) expect(existsSync(publicFile(org.logo.src)), org.name).toBe(true);
      if ("logoOnDark" in org)
        expect(existsSync(publicFile(org.logoOnDark.src)), org.name).toBe(true);
    }
    for (const photo of Object.values(photos)) expect(existsSync(publicFile(photo.src))).toBe(true);
  });

  it("gives the 2026 results four challenges with five places each", () => {
    expect(results2026.challenges).toHaveLength(4);
    for (const challenge of results2026.challenges) {
      expect(challenge.teams).toHaveLength(league.points.length);
      expect("logoOnDark" in organizations[challenge.partner]).toBe(true);
    }
    for (const key of results2026.techPartners)
      expect("logoOnDark" in organizations[key]).toBe(true);
    expect(new Set(partners.past).size).toBe(partners.past.length);
  });

  it("writes every instant with Munich's real offset at that moment", () => {
    const all = instants({ nextEdition, referenceWeekend });
    expect(all.length).toBeGreaterThan(0);
    for (const instant of all)
      expect(instantOffsetMinutes(instant), instant).toBe(
        berlinOffsetMinutes(parseInstant(instant)),
      );
  });

  it("words every unconfirmed moment instead of inventing a time", () => {
    for (const moment of referenceWeekend.moments)
      if (!moment.confirmed) expect(moment.approx, moment.key).toBeTruthy();
  });

  it("keeps the list of open content questions from growing silently", () => {
    // Lower this number as facts arrive; raise it only together with a new,
    // deliberate gap in the config.
    const source = readFileSync(join(process.cwd(), "src/config/makeathon.ts"), "utf8");
    expect(source.match(/TODO\(content\)/g)?.length).toBe(10);
  });
});

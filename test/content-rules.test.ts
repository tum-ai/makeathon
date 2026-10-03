import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function files(dir: string, extensions: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, extensions);
    return extensions.test(name) ? [path] : [];
  });
}

const sources = files(join(root, "src"), /\.(ts|tsx|css)$/).filter(
  (path) => !/\.test\.tsx?$/.test(path),
);

describe("content rules", () => {
  it("uses no em or en dashes anywhere in the site's source", () => {
    const offenders = sources.filter((path) => /[–—]/.test(readFileSync(path, "utf8")));
    expect(offenders.map((path) => relative(root, path))).toEqual([]);
  });

  it("keeps the Makeathon sun ramp to the sun, the dots and the clock", () => {
    const allowed = new Set([
      "src/app/globals.css",
      "src/styles/hero.css",
      "src/styles/weekend.css",
      "src/styles/close.css",
      // The halftone dots' colours, by name in comments.
      "src/lib/sky.ts",
    ]);
    const users = sources
      .filter((path) => /sun-[1-9]00/.test(readFileSync(path, "utf8")))
      .map((path) => relative(root, path));
    expect(users.filter((path) => !allowed.has(path))).toEqual([]);
  });
});

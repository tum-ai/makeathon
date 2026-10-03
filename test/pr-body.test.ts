import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { checkPullRequest, isVisualFile } from "../scripts/pr-body.mjs";

const template = readFileSync(join(process.cwd(), ".github/pull_request_template.md"), "utf8");

function filled({ screenshots = "" } = {}) {
  return template
    .replace("## What changed\n", "## What changed\n\nMoves the FAQ above the close.\n")
    .replace("## Why\n", "## Why\n\nVisitors look for it before applying.\n")
    .replaceAll("- [ ]", "- [x]")
    .replace("|             |                |", screenshots);
}

const twoImages =
  '| ![phone](https://github.com/user-attachments/assets/a) | <img src="https://github.com/user-attachments/assets/b" alt="desktop"> |';

describe("pull request body check", () => {
  it("passes a filled template for a change nobody sees", () => {
    expect(
      checkPullRequest({ body: filled(), files: ["scripts/pr-body.mjs"], labels: [] }),
    ).toEqual([]);
  });

  it("fails the empty template on every required section", () => {
    const problems = checkPullRequest({ body: template, files: [], labels: [] });
    expect(problems.filter((p) => p.includes("is empty"))).toHaveLength(2);
    expect(problems.filter((p) => p.startsWith("Unticked"))).toHaveLength(6);
  });

  it("fails a body without the template", () => {
    const problems = checkPullRequest({ body: "Small fix.", files: [], labels: [] });
    expect(problems).toHaveLength(3);
    expect(problems[0]).toContain('"## What changed"');
  });

  it("accepts an unticked box marked n/a", () => {
    const body = filled().replace(
      "- [x] Screenshots attached for visible changes",
      "- [ ] Screenshots attached for visible changes (n/a: config only)",
    );
    expect(checkPullRequest({ body, files: [], labels: [] })).toEqual([]);
  });

  it("ignores boxes outside the verification section and inside comments", () => {
    const body = `${filled()}\n- [ ] a follow-up\n<!-- - [ ] hidden -->\n`;
    expect(checkPullRequest({ body, files: [], labels: [] })).toEqual([]);
  });

  it("requires screenshots when a visible file changes", () => {
    const problems = checkPullRequest({
      body: filled(),
      files: ["src/sections/faq.tsx", "src/styles/hero.css"],
      labels: [],
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("2 visible file(s)");
    expect(problems[0]).toContain("has 0 image(s)");
  });

  it("does not count images in the template comment or other sections", () => {
    const body = filled().replace("## Why\n", "## Why\n\n![before](x.png) ![after](y.png)\n");
    expect(checkPullRequest({ body, files: ["src/app/page.tsx"], labels: [] })).toHaveLength(1);
  });

  it("passes a visible change with a phone and a desktop screenshot", () => {
    const body = filled({ screenshots: twoImages });
    expect(checkPullRequest({ body, files: ["src/app/page.tsx"], labels: [] })).toEqual([]);
  });

  it("skips the screenshots for the no-visual-change label", () => {
    expect(
      checkPullRequest({
        body: filled(),
        files: ["src/lib/solar.ts"],
        labels: ["no-visual-change"],
      }),
    ).toEqual([]);
  });

  it("treats src and public as visible, tests and tooling as not", () => {
    expect(isVisualFile("src/sections/hero.tsx")).toBe(true);
    expect(isVisualFile("src/config/makeathon.ts")).toBe(true);
    expect(isVisualFile("public/og.png")).toBe(true);
    expect(isVisualFile("src/lib/solar.test.ts")).toBe(false);
    expect(isVisualFile("src/sections/hero.test.tsx")).toBe(false);
    expect(isVisualFile("e2e/site.spec.ts")).toBe(false);
    expect(isVisualFile(".github/workflows/ci.yml")).toBe(false);
  });
});

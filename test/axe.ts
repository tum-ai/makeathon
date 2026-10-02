import axe from "axe-core";
import { expect } from "vitest";

/**
 * Runs axe on a rendered container and fails on any violation. Colour
 * contrast is left to the browser tests: jsdom does not compute styles.
 */
export async function expectNoAxeViolations(container: Element) {
  const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  const summary = results.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(", ")}`,
  );
  expect(summary).toEqual([]);
}

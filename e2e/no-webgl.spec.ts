import { expect, test } from "@playwright/test";

// Runs in the `chromium-no-webgl` project: the hero must keep its CSS dots.
test("shows the CSS dot field without WebGL", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#top [data-halftone]")).toHaveAttribute("data-halftone", "css");
});

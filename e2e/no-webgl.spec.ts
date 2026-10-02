import { expect, test } from "@playwright/test";

// Chromium without WebGL: the hero must keep its server-rendered CSS dots.
test.use({ launchOptions: { args: ["--disable-webgl", "--disable-3d-apis"] } });

test("shows the CSS dot field without WebGL", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "the flags are Chromium's");
  await page.goto("/");
  await page.waitForTimeout(1500);
  await expect(page.locator("#top [data-halftone]")).toHaveAttribute("data-halftone", "css");
});

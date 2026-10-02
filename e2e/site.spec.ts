import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("the Makeathon site", () => {
  test("loads with one headline, both audiences and no errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("TUM.ai Makeathon");
    await expect(page.locator("h1")).toHaveCount(1);
    const hero = page.locator("#top");
    await expect(hero.getByRole("link", { name: /follow for the dates/i })).toBeVisible();
    await expect(hero.getByRole("link", { name: /partner with us/i })).toHaveAttribute(
      "href",
      "#partners",
    );
    for (const id of ["weekend", "results", "editions", "partners", "faq"])
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });

  test("leaves Safari's bars to the page", async ({ page }) => {
    await page.goto("/");
    // A dark color-scheme meta makes Safari fill its bars solid (AGENTS.md, "Safari bars").
    await expect(page.locator('meta[name="color-scheme"]')).toHaveCount(0);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#0d0214");
  });

  test("passes axe (WCAG 2 A and AA)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test("scrubs the 2026 weekend by scrolling", async ({ page, isMobile }) => {
    test.skip(isMobile, "the same driver; covered on desktop");
    await page.goto("/");
    const slider = page.getByRole("slider", { name: /48 hours/ });
    const box = await page.locator(".replay").evaluate((el) => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      span: el.scrollHeight - (el.firstElementChild as HTMLElement).offsetHeight,
    }));
    await page.evaluate(({ top, span }) => window.scrollTo(0, top + span * 0.5), box);
    await expect(slider).toHaveAttribute("aria-valuetext", /^Sat /);
    await page.evaluate(({ top, span }) => window.scrollTo(0, top + span), box);
    await expect(slider).toHaveAttribute("aria-valuenow", "2880");
  });

  test("keeps the weekend in the flow under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const position = await page
      .locator(".replay-stage")
      .evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("relative");
    const slider = page.getByRole("slider", { name: /48 hours/ });
    await slider.focus();
    const before = Number(await slider.getAttribute("aria-valuenow"));
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", String(before + 30));
  });
});

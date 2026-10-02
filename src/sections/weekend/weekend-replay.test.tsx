import { expectNoAxeViolations } from "@test/axe";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { referenceWeekend } from "@/config/makeathon";
import { buildWeekendView } from "@/lib/weekend";

import { WeekendReplay } from "./weekend-replay";

const view = buildWeekendView(referenceWeekend);

describe("WeekendReplay", () => {
  it("is a keyboard slider over the 48 hours", async () => {
    const { container } = render(<WeekendReplay view={view} />);
    const slider = screen.getByRole("slider", { name: /48 hours/ });
    expect(slider).toHaveAttribute("aria-valuemax", "2880");
    const start = Number(slider.getAttribute("aria-valuenow"));

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    await waitFor(() => expect(Number(slider.getAttribute("aria-valuenow"))).toBe(start + 30));
    fireEvent.keyDown(slider, { key: "End" });
    await waitFor(() => expect(slider).toHaveAttribute("aria-valuenow", "2880"));
    expect(slider.getAttribute("aria-valuetext")).toMatch(/^Sun 18:00, 48:00 hours in/);
    fireEvent.keyDown(slider, { key: "Home" });
    await waitFor(() => expect(slider).toHaveAttribute("aria-valuenow", "0"));

    await expectNoAxeViolations(container);
  });

  it("lists every moment for assistive technology", () => {
    render(<WeekendReplay view={view} />);
    const list = screen.getByRole("list", { name: /moment by moment/ });
    expect(list.querySelectorAll("li")).toHaveLength(view.moments.length);
    expect(list).toHaveTextContent("Saturday 06:19: Sunrise.");
  });

  it("keeps the CSS dot field when WebGL is unavailable", async () => {
    const { container } = render(<WeekendReplay view={view} />);
    const field = container.querySelector("[data-halftone]");
    // Pending (CSS dots hidden) until the renderer has tried, then the fallback.
    expect(field).toHaveAttribute("data-halftone", "pending");
    await waitFor(() => expect(field).toHaveAttribute("data-halftone", "css"));
    expect(field?.closest("[aria-hidden='true']")).not.toBeNull();
  });
});

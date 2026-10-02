import { expectNoAxeViolations } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { type NextEdition, nextEdition } from "@/config/makeathon";
import { heroView } from "@/lib/phase";

import { HeroStatus } from "./hero-status";

const open: NextEdition = {
  year: 2027,
  weekend: { kickoff: "2027-04-16T18:00:00+02:00", end: "2027-04-18T18:00:00+02:00" },
  venue: null,
  applications: {
    opens: "2026-01-01T00:00:00+01:00",
    closes: "2099-04-04T23:59:00+02:00",
    url: "https://example.com/apply",
  },
  notifyUrl: null,
};

describe("HeroStatus", () => {
  it("renders the server's view without a clock, so hydration matches", () => {
    const initial = heroView(open, Date.parse("2026-10-02T12:00:00+02:00"));
    const html = renderToString(<HeroStatus edition={open} initial={initial} />);
    expect(html).toContain("Applications are open");
    expect(html).not.toContain("Applications close in");
  });

  it("adds the countdown on the client and links both audiences", async () => {
    const initial = heroView(open, Date.now());
    const { container } = render(<HeroStatus edition={open} initial={initial} />);
    expect(screen.getByText("Applications close in")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /apply now/i })).toHaveAttribute(
      "href",
      "https://example.com/apply",
    );
    expect(screen.getByRole("link", { name: /partner with us/i })).toHaveAttribute(
      "href",
      "#partners",
    );
    await expectNoAxeViolations(container);
  });

  it("says the next edition is in the making while nothing is fixed", () => {
    const initial = heroView(nextEdition, Date.now());
    render(<HeroStatus edition={nextEdition} initial={initial} />);
    expect(screen.getByText(/in the making/)).toBeInTheDocument();
  });
});

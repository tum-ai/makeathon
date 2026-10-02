import { expectNoAxeViolations } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type EditionRow, EditionsLedger } from "./editions-ledger";

const rows: EditionRow[] = ["2026", "2025", "2024"].map((year) => ({
  key: year,
  year,
  name: `Makeathon ${year}`,
  when: `Some days in April ${year}, Munich`,
  note: "A note.",
  poster: { src: `/editions/makeathon-${year}.webp`, alt: `The ${year} poster` },
  link:
    year === "2024"
      ? { label: "Read the paper", href: "https://arxiv.org/abs/2510.25277" }
      : undefined,
}));

describe("EditionsLedger", () => {
  it("follows the pointer and the keyboard to the active edition", async () => {
    const { container } = render(<EditionsLedger rows={rows} label="Every Makeathon" />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-active");

    fireEvent.pointerEnter(items[1] as HTMLElement);
    expect(items[1]).toHaveAttribute("data-active");
    expect(items[0]).not.toHaveAttribute("data-active");

    fireEvent.focus(screen.getByRole("link", { name: /read the paper/i }));
    expect(items[2]).toHaveAttribute("data-active");

    await expectNoAxeViolations(container);
  });

  it("names each edition with its year", () => {
    render(<EditionsLedger rows={rows} label="Every Makeathon" />);
    expect(screen.getByRole("heading", { name: /^2025:\s*Makeathon 2025$/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "The 2025 poster" })).toBeInTheDocument();
  });
});

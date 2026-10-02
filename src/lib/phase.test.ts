import { describe, expect, it } from "vitest";

import { type NextEdition, nextEdition, site } from "@/config/makeathon";

import { closeActions, getPhase, headerAction, heroView } from "./phase";

const at = (instant: string) => Date.parse(instant);

const scheduled: NextEdition = {
  year: 2027,
  weekend: { kickoff: "2027-04-16T18:00:00+02:00", end: "2027-04-18T18:00:00+02:00" },
  venue: "TUM Main Campus, Munich",
  applications: {
    opens: "2027-02-01T10:00:00+01:00",
    closes: "2027-04-04T23:59:00+02:00",
    url: "https://example.com/apply",
  },
  notifyUrl: null,
};

describe("phase", () => {
  it.each([
    ["2027-01-15T12:00:00+01:00", "announced"],
    ["2027-02-01T10:00:00+01:00", "applications-open"],
    ["2027-04-04T23:58:59+02:00", "applications-open"],
    ["2027-04-04T23:59:00+02:00", "applications-closed"],
    ["2027-04-16T18:00:00+02:00", "live"],
    ["2027-04-18T18:00:00+02:00", "recap"],
  ])("at %s is %s", (now, phase) => {
    expect(getPhase(scheduled, at(now))).toBe(phase);
  });

  it("stays announced while nothing is fixed, and says so", () => {
    const view = heroView(nextEdition, at("2026-10-02T12:00:00+02:00"));
    expect(view.phase).toBe("announced");
    expect(view.status).toContain("in the making");
    expect(view.countdown).toBeUndefined();
    expect(view.primary.href).toBe(nextEdition.notifyUrl ?? site.social.instagram);
    expect(view.secondary.href).toBe("#partners");
  });

  it("counts down to the application deadline while applications are open", () => {
    const view = heroView(scheduled, at("2027-03-01T12:00:00+01:00"));
    expect(view.detail).toBe("16 to 18 April 2027, TUM Main Campus, Munich");
    expect(view.countdown?.to).toBe(at("2027-04-04T23:59:00+02:00"));
    expect(view.primary).toMatchObject({ label: "Apply now", href: "https://example.com/apply" });
    expect(headerAction(scheduled, at("2027-03-01T12:00:00+01:00")).label).toBe("Apply now");
    expect(closeActions(scheduled, at("2027-03-01T12:00:00+01:00"))[0].label).toBe("Apply now");
  });

  it("counts down to kick-off once applications close", () => {
    const view = heroView(scheduled, at("2027-04-10T12:00:00+02:00"));
    expect(view.countdown).toMatchObject({ label: "Kick-off in" });
  });
});

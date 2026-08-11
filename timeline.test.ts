import { describe, expect, it } from "vitest";
import { activeTransfer, currentGap, latestByCategory } from "./timeline";
import type { Milestone, TechTransfer } from "./timeline";

// Small synthetic fixture — deliberately not the real dataset, so these
// tests prove the contract (scrolling to a year changes the readout)
// independently of the actual milestone content.
const MILESTONES: Milestone[] = [
  { year: 1903, category: "civil", title: "Origin" },
  { year: 1944, category: "fighter", title: "Fighter A" },
  { year: 1949, category: "civil", title: "Civil A" },
  { year: 1989, category: "bomber", title: "Bomber A" },
];

const TRANSFERS: TechTransfer[] = [
  {
    name: "Jet propulsion",
    militaryYear: 1944,
    militaryLabel: "Fighter A",
    civilYear: 1949,
    civilLabel: "Civil A",
  },
  {
    name: "Stealth shaping",
    militaryYear: 1989,
    militaryLabel: "Bomber A",
    civilYear: null,
    civilLabel: null,
  },
];

describe("latestByCategory", () => {
  it("returns the most recent milestone in a category at or before the year", () => {
    expect(latestByCategory(MILESTONES, 1950, "civil")?.title).toBe("Civil A");
  });

  it("ignores milestones after the focus year", () => {
    expect(latestByCategory(MILESTONES, 1940, "civil")?.title).toBe("Origin");
  });

  it("returns undefined when no milestone in that category has happened yet", () => {
    expect(latestByCategory(MILESTONES, 1910, "fighter")).toBeUndefined();
  });
});

describe("activeTransfer", () => {
  it("picks the transfer whose military debut is most recent at the focus year", () => {
    expect(activeTransfer(TRANSFERS, 1960)?.name).toBe("Jet propulsion");
    expect(activeTransfer(TRANSFERS, 2000)?.name).toBe("Stealth shaping");
  });

  it("returns undefined before any transfer's military debut", () => {
    expect(activeTransfer(TRANSFERS, 1920)).toBeUndefined();
  });
});

describe("currentGap", () => {
  it("reports the pre-flight state before any transfer exists", () => {
    expect(currentGap(TRANSFERS, 1920)).toContain("before powered flight");
  });

  it("reports an open gap while military-only and civil hasn't caught up", () => {
    const text = currentGap(TRANSFERS, 1946);
    expect(text).toContain("Jet propulsion");
    expect(text).toContain("doesn't yet");
  });

  it("reports the closed gap once civil has caught up", () => {
    const text = currentGap(TRANSFERS, 1949);
    expect(text).toContain("Jet propulsion");
    expect(text).toContain("5-year gap");
  });

  it("reports an unclosed gap for a technology with no civil equivalent", () => {
    const text = currentGap(TRANSFERS, 2000);
    expect(text).toContain("Stealth shaping");
    expect(text).toContain("no civil equivalent");
  });

  it("changes as the focus year advances — the actual interaction contract", () => {
    const early = currentGap(TRANSFERS, 1946);
    const late = currentGap(TRANSFERS, 2000);
    expect(early).not.toBe(late);
  });
});

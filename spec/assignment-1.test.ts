import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// The core interaction: scrolling the timeline changes the readout. This
// asserts the built page has both hooks and a genuinely large, categorized
// dataset — the assignment's scope commitment was 50+ milestones across
// three lanes, not a smaller curated set, so a regression back down to a
// handful of items should fail here.
describe("assignment 1 spec", () => {
  const distPath = resolve("dist/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("builds dist/index.html", () => {
    expect(existsSync(distPath), `${distPath} not found — run pnpm build first.`).toBe(true);
  });

  it("marks the core interaction's trigger and target", () => {
    expect(doc?.querySelector('[data-testid="core-interaction-trigger"]')).toBeTruthy();
    expect(doc?.querySelector('[data-testid="core-interaction-target"]')).toBeTruthy();
  });

  it("has at least 50 dated milestones", () => {
    const milestones = doc?.querySelectorAll("[data-year]") ?? [];
    expect(milestones.length).toBeGreaterThanOrEqual(50);
  });

  it("spreads milestones across all three categories", () => {
    const categories = ["civil", "fighter", "bomber"] as const;
    for (const category of categories) {
      const count = doc?.querySelectorAll(`[data-category="${category}"]`).length ?? 0;
      expect(count, `expected milestones in the "${category}" lane`).toBeGreaterThan(5);
    }
  });

  it("gives every milestone a year that is a plausible 20th/21st century date", () => {
    const years = Array.from(doc?.querySelectorAll("[data-year]") ?? []).map((el) =>
      Number(el.getAttribute("data-year")),
    );
    for (const year of years) {
      expect(Number.isInteger(year)).toBe(true);
      expect(year).toBeGreaterThanOrEqual(1903);
      expect(year).toBeLessThanOrEqual(2026);
    }
  });
});

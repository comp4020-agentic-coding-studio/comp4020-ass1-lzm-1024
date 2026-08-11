import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Turns the assignment 1 spec line "the visitor does something that changes
// what they see" into a test. Placeholder until the core interaction is
// picked — replace the selectors and assertion below with the real
// trigger/target once index.html and main.ts implement it.
const TODO =
  "Pick the core interaction, mark its trigger and its changing target with data-testid, then replace this test with a real assertion — see spec/README.md.";

describe("assignment 1 spec", () => {
  it("marks a core interaction that changes what the visitor sees", () => {
    const distPath = resolve("dist/index.html");
    expect(existsSync(distPath), `${distPath} not found. ${TODO}`).toBe(true);

    const doc = new JSDOM(readFileSync(distPath, "utf8")).window.document;

    const trigger = doc.querySelector(
      '[data-testid="core-interaction-trigger"]',
    );
    const target = doc.querySelector(
      '[data-testid="core-interaction-target"]',
    );

    expect(trigger, `No interaction trigger found. ${TODO}`).toBeTruthy();
    expect(target, `No interaction target found. ${TODO}`).toBeTruthy();
  });
});

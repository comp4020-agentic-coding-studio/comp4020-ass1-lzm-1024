import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

describe("assignment 1 stopping-distance explainer", () => {
  const distPath = resolve("dist/index.html");
  const experimentsPath = resolve("dist/experiments.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;
  const experimentsDoc = existsSync(experimentsPath)
    ? new JSDOM(readFileSync(experimentsPath, "utf8")).window.document
    : null;

  it("builds the explainer", () => {
    expect(existsSync(distPath), `${distPath} not found - run pnpm build first.`).toBe(true);
  });

  it("marks the core interaction trigger and target", () => {
    expect(doc?.querySelector('[data-testid="core-interaction-trigger"]')).toBeTruthy();
    expect(doc?.querySelector('[data-testid="core-interaction-target"]')).toBeTruthy();
  });

  it("has exactly one top-level heading naming the central question", () => {
    const headings = doc?.querySelectorAll("h1") ?? [];
    expect(headings.length).toBe(1);
    expect(headings[0]?.textContent).toContain("road");
  });

  it("provides the three intended controls", () => {
    const speed = doc?.querySelector<HTMLInputElement>("#speed");
    const tread = doc?.querySelector<HTMLInputElement>("#tread-depth");
    expect(speed?.type).toBe("range");
    expect(Number(speed?.min)).toBe(40);
    expect(Number(speed?.max)).toBe(110);
    expect(tread?.type).toBe("range");
    expect(Number(tread?.min)).toBe(1.6);
    expect(Number(tread?.max)).toBe(8);
    expect(doc?.querySelector('input[name="road-condition"][value="dry"]')).toBeTruthy();
    expect(doc?.querySelector('input[name="road-condition"][value="wet"]')).toBeTruthy();
  });

  it("associates visible labels with both range inputs", () => {
    for (const id of ["speed", "tread-depth"]) {
      expect(doc?.querySelector(`label[for="${id}"]`)?.textContent?.trim()).not.toBe("");
    }
  });

  it("keeps the truck comparison separate and source-bounded", () => {
    const truckSpeed = doc?.querySelector<HTMLInputElement>("#truck-speed");
    expect(truckSpeed?.type).toBe("range");
    expect(Number(truckSpeed?.min)).toBe(60);
    expect(Number(truckSpeed?.max)).toBe(100);
    expect(Number(truckSpeed?.step)).toBe(10);
    expect(doc?.querySelector('label[for="truck-speed"]')?.textContent?.trim()).not.toBe("");
    expect(doc?.querySelector(".truck-caveat")?.textContent).toContain("does not break");
  });

  it("separates reaction, braking and total distance in a live readout", () => {
    const readout = doc?.querySelector("#readout");
    expect(readout?.getAttribute("aria-live")).toBeTruthy();
    expect(readout?.querySelector("#reaction-distance")).toBeTruthy();
    expect(readout?.querySelector("#braking-distance")).toBeTruthy();
    expect(readout?.querySelector("#total-distance-secondary")).toBeTruthy();
  });

  it("links to a separate reaction and obstacle experiment page", () => {
    expect(doc?.querySelector('a[href="./experiments.html"]')).toBeTruthy();
    expect(existsSync(experimentsPath)).toBe(true);
    expect(experimentsDoc?.querySelector('a[href="./index.html"]')).toBeTruthy();
    expect(experimentsDoc?.querySelector("#reaction-start")).toBeTruthy();
    expect(experimentsDoc?.querySelector("#reaction-brake")).toBeTruthy();
    expect(experimentsDoc?.querySelector("#challenge-test")).toBeTruthy();
    expect(experimentsDoc?.querySelector("#following-test")).toBeTruthy();
    expect(experimentsDoc?.querySelector("#duel-test")).toBeTruthy();
    expect(experimentsDoc?.querySelectorAll("[data-prediction]").length).toBe(3);
  });

  it("offers the same five language modes on both pages", () => {
    for (const page of [doc, experimentsDoc]) {
      const selector = page?.querySelector<HTMLSelectElement>("[data-language-select]");
      expect(selector?.options.length).toBe(5);
      expect([...selector?.options ?? []].map((option) => option.value)).toEqual([
        "en", "zh-CN", "zh-TW", "ja", "ko",
      ]);
    }
  });

  it("explains the experiment model and device limitations", () => {
    expect(experimentsDoc?.querySelector(".device-note")?.textContent).toContain("device latency");
    expect(experimentsDoc?.querySelector(".model-disclaimer")?.textContent).toContain("Educational model");
  });

  it("includes an official-source severe-weather tutorial", () => {
    expect(experimentsDoc?.querySelectorAll('[role="tab"][data-weather-tab]').length).toBe(5);
    expect(experimentsDoc?.querySelectorAll('[role="tabpanel"][data-weather-panel]').length).toBe(5);
    expect(experimentsDoc?.querySelector("#weather-panel-rain")?.textContent).toContain("4 seconds");
    expect(experimentsDoc?.querySelector("#weather-panel-flood")?.textContent).toContain("Never attempt");
    expect(experimentsDoc?.querySelectorAll(".weather-sources a").length).toBeGreaterThanOrEqual(4);
  });
});

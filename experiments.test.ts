// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mountExperiments(): void {
  document.body.innerHTML = `
    <section id="reaction-game" data-state="idle">
      <p id="reaction-status"></p><p id="reaction-instruction"></p>
      <button id="reaction-start" type="button">Start driving</button>
      <button id="reaction-brake" type="button" disabled>Brake</button>
    </section>
    <div id="reaction-result" hidden>
      <output id="measured-reaction"></output>
      <output id="measured-reaction-distance"></output>
    </div>
    <section id="challenge-stage"></section>
    <input id="challenge-speed" type="range" min="30" max="110" value="70" />
    <input id="challenge-reaction" type="range" min="0.1" max="3" step="0.01" value="1.2" />
    <input id="challenge-obstacle" type="range" min="30" max="120" value="55" />
    <input type="radio" name="challenge-surface" value="dry" />
    <input type="radio" name="challenge-surface" value="wet" checked />
    <input type="radio" name="challenge-surface" value="ice" />
    <button id="challenge-test" type="button">Test</button>
    <output id="challenge-speed-value"></output>
    <output id="challenge-reaction-value"></output>
    <output id="challenge-obstacle-value"></output>
    <output id="challenge-reaction-distance"></output>
    <output id="challenge-braking-distance"></output>
    <output id="challenge-total-distance"></output>
    <output id="challenge-obstacle-distance"></output>
    <span id="road-reaction-distance"></span>
    <span id="road-braking-distance"></span>
    <span id="road-obstacle-distance"></span>
    <section id="challenge-feedback">
      <p id="feedback-kicker"></p><h3 id="feedback-title"></h3>
      <output id="feedback-number"></output><span id="feedback-unit"></span><p id="feedback-copy"></p>
    </section>
    <button data-weather-tab="prepare" role="tab" aria-selected="true"></button>
    <button data-weather-tab="rain" role="tab" aria-selected="false" tabindex="-1"></button>
    <section data-weather-panel="prepare" role="tabpanel"></section>
    <section data-weather-panel="rain" role="tabpanel" hidden></section>
  `;
}

async function loadExperiments(): Promise<void> {
  vi.resetModules();
  mountExperiments();
  await import("./experiments");
}

describe("reaction and obstacle experiments", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("measures a reaction and transfers it into the challenge", async () => {
    const now = vi.spyOn(performance, "now");
    now.mockReturnValueOnce(1000).mockReturnValueOnce(1820);
    await loadExperiments();
    document.querySelector<HTMLButtonElement>("#reaction-start")?.click();
    vi.advanceTimersByTime(1000);
    document.querySelector<HTMLButtonElement>("#reaction-brake")?.click();

    expect(document.querySelector("#measured-reaction")?.textContent).toBe("0.82");
    expect(document.querySelector("#measured-reaction-distance")?.textContent).toBe("18.2");
    expect(document.querySelector<HTMLInputElement>("#challenge-reaction")?.value).toBe("0.82");
  });

  it("detects an early brake before the random hazard", async () => {
    await loadExperiments();
    document.querySelector<HTMLButtonElement>("#reaction-start")?.click();
    document.querySelector<HTMLButtonElement>("#reaction-brake")?.click();
    expect(document.querySelector("#reaction-status")?.textContent).toContain("Too early");
    expect(document.querySelector("#reaction-game")?.getAttribute("data-state")).toBe("idle");
  });

  it("reports collision speed and a safer target speed", async () => {
    await loadExperiments();
    document.querySelector<HTMLButtonElement>("#challenge-test")?.click();
    expect(document.querySelector("#challenge-feedback")?.getAttribute("data-outcome")).toBe("collision");
    expect(Number(document.querySelector("#feedback-number")?.textContent)).toBeGreaterThan(0);
    expect(document.querySelector("#feedback-copy")?.textContent).toContain("Reducing from 70 km/h");
  });

  it("switches weather tutorial panels with click and arrow keys", async () => {
    await loadExperiments();
    const prepare = document.querySelector<HTMLButtonElement>('[data-weather-tab="prepare"]')!;
    const rain = document.querySelector<HTMLButtonElement>('[data-weather-tab="rain"]')!;
    rain.click();
    expect(rain.getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector<HTMLElement>('[data-weather-panel="rain"]')?.hidden).toBe(false);
    rain.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(prepare.getAttribute("aria-selected")).toBe("true");
  });
});

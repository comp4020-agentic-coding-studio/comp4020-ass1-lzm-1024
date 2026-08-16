// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

function mountSimulator(): void {
  document.body.innerHTML = `
    <div class="road-visual" data-testid="core-interaction-target"></div>
    <input type="range" id="speed" min="40" max="110" value="80" data-testid="core-interaction-trigger" />
    <input type="range" id="tread-depth" min="1.6" max="8" step="0.1" value="3" />
    <input type="radio" name="road-condition" value="dry" />
    <input type="radio" name="road-condition" value="wet" checked />
    <output id="speed-value"></output>
    <output id="tread-value"></output>
    <output id="reaction-distance"></output>
    <output id="braking-distance"></output>
    <output id="total-distance"></output>
    <output id="total-distance-secondary"></output>
    <p id="model-note"></p>
    <div class="preset-buttons">
      <button type="button" data-speed="50" data-tread="8" data-road="dry">City</button>
    </div>
    <output id="faster-speed"></output>
    <output id="slower-speed"></output>
    <output id="faster-speed-copy"></output>
    <output id="slower-speed-copy"></output>
    <output id="extra-distance"></output>
    <output id="residual-speed"></output>
    <section class="truck-comparison">
      <input type="range" id="truck-speed" min="60" max="100" step="10" value="80" />
      <output id="truck-speed-value"></output>
      <output id="truck-car-distance"></output>
      <output id="truck-distance"></output>
      <output id="truck-extra-distance"></output>
    </section>
  `;
}

async function loadMain(): Promise<void> {
  vi.resetModules();
  mountSimulator();
  await import("./main");
}

function input(id: string, value: number): void {
  const control = document.querySelector<HTMLInputElement>(`#${id}`)!;
  control.value = String(value);
  control.dispatchEvent(new Event("input", { bubbles: true }));
}

function chooseRoad(value: "dry" | "wet"): void {
  const control = document.querySelector<HTMLInputElement>(`input[value="${value}"]`)!;
  control.checked = true;
  control.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("stopping-distance interaction", () => {
  beforeEach(loadMain);

  it("updates every distance when speed changes", () => {
    input("speed", 100);
    expect(document.querySelector("#speed-value")?.textContent).toBe("100 km/h");
    expect(document.querySelector("#reaction-distance")?.textContent).toBe("41.7");
    expect(document.querySelector("#total-distance")?.textContent).toBe(
      document.querySelector("#total-distance-secondary")?.textContent,
    );
  });

  it("moves the reaction, braking and stop markers rather than updating text alone", () => {
    const scene = document.querySelector<HTMLElement>(".road-visual")!;
    input("speed", 40);
    const at40 = Number(scene.style.getPropertyValue("--total-position").replace("%", ""));
    input("speed", 110);
    const at110 = Number(scene.style.getPropertyValue("--total-position").replace("%", ""));
    expect(at110).toBeGreaterThan(at40);
    expect(scene.style.getPropertyValue("--reaction-width")).not.toBe("");
    expect(scene.style.getPropertyValue("--braking-width")).not.toBe("");
  });

  it("makes shallow tread increase wet braking distance", () => {
    chooseRoad("wet");
    input("tread-depth", 8);
    const fullTread = Number(document.querySelector("#braking-distance")?.textContent);
    input("tread-depth", 1.6);
    const wornTread = Number(document.querySelector("#braking-distance")?.textContent);
    expect(wornTread).toBeGreaterThan(fullTread);
  });

  it("applies only the small measured dry-road tread effect", () => {
    chooseRoad("dry");
    input("tread-depth", 8);
    const fullTread = Number(document.querySelector("#braking-distance")?.textContent);
    input("tread-depth", 1.6);
    const wornTread = Number(document.querySelector("#braking-distance")?.textContent);
    expect(wornTread).toBeLessThan(fullTread);
    expect(wornTread / fullTread).toBeGreaterThan(0.98);
    expect(document.querySelector("#model-note")?.textContent).toContain("Tire Rack");
  });

  it("updates both native slider fills", () => {
    input("speed", 75);
    input("tread-depth", 4.8);
    expect(document.querySelector<HTMLElement>("#speed")?.style.getPropertyValue("--fill")).not.toBe("");
    expect(document.querySelector<HTMLElement>("#tread-depth")?.style.getPropertyValue("--fill")).not.toBe("");
  });

  it("applies scenario presets through the same source-of-truth controls", () => {
    document.querySelector<HTMLButtonElement>(".preset-buttons button")?.click();
    expect(document.querySelector<HTMLInputElement>("#speed")?.value).toBe("50");
    expect(document.querySelector<HTMLInputElement>("#tread-depth")?.value).toBe("8");
    expect(document.querySelector<HTMLInputElement>('input[value="dry"]')?.checked).toBe(true);
    expect(document.querySelector("#speed-value")?.textContent).toBe("50 km/h");
  });

  it("updates the live 10 km/h comparison", () => {
    input("speed", 90);
    expect(document.querySelector("#faster-speed")?.textContent).toBe("90");
    expect(document.querySelector("#slower-speed")?.textContent).toBe("80");
    expect(Number(document.querySelector("#extra-distance")?.textContent)).toBeGreaterThan(0);
    expect(Number(document.querySelector("#residual-speed")?.textContent)).toBeGreaterThan(0);
  });

  it("updates the separate published truck comparison", () => {
    input("truck-speed", 100);
    expect(document.querySelector("#truck-speed-value")?.textContent).toBe("100 km/h");
    expect(document.querySelector("#truck-car-distance")?.textContent).toBe("157");
    expect(document.querySelector("#truck-distance")?.textContent).toBe("194");
    expect(document.querySelector("#truck-extra-distance")?.textContent).toBe("37");
    expect(document.querySelector<HTMLElement>(".truck-comparison")?.style.getPropertyValue("--truck-distance-width"))
      .toBe("97.00%");
  });
});

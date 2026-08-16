import { describe, expect, it } from "vitest";
import {
  calculateStoppingDistance,
  compareTenKmh,
  dryTreadMultiplier,
  DRY_DECELERATION_MPS2,
  REACTION_TIME_SECONDS,
  wetTreadMultiplier,
  WET_DECELERATION_MPS2,
} from "./stopping-distance";

describe("stopping-distance evidence model", () => {
  it("uses the documented Queensland-calibrated assumptions", () => {
    expect(REACTION_TIME_SECONDS).toBe(1.5);
    expect(DRY_DECELERATION_MPS2).toBe(6.9);
    expect(WET_DECELERATION_MPS2).toBeCloseTo(4.83, 5);
  });

  it("reproduces the Queensland baseline table within one metre", () => {
    const baselines = [
      { speed: 50, dry: 35, wet: 41 },
      { speed: 80, dry: 69, wet: 85 },
      { speed: 100, dry: 98, wet: 122 },
      { speed: 110, dry: 113, wet: 143 },
    ];

    for (const { speed, dry, wet } of baselines) {
      expect(Math.abs(calculateStoppingDistance(speed, "dry", 8).totalDistanceM - dry)).toBeLessThanOrEqual(1);
      expect(Math.abs(calculateStoppingDistance(speed, "wet", 8).totalDistanceM - wet)).toBeLessThanOrEqual(1);
    }
  });

  it("uses the three Continental wet-braking calibration anchors", () => {
    expect(wetTreadMultiplier(8)).toBe(1);
    expect(wetTreadMultiplier(3)).toBeCloseTo(39.6 / 36.9, 8);
    expect(wetTreadMultiplier(1.6)).toBeCloseTo(43.8 / 36.9, 8);
  });

  it("interpolates continuously and worsens as wet tread becomes shallower", () => {
    const depths = [8, 7, 5, 3, 2.5, 2, 1.6];
    const multipliers = depths.map(wetTreadMultiplier);
    for (let index = 1; index < multipliers.length; index++) {
      expect(multipliers[index]).toBeGreaterThan(multipliers[index - 1]);
    }
  });

  it("uses the Tire Rack dry-braking calibration anchors", () => {
    expect(dryTreadMultiplier(8)).toBe(1);
    expect(dryTreadMultiplier(3.2)).toBeCloseTo(87.8 / 89.3, 8);
    expect(dryTreadMultiplier(1.6)).toBeCloseTo(87.8 / 89.3, 8);
  });

  it("models only the small measured dry-road improvement", () => {
    const fullTread = calculateStoppingDistance(80, "dry", 8);
    const wornTread = calculateStoppingDistance(80, "dry", 1.6);
    expect(wornTread.brakingDistanceM).toBeLessThan(fullTread.brakingDistanceM);
    expect(wornTread.brakingDistanceM / fullTread.brakingDistanceM).toBeGreaterThan(0.98);
  });

  it("keeps braking distance quadratic while reaction distance is linear in speed", () => {
    const at40 = calculateStoppingDistance(40, "dry", 8);
    const at80 = calculateStoppingDistance(80, "dry", 8);
    expect(at80.reactionDistanceM / at40.reactionDistanceM).toBeCloseTo(2, 8);
    expect(at80.brakingDistanceM / at40.brakingDistanceM).toBeCloseTo(4, 8);
  });

  it("quantifies the consequence of a 10 km/h speed difference", () => {
    const comparison = compareTenKmh(80, "wet", 3);
    expect(comparison.fasterSpeedKmh).toBe(80);
    expect(comparison.slowerSpeedKmh).toBe(70);
    expect(comparison.extraStoppingDistanceM).toBeGreaterThan(15);
    expect(comparison.residualSpeedKmh).toBeGreaterThan(30);
  });
});

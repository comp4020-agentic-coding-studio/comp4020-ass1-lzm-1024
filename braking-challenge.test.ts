import { describe, expect, it } from "vitest";
import {
  calculateBrakingChallenge,
  FRICTION_COEFFICIENTS,
  GRAVITY_MPS2,
  maximumStoppingSpeedKmh,
} from "./braking-challenge";

describe("obstacle braking model", () => {
  it("uses the stated educational friction coefficients", () => {
    expect(FRICTION_COEFFICIENTS).toEqual({ dry: 0.7, wet: 0.49, ice: 0.12 });
    expect(GRAVITY_MPS2).toBe(9.81);
  });

  it("separates reaction and braking distance", () => {
    const result = calculateBrakingChallenge({
      speedKmh: 80,
      reactionSeconds: 0.82,
      surface: "dry",
      obstacleDistanceM: 100,
    });
    expect(result.reactionDistanceM).toBeCloseTo(18.22, 1);
    expect(result.totalDistanceM).toBeCloseTo(result.reactionDistanceM + result.brakingDistanceM, 8);
  });

  it("reports clearance when the vehicle stops safely", () => {
    const result = calculateBrakingChallenge({
      speedKmh: 50,
      reactionSeconds: 0.8,
      surface: "dry",
      obstacleDistanceM: 55,
    });
    expect(result.outcome).toBe("safe");
    expect(result.clearanceM).toBeGreaterThan(20);
    expect(result.impactSpeedKmh).toBe(0);
  });

  it("reports residual speed when the vehicle collides", () => {
    const result = calculateBrakingChallenge({
      speedKmh: 80,
      reactionSeconds: 1.2,
      surface: "wet",
      obstacleDistanceM: 55,
    });
    expect(result.outcome).toBe("collision");
    expect(result.impactSpeedKmh).toBeGreaterThan(30);
    expect(result.clearanceM).toBeLessThan(0);
  });

  it("solves a maximum speed that stops at the obstacle", () => {
    const maximumSpeed = maximumStoppingSpeedKmh(55, 1.2, FRICTION_COEFFICIENTS.wet);
    const result = calculateBrakingChallenge({
      speedKmh: maximumSpeed,
      reactionSeconds: 1.2,
      surface: "wet",
      obstacleDistanceM: 55,
    });
    expect(result.totalDistanceM).toBeCloseTo(55, 8);
  });
});

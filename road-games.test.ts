import { describe, expect, it } from "vitest";
import { calculateFollowingGap, calculateSpeedDuel, predictionOutcome } from "./road-games";

describe("additional road-safety games", () => {
  it("shows a one-second wet following gap is insufficient at 80 km/h", () => {
    const result = calculateFollowingGap(80, 1, 1.2, "wet");
    expect(result.safe).toBe(false);
    expect(result.clearanceM).toBeLessThan(0);
    expect(result.requiredGapSeconds).toBeGreaterThan(1);
  });

  it("shows a three-second following gap leaves space", () => {
    const result = calculateFollowingGap(80, 3, 1.2, "wet");
    expect(result.safe).toBe(true);
    expect(result.clearanceM).toBeGreaterThan(20);
  });

  it("calculates residual speed for the vehicle travelling 10 km/h faster", () => {
    const result = calculateSpeedDuel(60, 1.2, "wet");
    expect(result.fasterSpeedKmh).toBe(70);
    expect(result.fasterStoppingDistanceM).toBeGreaterThan(result.slowerStoppingDistanceM);
    expect(result.impactSpeedKmh).toBeGreaterThan(0);
  });

  it("returns the same three outcomes used by the prediction game", () => {
    expect(predictionOutcome({ speedKmh: 50, reactionSeconds: 0.8, surface: "dry", obstacleDistanceM: 55 }))
      .toBe("safe");
    expect(predictionOutcome({ speedKmh: 70, reactionSeconds: 1.2, surface: "wet", obstacleDistanceM: 55 }))
      .toBe("collision");
  });
});

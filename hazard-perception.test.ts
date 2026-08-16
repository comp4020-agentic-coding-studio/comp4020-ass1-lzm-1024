import { describe, expect, it } from "vitest";
import { analyzeHazardResponse } from "./hazard-perception";

describe("hazard perception analysis", () => {
  it("converts response time into distance travelled", () => {
    const result = analyzeHazardResponse(820, 60);
    expect(result.reactionSeconds).toBeCloseTo(0.82);
    expect(result.distanceTravelled).toBeCloseTo(13.67, 2);
    expect(result.additionalHalfSecondDistance).toBeCloseTo(8.33, 2);
  });

  it.each([
    [450, "sharp"],
    [820, "aware"],
    [1350, "delayed"],
  ] as const)("classifies a %d ms response as %s", (milliseconds, rating) => {
    expect(analyzeHazardResponse(milliseconds, 60).rating).toBe(rating);
  });

  it("rejects impossible values", () => {
    expect(() => analyzeHazardResponse(-1, 60)).toThrow(RangeError);
    expect(() => analyzeHazardResponse(500, 0)).toThrow(RangeError);
  });
});

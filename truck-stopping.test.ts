import { describe, expect, it } from "vitest";
import { compareTruckStoppingDistance, TRUCK_SPEEDS_KMH } from "./truck-stopping";

describe("published heavy-vehicle comparison", () => {
  it("exposes only speeds present in the NT Government table", () => {
    expect(TRUCK_SPEEDS_KMH).toEqual([60, 70, 80, 90, 100]);
  });

  it("returns the published 80 km/h comparison", () => {
    expect(compareTruckStoppingDistance(80)).toEqual({
      speedKmh: 80,
      carDistanceM: 110,
      truckDistanceM: 133,
      extraDistanceM: 23,
    });
  });

  it("rejects interpolation beyond the published observations", () => {
    expect(() => compareTruckStoppingDistance(85)).toThrow(RangeError);
  });
});

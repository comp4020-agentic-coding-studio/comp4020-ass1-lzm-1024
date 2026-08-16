export const TRUCK_SPEEDS_KMH = [60, 70, 80, 90, 100] as const;

interface HeavyVehicleComparison {
  speedKmh: number;
  carDistanceM: number;
  truckDistanceM: number;
  extraDistanceM: number;
}

const PUBLISHED_DISTANCES = new Map<number, readonly [carDistanceM: number, truckDistanceM: number]>([
  [60, [70, 83]],
  [70, [89, 107]],
  [80, [110, 133]],
  [90, [133, 162]],
  [100, [157, 194]],
]);

export function compareTruckStoppingDistance(speedKmh: number): HeavyVehicleComparison {
  const distances = PUBLISHED_DISTANCES.get(speedKmh);

  if (!distances) {
    throw new RangeError(`No published truck comparison is available at ${speedKmh} km/h.`);
  }

  const [carDistanceM, truckDistanceM] = distances;

  return {
    speedKmh,
    carDistanceM,
    truckDistanceM,
    extraDistanceM: truckDistanceM - carDistanceM,
  };
}

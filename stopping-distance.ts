export const REACTION_TIME_SECONDS = 1.5;
export const DRY_DECELERATION_MPS2 = 6.9;
export const WET_ROAD_FACTOR = 0.7;
export const WET_DECELERATION_MPS2 = DRY_DECELERATION_MPS2 * WET_ROAD_FACTOR;
export const MIN_TREAD_DEPTH_MM = 1.6;
export const MAX_TREAD_DEPTH_MM = 8;

const FULL_TREAD_TEST_DISTANCE_M = 36.9;
const THREE_MM_TEST_DISTANCE_M = 39.6;
const MIN_TREAD_TEST_DISTANCE_M = 43.8;
const DRY_FULL_TREAD_TEST_DISTANCE_FT = 89.3;
const DRY_SHALLOW_TREAD_TEST_DISTANCE_FT = 87.8;
const DRY_SHALLOW_TREAD_ANCHOR_MM = 3.2;

export type RoadCondition = "dry" | "wet";

export interface StoppingDistanceResult {
  speedMps: number;
  reactionDistanceM: number;
  baseBrakingDistanceM: number;
  treadMultiplier: number;
  brakingDistanceM: number;
  totalDistanceM: number;
}

export interface SpeedComparisonResult {
  fasterSpeedKmh: number;
  slowerSpeedKmh: number;
  extraStoppingDistanceM: number;
  residualSpeedKmh: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Continental measured wet braking from 80 km/h to 20 km/h at three tread
// depths. Values between those anchors are an explicit educational
// interpolation, not additional measured results.
export function wetTreadMultiplier(treadDepthMm: number): number {
  const tread = clamp(treadDepthMm, MIN_TREAD_DEPTH_MM, MAX_TREAD_DEPTH_MM);
  const threeMmMultiplier = THREE_MM_TEST_DISTANCE_M / FULL_TREAD_TEST_DISTANCE_M;
  const minTreadMultiplier = MIN_TREAD_TEST_DISTANCE_M / FULL_TREAD_TEST_DISTANCE_M;

  if (tread >= 3) {
    const progressFromFullTread = (MAX_TREAD_DEPTH_MM - tread) / (MAX_TREAD_DEPTH_MM - 3);
    return 1 + progressFromFullTread * (threeMmMultiplier - 1);
  }

  const progressFromThreeMm = (3 - tread) / (3 - MIN_TREAD_DEPTH_MM);
  return threeMmMultiplier + progressFromThreeMm * (minTreadMultiplier - threeMmMultiplier);
}

// Tire Rack tested the same tyre model at about 8, 3.2 and 1.6 mm on dry
// asphalt. The two shallower sets both stopped in 87.8 ft versus 89.3 ft at
// full tread. This small effect is interpolated here and must not be read as
// a universal benefit of driving on genuinely old or damaged tyres.
export function dryTreadMultiplier(treadDepthMm: number): number {
  const tread = clamp(treadDepthMm, MIN_TREAD_DEPTH_MM, MAX_TREAD_DEPTH_MM);
  const shallowTreadMultiplier = DRY_SHALLOW_TREAD_TEST_DISTANCE_FT / DRY_FULL_TREAD_TEST_DISTANCE_FT;

  if (tread <= DRY_SHALLOW_TREAD_ANCHOR_MM) return shallowTreadMultiplier;

  const progressFromFullTread =
    (MAX_TREAD_DEPTH_MM - tread) / (MAX_TREAD_DEPTH_MM - DRY_SHALLOW_TREAD_ANCHOR_MM);
  return 1 + progressFromFullTread * (shallowTreadMultiplier - 1);
}

export function calculateStoppingDistance(
  speedKmh: number,
  roadCondition: RoadCondition,
  treadDepthMm: number,
): StoppingDistanceResult {
  const speedMps = speedKmh / 3.6;
  const reactionDistanceM = speedMps * REACTION_TIME_SECONDS;
  const deceleration = roadCondition === "wet" ? WET_DECELERATION_MPS2 : DRY_DECELERATION_MPS2;
  const baseBrakingDistanceM = speedMps ** 2 / (2 * deceleration);
  const treadMultiplier = roadCondition === "wet"
    ? wetTreadMultiplier(treadDepthMm)
    : dryTreadMultiplier(treadDepthMm);
  const brakingDistanceM = baseBrakingDistanceM * treadMultiplier;

  return {
    speedMps,
    reactionDistanceM,
    baseBrakingDistanceM,
    treadMultiplier,
    brakingDistanceM,
    totalDistanceM: reactionDistanceM + brakingDistanceM,
  };
}

export function compareTenKmh(
  selectedSpeedKmh: number,
  roadCondition: RoadCondition,
  treadDepthMm: number,
): SpeedComparisonResult {
  const fasterSpeedKmh = selectedSpeedKmh <= 40 ? 50 : selectedSpeedKmh;
  const slowerSpeedKmh = fasterSpeedKmh - 10;
  const faster = calculateStoppingDistance(fasterSpeedKmh, roadCondition, treadDepthMm);
  const slower = calculateStoppingDistance(slowerSpeedKmh, roadCondition, treadDepthMm);
  const brakingDistanceTravelledM = Math.max(0, slower.totalDistanceM - faster.reactionDistanceM);
  const effectiveDeceleration =
    (roadCondition === "wet" ? WET_DECELERATION_MPS2 : DRY_DECELERATION_MPS2) / faster.treadMultiplier;
  const residualSpeedMps = Math.sqrt(
    Math.max(0, faster.speedMps ** 2 - 2 * effectiveDeceleration * brakingDistanceTravelledM),
  );

  return {
    fasterSpeedKmh,
    slowerSpeedKmh,
    extraStoppingDistanceM: faster.totalDistanceM - slower.totalDistanceM,
    residualSpeedKmh: residualSpeedMps * 3.6,
  };
}

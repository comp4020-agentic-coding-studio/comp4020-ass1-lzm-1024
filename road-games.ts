import {
  calculateBrakingChallenge,
  FRICTION_COEFFICIENTS,
  GRAVITY_MPS2,
  type ChallengeOutcome,
  type SurfaceCondition,
} from "./braking-challenge";

export interface FollowingGapResult {
  gapDistanceM: number;
  leadStoppingDistanceM: number;
  followerStoppingDistanceM: number;
  clearanceM: number;
  requiredGapSeconds: number;
  safe: boolean;
}

export interface SpeedDuelResult {
  slowerSpeedKmh: number;
  fasterSpeedKmh: number;
  slowerStoppingDistanceM: number;
  fasterStoppingDistanceM: number;
  impactSpeedKmh: number;
}

export interface PredictionScenario {
  speedKmh: number;
  reactionSeconds: number;
  surface: SurfaceCondition;
  obstacleDistanceM: number;
}

export function calculateFollowingGap(
  speedKmh: number,
  gapSeconds: number,
  reactionSeconds: number,
  surface: SurfaceCondition,
): FollowingGapResult {
  const speedMps = speedKmh / 3.6;
  const gapDistanceM = speedMps * gapSeconds;
  const leadStoppingDistanceM = speedMps ** 2 / (2 * FRICTION_COEFFICIENTS.dry * GRAVITY_MPS2);
  const follower = calculateBrakingChallenge({
    speedKmh,
    reactionSeconds,
    surface,
    obstacleDistanceM: Number.MAX_SAFE_INTEGER,
  });
  const clearanceM = gapDistanceM + leadStoppingDistanceM - follower.totalDistanceM;
  const requiredGapDistanceM = Math.max(0, follower.totalDistanceM - leadStoppingDistanceM);

  return {
    gapDistanceM,
    leadStoppingDistanceM,
    followerStoppingDistanceM: follower.totalDistanceM,
    clearanceM,
    requiredGapSeconds: requiredGapDistanceM / speedMps,
    safe: clearanceM > 1,
  };
}

export function calculateSpeedDuel(
  slowerSpeedKmh: number,
  reactionSeconds: number,
  surface: SurfaceCondition,
): SpeedDuelResult {
  const fasterSpeedKmh = slowerSpeedKmh + 10;
  const slower = calculateBrakingChallenge({
    speedKmh: slowerSpeedKmh,
    reactionSeconds,
    surface,
    obstacleDistanceM: Number.MAX_SAFE_INTEGER,
  });
  const faster = calculateBrakingChallenge({
    speedKmh: fasterSpeedKmh,
    reactionSeconds,
    surface,
    obstacleDistanceM: slower.totalDistanceM,
  });

  return {
    slowerSpeedKmh,
    fasterSpeedKmh,
    slowerStoppingDistanceM: slower.totalDistanceM,
    fasterStoppingDistanceM: faster.totalDistanceM,
    impactSpeedKmh: faster.impactSpeedKmh,
  };
}

export function predictionOutcome(scenario: PredictionScenario): ChallengeOutcome {
  return calculateBrakingChallenge(scenario).outcome;
}

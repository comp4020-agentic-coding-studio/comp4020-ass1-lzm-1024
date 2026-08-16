export const GRAVITY_MPS2 = 9.81;

export const FRICTION_COEFFICIENTS = {
  dry: 0.7,
  wet: 0.49,
  ice: 0.12,
} as const;

export type SurfaceCondition = keyof typeof FRICTION_COEFFICIENTS;
export type ChallengeOutcome = "safe" | "tight" | "collision";

export interface BrakingChallengeInput {
  speedKmh: number;
  reactionSeconds: number;
  surface: SurfaceCondition;
  obstacleDistanceM: number;
}

export interface BrakingChallengeResult {
  reactionDistanceM: number;
  brakingDistanceM: number;
  totalDistanceM: number;
  outcome: ChallengeOutcome;
  clearanceM: number;
  impactSpeedKmh: number;
  maximumStoppingSpeedKmh: number;
}

export function maximumStoppingSpeedKmh(
  obstacleDistanceM: number,
  reactionSeconds: number,
  frictionCoefficient: number,
): number {
  const deceleration = frictionCoefficient * GRAVITY_MPS2;
  const speedMps = deceleration * (
    -reactionSeconds + Math.sqrt(reactionSeconds ** 2 + (2 * obstacleDistanceM) / deceleration)
  );
  return Math.max(0, speedMps * 3.6);
}

export function calculateBrakingChallenge(input: BrakingChallengeInput): BrakingChallengeResult {
  const speedMps = input.speedKmh / 3.6;
  const frictionCoefficient = FRICTION_COEFFICIENTS[input.surface];
  const deceleration = frictionCoefficient * GRAVITY_MPS2;
  const reactionDistanceM = speedMps * input.reactionSeconds;
  const brakingDistanceM = speedMps ** 2 / (2 * deceleration);
  const totalDistanceM = reactionDistanceM + brakingDistanceM;
  const clearanceM = input.obstacleDistanceM - totalDistanceM;
  const outcome: ChallengeOutcome = clearanceM < 0 ? "collision" : clearanceM <= 1 ? "tight" : "safe";
  const brakingRoomM = Math.max(0, input.obstacleDistanceM - reactionDistanceM);
  const impactSpeedMps = outcome === "collision"
    ? Math.sqrt(Math.max(0, speedMps ** 2 - 2 * deceleration * brakingRoomM))
    : 0;

  return {
    reactionDistanceM,
    brakingDistanceM,
    totalDistanceM,
    outcome,
    clearanceM,
    impactSpeedKmh: impactSpeedMps * 3.6,
    maximumStoppingSpeedKmh: maximumStoppingSpeedKmh(
      input.obstacleDistanceM,
      input.reactionSeconds,
      frictionCoefficient,
    ),
  };
}

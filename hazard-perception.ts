export type HazardRating = "sharp" | "aware" | "delayed";

export type HazardResponse = {
  reactionSeconds: number;
  distanceTravelled: number;
  additionalHalfSecondDistance: number;
  rating: HazardRating;
};

export function analyzeHazardResponse(reactionMilliseconds: number, speedKmh: number): HazardResponse {
  if (!Number.isFinite(reactionMilliseconds) || reactionMilliseconds < 0) {
    throw new RangeError("Reaction time must be a non-negative number.");
  }
  if (!Number.isFinite(speedKmh) || speedKmh <= 0) {
    throw new RangeError("Speed must be greater than zero.");
  }

  const reactionSeconds = reactionMilliseconds / 1000;
  const speedMps = speedKmh / 3.6;
  const rating: HazardRating = reactionSeconds <= 0.6
    ? "sharp"
    : reactionSeconds <= 1
      ? "aware"
      : "delayed";

  return {
    reactionSeconds,
    distanceTravelled: speedMps * reactionSeconds,
    additionalHalfSecondDistance: speedMps * 0.5,
    rating,
  };
}

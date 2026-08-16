import { calculateBrakingChallenge, type SurfaceCondition } from "./braking-challenge";
import {
  calculateFollowingGap,
  calculateSpeedDuel,
  predictionOutcome,
  type PredictionScenario,
} from "./road-games";
import { analyzeHazardResponse, type HazardResponse } from "./hazard-perception";
import { initLanguageSwitcher, localizeDocument, t } from "./i18n";

initLanguageSwitcher();

type HazardScenario = "pedestrian" | "cyclist" | "stopped-car";
type HazardClipState = "idle" | "watching" | "hazard" | "result";

const hazardClip = document.querySelector<HTMLElement>("#hazard-clip");
const hazardStart = document.querySelector<HTMLButtonElement>("#hazard-start");
const hazardSpot = document.querySelector<HTMLButtonElement>("#hazard-spot");
const hazardSpeed = document.querySelector<HTMLInputElement>("#hazard-speed");
const hazardSpeedValue = document.querySelector<HTMLOutputElement>("#hazard-speed-value");
const hazardClipProgress = document.querySelector<HTMLProgressElement>("#hazard-clip-progress");
const hazardClipTime = document.querySelector<HTMLTimeElement>("#hazard-clip-time");
const hazardInstruction = document.querySelector<HTMLElement>("#hazard-instruction");
const hazardLiveStatus = document.querySelector<HTMLElement>("#hazard-live-status");
const hazardAnalysis = document.querySelector<HTMLElement>("#hazard-analysis");
const hazardReactionTime = document.querySelector<HTMLOutputElement>("#hazard-reaction-time");
const hazardDistance = document.querySelector<HTMLOutputElement>("#hazard-distance");
const hazardLateDistance = document.querySelector<HTMLOutputElement>("#hazard-late-distance");
const hazardRating = document.querySelector<HTMLElement>("#hazard-rating");
const hazardTimelineResponse = document.querySelector<HTMLElement>("#hazard-timeline-response");
const hazardTimelineLate = document.querySelector<HTMLElement>("#hazard-timeline-late");

const hazardScenarios: HazardScenario[] = ["pedestrian", "cyclist", "stopped-car"];
let hazardClipState: HazardClipState = "idle";
let perceptionTimeout: number | undefined;
let perceptionAnimationFrame: number | undefined;
let perceptionClipStartedAt = 0;
let perceptionShownAt = 0;
let currentHazardScenario: HazardScenario = "pedestrian";
let lastHazardResponse: HazardResponse | undefined;
let hazardMessageKey = "hazard.ready";
let hazardMessageVariables: Record<string, string | number> = {};

function setHazardMessage(key: string, variables: Record<string, string | number> = {}): void {
  hazardMessageKey = key;
  hazardMessageVariables = variables;
  if (hazardInstruction) hazardInstruction.textContent = t(key, variables);
}

function updateHazardClock(): void {
  if (!hazardClipTime || !hazardClipProgress || hazardClipState === "idle" || hazardClipState === "result") return;
  const elapsedSeconds = (performance.now() - perceptionClipStartedAt) / 1000;
  hazardClipProgress.value = Math.min(Number(hazardClipProgress.max), elapsedSeconds);
  hazardClipTime.textContent = `00:${elapsedSeconds.toFixed(1).padStart(4, "0")}`;
  perceptionAnimationFrame = window.requestAnimationFrame(updateHazardClock);
}

function stopHazardTimers(): void {
  if (perceptionTimeout !== undefined) window.clearTimeout(perceptionTimeout);
  if (perceptionAnimationFrame !== undefined) window.cancelAnimationFrame(perceptionAnimationFrame);
  perceptionTimeout = undefined;
  perceptionAnimationFrame = undefined;
}

function setHazardClipState(state: HazardClipState): void {
  hazardClipState = state;
  if (hazardClip) hazardClip.dataset.state = state;
}

function renderHazardAnalysis(): void {
  if (
    !lastHazardResponse || !hazardReactionTime || !hazardDistance || !hazardLateDistance ||
    !hazardRating || !hazardTimelineResponse || !hazardTimelineLate
  ) return;

  const responseSeconds = lastHazardResponse.reactionSeconds.toFixed(2);
  hazardReactionTime.textContent = responseSeconds;
  hazardDistance.textContent = lastHazardResponse.distanceTravelled.toFixed(1);
  hazardLateDistance.textContent = lastHazardResponse.additionalHalfSecondDistance.toFixed(1);
  hazardRating.textContent = t(`hazard.rating.${lastHazardResponse.rating}`);
  hazardTimelineResponse.textContent = `${responseSeconds} s`;
  hazardTimelineLate.textContent = `${(lastHazardResponse.reactionSeconds + 0.5).toFixed(2)} s`;
}

function startHazardClip(): void {
  if (!hazardClip || !hazardStart || !hazardSpot || !hazardSpeed || !hazardClipProgress || !hazardClipTime) return;
  stopHazardTimers();
  currentHazardScenario = hazardScenarios[Math.floor(Math.random() * hazardScenarios.length)] ?? "pedestrian";
  hazardClip.dataset.scenario = currentHazardScenario;
  setHazardClipState("watching");
  lastHazardResponse = undefined;
  if (hazardAnalysis) hazardAnalysis.hidden = true;
  hazardStart.disabled = true;
  hazardSpot.disabled = false;
  hazardSpeed.disabled = true;
  hazardClipProgress.value = 0;
  hazardClipTime.textContent = "00:00.0";
  perceptionClipStartedAt = performance.now();
  setHazardMessage("hazard.watching");
  if (hazardLiveStatus) hazardLiveStatus.textContent = t("hazard.watching");
  perceptionAnimationFrame = window.requestAnimationFrame(updateHazardClock);

  const delayMilliseconds = 1800 + Math.random() * 2200;
  perceptionTimeout = window.setTimeout(() => {
    setHazardClipState("hazard");
    perceptionShownAt = performance.now();
    const scenarioKey = `hazard.scenario.${currentHazardScenario}`;
    setHazardMessage(scenarioKey);
    if (hazardLiveStatus) hazardLiveStatus.textContent = t(scenarioKey);
  }, delayMilliseconds);
}

function reportHazard(): void {
  if (!hazardStart || !hazardSpot || !hazardSpeed) return;
  if (hazardClipState === "watching") {
    stopHazardTimers();
    setHazardClipState("idle");
    hazardStart.disabled = false;
    hazardStart.textContent = t("hazard.tryAgain");
    hazardSpot.disabled = true;
    hazardSpeed.disabled = false;
    setHazardMessage("hazard.falseAlarm");
    if (hazardLiveStatus) hazardLiveStatus.textContent = t("hazard.falseAlarm");
    return;
  }
  if (hazardClipState !== "hazard") return;

  const reactionMilliseconds = Math.max(10, performance.now() - perceptionShownAt);
  lastHazardResponse = analyzeHazardResponse(reactionMilliseconds, Number(hazardSpeed.value));
  stopHazardTimers();
  setHazardClipState("result");
  hazardStart.disabled = false;
  hazardStart.textContent = t("hazard.replay");
  hazardSpot.disabled = true;
  hazardSpeed.disabled = false;
  if (hazardAnalysis) hazardAnalysis.hidden = false;
  renderHazardAnalysis();
  setHazardMessage("hazard.result", {
    speed: hazardSpeed.value,
    distance: lastHazardResponse.distanceTravelled.toFixed(1),
  });
  if (hazardLiveStatus) hazardLiveStatus.textContent = t("hazard.captured");
}

hazardStart?.addEventListener("click", startHazardClip);
hazardSpot?.addEventListener("click", reportHazard);
hazardSpeed?.addEventListener("input", () => {
  if (hazardSpeedValue) hazardSpeedValue.textContent = `${hazardSpeed.value} km/h`;
});
window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || (hazardClipState !== "watching" && hazardClipState !== "hazard")) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
  event.preventDefault();
  reportHazard();
});

const reactionGame = document.querySelector<HTMLElement>("#reaction-game");
const reactionStart = document.querySelector<HTMLButtonElement>("#reaction-start");
const reactionBrake = document.querySelector<HTMLButtonElement>("#reaction-brake");
const reactionStatus = document.querySelector<HTMLElement>("#reaction-status");
const reactionInstruction = document.querySelector<HTMLElement>("#reaction-instruction");
const reactionResult = document.querySelector<HTMLElement>("#reaction-result");
const measuredReaction = document.querySelector<HTMLOutputElement>("#measured-reaction");
const measuredReactionDistance = document.querySelector<HTMLOutputElement>("#measured-reaction-distance");

const challengeStage = document.querySelector<HTMLElement>("#challenge-stage");
const challengeSpeed = document.querySelector<HTMLInputElement>("#challenge-speed");
const challengeReaction = document.querySelector<HTMLInputElement>("#challenge-reaction");
const challengeObstacle = document.querySelector<HTMLInputElement>("#challenge-obstacle");
const challengeTest = document.querySelector<HTMLButtonElement>("#challenge-test");
const challengeSpeedValue = document.querySelector<HTMLOutputElement>("#challenge-speed-value");
const challengeReactionValue = document.querySelector<HTMLOutputElement>("#challenge-reaction-value");
const challengeObstacleValue = document.querySelector<HTMLOutputElement>("#challenge-obstacle-value");
const challengeReactionDistance = document.querySelector<HTMLOutputElement>("#challenge-reaction-distance");
const challengeBrakingDistance = document.querySelector<HTMLOutputElement>("#challenge-braking-distance");
const challengeTotalDistance = document.querySelector<HTMLOutputElement>("#challenge-total-distance");
const challengeObstacleDistance = document.querySelector<HTMLOutputElement>("#challenge-obstacle-distance");
const roadReactionDistance = document.querySelector<HTMLElement>("#road-reaction-distance");
const roadBrakingDistance = document.querySelector<HTMLElement>("#road-braking-distance");
const roadObstacleDistance = document.querySelector<HTMLElement>("#road-obstacle-distance");
const challengeFeedback = document.querySelector<HTMLElement>("#challenge-feedback");
const feedbackKicker = document.querySelector<HTMLElement>("#feedback-kicker");
const feedbackTitle = document.querySelector<HTMLElement>("#feedback-title");
const feedbackNumber = document.querySelector<HTMLOutputElement>("#feedback-number");
const feedbackUnit = document.querySelector<HTMLElement>("#feedback-unit");
const feedbackCopy = document.querySelector<HTMLElement>("#feedback-copy");
const reactionPresetButtons = document.querySelectorAll<HTMLButtonElement>("[data-reaction]");
const challengePresetButtons = document.querySelectorAll<HTMLButtonElement>("[data-challenge-speed]");
const surfaceInputs = document.querySelectorAll<HTMLInputElement>('input[name="challenge-surface"]');

let hazardTimeout: number | undefined;
let hazardShownAt = 0;
let reactionState: "idle" | "waiting" | "go" | "result" = "idle";

function sliderFill(slider: HTMLInputElement): string {
  const progress = (Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min));
  return `${(progress * 100).toFixed(2)}%`;
}

function setReactionState(state: typeof reactionState): void {
  reactionState = state;
  if (reactionGame) reactionGame.dataset.state = state;
}

function startReactionRun(): void {
  if (!reactionGame || !reactionStart || !reactionBrake || !reactionStatus || !reactionInstruction) return;
  if (hazardTimeout !== undefined) window.clearTimeout(hazardTimeout);

  setReactionState("waiting");
  reactionStart.disabled = true;
  reactionBrake.disabled = false;
  reactionStatus.textContent = t("reaction.driving");
  reactionInstruction.textContent = t("reaction.wait");
  const delayMs = 1000 + Math.random() * 2000;
  hazardTimeout = window.setTimeout(() => {
    setReactionState("go");
    hazardShownAt = performance.now();
    reactionStatus.textContent = t("reaction.go");
    reactionInstruction.textContent = t("reaction.action");
  }, delayMs);
}

function resetAfterEarlyBrake(): void {
  if (!reactionStart || !reactionBrake || !reactionStatus || !reactionInstruction) return;
  if (hazardTimeout !== undefined) window.clearTimeout(hazardTimeout);
  setReactionState("idle");
  reactionStart.disabled = false;
  reactionStart.textContent = t("reaction.tryAgain");
  reactionBrake.disabled = true;
  reactionStatus.textContent = t("reaction.early");
  reactionInstruction.textContent = "Restart and wait until the obstacle is visible.";
}

function finishReactionRun(): void {
  if (
    !reactionStart ||
    !reactionBrake ||
    !reactionStatus ||
    !reactionInstruction ||
    !reactionResult ||
    !measuredReaction ||
    !measuredReactionDistance
  ) return;

  const reactionSeconds = Math.max(0.01, (performance.now() - hazardShownAt) / 1000);
  const distanceAt80Kmh = (80 / 3.6) * reactionSeconds;
  setReactionState("result");
  reactionStart.disabled = false;
  reactionStart.textContent = t("reaction.testAgain");
  reactionBrake.disabled = true;
  reactionStatus.textContent = "Brakes applied";
  reactionInstruction.textContent = t("reaction.seconds", { value: reactionSeconds.toFixed(2) });
  measuredReaction.textContent = reactionSeconds.toFixed(2);
  measuredReactionDistance.textContent = distanceAt80Kmh.toFixed(1);
  reactionResult.hidden = false;

  if (challengeReaction) {
    challengeReaction.value = String(Math.min(Number(challengeReaction.max), Math.max(Number(challengeReaction.min), reactionSeconds)));
    updateChallengePreview();
  }
}

function brake(): void {
  if (reactionState === "waiting") resetAfterEarlyBrake();
  if (reactionState === "go") finishReactionRun();
}

reactionStart?.addEventListener("click", startReactionRun);
reactionBrake?.addEventListener("click", brake);
window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || (reactionState !== "waiting" && reactionState !== "go")) return;
  event.preventDefault();
  brake();
});

function selectedSurface(): SurfaceCondition {
  const value = document.querySelector<HTMLInputElement>('input[name="challenge-surface"]:checked')?.value;
  if (value === "dry" || value === "ice") return value;
  return "wet";
}

function updateChallengePreview(markUntested = true): void {
  if (
    !challengeStage ||
    !challengeSpeed ||
    !challengeReaction ||
    !challengeObstacle ||
    !challengeSpeedValue ||
    !challengeReactionValue ||
    !challengeObstacleValue ||
    !challengeReactionDistance ||
    !challengeBrakingDistance ||
    !challengeTotalDistance ||
    !challengeObstacleDistance ||
    !roadReactionDistance ||
    !roadBrakingDistance ||
    !roadObstacleDistance
  ) return;

  const result = calculateBrakingChallenge({
    speedKmh: Number(challengeSpeed.value),
    reactionSeconds: Number(challengeReaction.value),
    surface: selectedSurface(),
    obstacleDistanceM: Number(challengeObstacle.value),
  });
  const scaleM = Math.max(125, result.totalDistanceM, Number(challengeObstacle.value)) * 1.08;
  const reactionPosition = (result.reactionDistanceM / scaleM) * 100;
  const stopPosition = Math.min(98, (result.totalDistanceM / scaleM) * 100);
  const obstaclePosition = (Number(challengeObstacle.value) / scaleM) * 100;

  challengeSpeed.style.setProperty("--fill", sliderFill(challengeSpeed));
  challengeReaction.style.setProperty("--fill", sliderFill(challengeReaction));
  challengeObstacle.style.setProperty("--fill", sliderFill(challengeObstacle));
  challengeStage.style.setProperty("--reaction-position", `${reactionPosition.toFixed(2)}%`);
  challengeStage.style.setProperty("--stop-position", `${stopPosition.toFixed(2)}%`);
  challengeStage.style.setProperty("--obstacle-position", `${obstaclePosition.toFixed(2)}%`);
  challengeStage.dataset.surface = selectedSurface();

  challengeSpeedValue.textContent = `${challengeSpeed.value} km/h`;
  challengeReactionValue.textContent = `${Number(challengeReaction.value).toFixed(2)} s`;
  challengeObstacleValue.textContent = `${challengeObstacle.value} m`;
  challengeReactionDistance.textContent = result.reactionDistanceM.toFixed(1);
  challengeBrakingDistance.textContent = result.brakingDistanceM.toFixed(1);
  challengeTotalDistance.textContent = result.totalDistanceM.toFixed(1);
  challengeObstacleDistance.textContent = Number(challengeObstacle.value).toFixed(1);
  roadReactionDistance.textContent = `${result.reactionDistanceM.toFixed(1)} m`;
  roadBrakingDistance.textContent = `${result.brakingDistanceM.toFixed(1)} m`;
  roadObstacleDistance.textContent = `${challengeObstacle.value} m`;

  if (markUntested && challengeFeedback && feedbackKicker && feedbackTitle && feedbackNumber && feedbackUnit && feedbackCopy) {
    challengeStage.dataset.outcome = "untested";
    challengeFeedback.dataset.outcome = "untested";
    feedbackKicker.textContent = t("challenge.changed");
    feedbackTitle.textContent = t("challenge.retest");
    feedbackNumber.textContent = "—";
    feedbackUnit.textContent = "";
    feedbackCopy.textContent = "The dashed yellow stage is reaction; the solid orange stage is braking.";
  }
}

function testChallenge(): void {
  if (
    !challengeStage ||
    !challengeSpeed ||
    !challengeReaction ||
    !challengeObstacle ||
    !challengeFeedback ||
    !feedbackKicker ||
    !feedbackTitle ||
    !feedbackNumber ||
    !feedbackUnit ||
    !feedbackCopy
  ) return;

  updateChallengePreview(false);
  const speedKmh = Number(challengeSpeed.value);
  const result = calculateBrakingChallenge({
    speedKmh,
    reactionSeconds: Number(challengeReaction.value),
    surface: selectedSurface(),
    obstacleDistanceM: Number(challengeObstacle.value),
  });
  challengeStage.dataset.outcome = result.outcome;
  challengeFeedback.dataset.outcome = result.outcome;
  challengeStage.classList.remove("is-testing");
  void challengeStage.offsetWidth;
  challengeStage.classList.add("is-testing");

  if (result.outcome === "safe") {
    feedbackKicker.textContent = t("result.safe");
    feedbackTitle.textContent = t("challenge.safeTitle");
    feedbackNumber.textContent = result.clearanceM.toFixed(1);
    feedbackUnit.textContent = ` ${t("unit.remaining")}`;
    feedbackCopy.textContent = "A positive margin remains, but real conditions can still make the stopping distance longer.";
    return;
  }

  if (result.outcome === "tight") {
    feedbackKicker.textContent = "Barely stopped";
    feedbackTitle.textContent = t("challenge.tightTitle");
    feedbackNumber.textContent = Math.max(0, result.clearanceM).toFixed(1);
    feedbackUnit.textContent = ` ${t("unit.remaining")}`;
    feedbackCopy.textContent = "This is a very high-risk result: small changes in grip or reaction would cause a collision.";
    return;
  }

  const recommendedSpeed = Math.max(5, Math.floor(result.maximumStoppingSpeedKmh / 5) * 5);
  feedbackKicker.textContent = t("result.collision");
  feedbackTitle.textContent = t("challenge.collisionTitle");
  feedbackNumber.textContent = result.impactSpeedKmh.toFixed(0);
  feedbackUnit.textContent = ` ${t("unit.impact")}`;
  feedbackCopy.textContent = t("challenge.slower", { speed: speedKmh, target: recommendedSpeed });
}

for (const control of [challengeSpeed, challengeReaction, challengeObstacle]) {
  control?.addEventListener("input", () => updateChallengePreview());
}
for (const input of surfaceInputs) input.addEventListener("change", () => updateChallengePreview());
challengeTest?.addEventListener("click", testChallenge);

for (const button of reactionPresetButtons) {
  button.addEventListener("click", () => {
    if (!challengeReaction) return;
    challengeReaction.value = button.dataset.reaction ?? challengeReaction.value;
    updateChallengePreview();
  });
}

for (const button of challengePresetButtons) {
  button.addEventListener("click", () => {
    if (!challengeSpeed || !challengeReaction || !challengeObstacle) return;
    challengeSpeed.value = button.dataset.challengeSpeed ?? challengeSpeed.value;
    challengeReaction.value = button.dataset.challengeReaction ?? challengeReaction.value;
    challengeObstacle.value = button.dataset.challengeObstacle ?? challengeObstacle.value;
    const surface = document.querySelector<HTMLInputElement>(
      `input[name="challenge-surface"][value="${button.dataset.challengeSurface}"]`,
    );
    if (surface) surface.checked = true;
    for (const preset of challengePresetButtons) preset.classList.toggle("is-active", preset === button);
    updateChallengePreview();
  });
}

updateChallengePreview(false);

const followingSpeed = document.querySelector<HTMLInputElement>("#following-speed");
const followingSpeedValue = document.querySelector<HTMLOutputElement>("#following-speed-value");
const followingReaction = document.querySelector<HTMLSelectElement>("#following-reaction");
const followingSurface = document.querySelector<HTMLSelectElement>("#following-surface");
const followingGapMetres = document.querySelector<HTMLElement>("#following-gap-metres");
const followingTest = document.querySelector<HTMLButtonElement>("#following-test");
const followingResult = document.querySelector<HTMLElement>("#following-result");
const followingTitle = document.querySelector<HTMLElement>("#following-title");
const followingCopy = document.querySelector<HTMLElement>("#following-copy");
const gapButtons = document.querySelectorAll<HTMLButtonElement>("[data-gap]");
let selectedGapSeconds = 2;

function updateFollowingPreview(): void {
  if (!followingSpeed || !followingSpeedValue || !followingGapMetres) return;
  const speedKmh = Number(followingSpeed.value);
  followingSpeed.style.setProperty("--fill", sliderFill(followingSpeed));
  followingSpeedValue.textContent = `${speedKmh} km/h`;
  followingGapMetres.textContent = `${((speedKmh / 3.6) * selectedGapSeconds).toFixed(1)} m`;
  if (followingResult && followingTitle && followingCopy) {
    followingResult.dataset.outcome = "untested";
    followingTitle.textContent = "Settings changed. Test this gap.";
    followingCopy.textContent = "The lead car will brake hard on a dry road.";
  }
}

function testFollowingGap(): void {
  if (
    !followingSpeed ||
    !followingReaction ||
    !followingSurface ||
    !followingResult ||
    !followingTitle ||
    !followingCopy
  ) return;
  const result = calculateFollowingGap(
    Number(followingSpeed.value),
    selectedGapSeconds,
    Number(followingReaction.value),
    followingSurface.value as SurfaceCondition,
  );

  followingResult.dataset.outcome = result.safe ? "safe" : "collision";
  if (result.safe) {
    followingTitle.textContent = t("following.safe", { value: result.clearanceM.toFixed(1) });
    followingCopy.textContent = `Your ${selectedGapSeconds}-second gap is ${result.gapDistanceM.toFixed(1)} metres at this speed.`;
  } else {
    followingTitle.textContent = t("following.unsafe", { value: Math.abs(result.clearanceM).toFixed(1) });
    followingCopy.textContent = t("following.required", { value: result.requiredGapSeconds.toFixed(1) });
  }
}

followingSpeed?.addEventListener("input", updateFollowingPreview);
followingReaction?.addEventListener("change", updateFollowingPreview);
followingSurface?.addEventListener("change", updateFollowingPreview);
followingTest?.addEventListener("click", testFollowingGap);
for (const button of gapButtons) {
  button.addEventListener("click", () => {
    selectedGapSeconds = Number(button.dataset.gap);
    for (const gapButton of gapButtons) gapButton.classList.toggle("is-active", gapButton === button);
    updateFollowingPreview();
  });
}
updateFollowingPreview();

const duelSpeed = document.querySelector<HTMLInputElement>("#duel-speed");
const duelSpeedValue = document.querySelector<HTMLOutputElement>("#duel-speed-value");
const duelSlowerSpeed = document.querySelector<HTMLOutputElement>("#duel-slower-speed");
const duelFasterSpeed = document.querySelector<HTMLOutputElement>("#duel-faster-speed");
const duelSlowerDistance = document.querySelector<HTMLOutputElement>("#duel-slower-distance");
const duelFasterDistance = document.querySelector<HTMLOutputElement>("#duel-faster-distance");
const duelSlowerBar = document.querySelector<HTMLElement>(".duel-slower-bar");
const duelFasterBar = document.querySelector<HTMLElement>(".duel-faster-bar");
const duelTest = document.querySelector<HTMLButtonElement>("#duel-test");
const duelResult = document.querySelector<HTMLElement>("#duel-result");
const duelSurfaceInputs = document.querySelectorAll<HTMLInputElement>('input[name="duel-surface"]');

function selectedDuelSurface(): SurfaceCondition {
  const surface = document.querySelector<HTMLInputElement>('input[name="duel-surface"]:checked')?.value;
  if (surface === "dry" || surface === "ice") return surface;
  return "wet";
}

function updateDuelPreview(markUntested = true): void {
  if (
    !duelSpeed ||
    !duelSpeedValue ||
    !duelSlowerSpeed ||
    !duelFasterSpeed ||
    !duelSlowerDistance ||
    !duelFasterDistance ||
    !duelSlowerBar ||
    !duelFasterBar
  ) return;
  const result = calculateSpeedDuel(Number(duelSpeed.value), 1.2, selectedDuelSurface());
  const scaleM = Math.max(100, result.fasterStoppingDistanceM) * 1.05;
  duelSpeed.style.setProperty("--fill", sliderFill(duelSpeed));
  duelSpeedValue.textContent = `${result.slowerSpeedKmh} km/h`;
  duelSlowerSpeed.textContent = String(result.slowerSpeedKmh);
  duelFasterSpeed.textContent = String(result.fasterSpeedKmh);
  duelSlowerDistance.textContent = result.slowerStoppingDistanceM.toFixed(1);
  duelFasterDistance.textContent = result.fasterStoppingDistanceM.toFixed(1);
  duelSlowerBar.style.setProperty("--duel-width", `${(result.slowerStoppingDistanceM / scaleM) * 100}%`);
  duelFasterBar.style.setProperty("--duel-width", `${(result.fasterStoppingDistanceM / scaleM) * 100}%`);
  if (markUntested && duelResult) {
    duelResult.dataset.outcome = "untested";
    duelResult.innerHTML = "<strong>Run both cars to reveal the consequence.</strong><p>The distance bars already share the same scale.</p>";
  }
}

function testSpeedDuel(): void {
  if (!duelSpeed || !duelResult) return;
  const result = calculateSpeedDuel(Number(duelSpeed.value), 1.2, selectedDuelSurface());
  updateDuelPreview(false);
  duelResult.dataset.outcome = "collision";
  duelResult.replaceChildren();
  const duelTitle = document.createElement("strong");
  const duelCopy = document.createElement("p");
  duelTitle.textContent = t("duel.result", { impact: result.impactSpeedKmh.toFixed(0) });
  duelCopy.textContent = t("duel.extra", {
    value: (result.fasterStoppingDistanceM - result.slowerStoppingDistanceM).toFixed(1),
  });
  duelResult.append(duelTitle, duelCopy);
}

duelSpeed?.addEventListener("input", () => updateDuelPreview());
for (const input of duelSurfaceInputs) input.addEventListener("change", () => updateDuelPreview());
duelTest?.addEventListener("click", testSpeedDuel);
updateDuelPreview(false);

const quizScenarios: readonly PredictionScenario[] = [
  { speedKmh: 50, reactionSeconds: 0.8, surface: "dry", obstacleDistanceM: 55 },
  { speedKmh: 70, reactionSeconds: 1.2, surface: "wet", obstacleDistanceM: 55 },
  { speedKmh: 50, reactionSeconds: 1, surface: "dry", obstacleDistanceM: 28.4 },
  { speedKmh: 40, reactionSeconds: 1.5, surface: "wet", obstacleDistanceM: 45 },
  { speedKmh: 90, reactionSeconds: 1.8, surface: "wet", obstacleDistanceM: 95 },
];
const surfaceLabels: Record<SurfaceCondition, string> = { dry: "Dry", wet: "Wet", ice: "Icy" };
const quizQuestionNumber = document.querySelector<HTMLOutputElement>("#quiz-question-number");
const quizScore = document.querySelector<HTMLOutputElement>("#quiz-score");
const quizProgressBar = document.querySelector<HTMLElement>("#quiz-progress-bar");
const quizSpeed = document.querySelector<HTMLOutputElement>("#quiz-speed");
const quizReaction = document.querySelector<HTMLOutputElement>("#quiz-reaction");
const quizSurface = document.querySelector<HTMLElement>("#quiz-surface");
const quizObstacle = document.querySelector<HTMLOutputElement>("#quiz-obstacle");
const quizResult = document.querySelector<HTMLElement>("#quiz-result");
const quizResultTitle = document.querySelector<HTMLElement>("#quiz-result-title");
const quizResultCopy = document.querySelector<HTMLElement>("#quiz-result-copy");
const quizNext = document.querySelector<HTMLButtonElement>("#quiz-next");
const predictionButtons = document.querySelectorAll<HTMLButtonElement>("[data-prediction]");
let quizIndex = 0;
let currentQuizScore = 0;
let quizAnswered = false;
let quizComplete = false;

function renderQuizQuestion(): void {
  const scenario = quizScenarios[quizIndex];
  if (
    !scenario || !quizQuestionNumber || !quizScore || !quizProgressBar || !quizSpeed || !quizReaction ||
    !quizSurface || !quizObstacle || !quizResult || !quizResultTitle || !quizResultCopy || !quizNext
  ) return;
  quizAnswered = false;
  quizComplete = false;
  quizQuestionNumber.textContent = String(quizIndex + 1);
  quizScore.textContent = String(currentQuizScore);
  quizProgressBar.style.width = `${((quizIndex + 1) / quizScenarios.length) * 100}%`;
  quizSpeed.textContent = String(scenario.speedKmh);
  quizReaction.textContent = String(scenario.reactionSeconds);
  quizSurface.textContent = surfaceLabels[scenario.surface];
  quizObstacle.textContent = String(scenario.obstacleDistanceM);
  quizResult.dataset.outcome = "untested";
  quizResultTitle.textContent = "Make your prediction.";
  quizResultCopy.textContent = "You will see the exact stopping distance after answering.";
  quizNext.hidden = true;
  for (const button of predictionButtons) {
    button.disabled = false;
    button.classList.remove("is-selected");
  }
}

function answerPrediction(button: HTMLButtonElement): void {
  const scenario = quizScenarios[quizIndex];
  if (!scenario || quizAnswered || !quizResult || !quizResultTitle || !quizResultCopy || !quizNext || !quizScore) return;
  quizAnswered = true;
  const prediction = button.dataset.prediction;
  const actualOutcome = predictionOutcome(scenario);
  const result = calculateBrakingChallenge(scenario);
  const correct = prediction === actualOutcome;
  if (correct) currentQuizScore += 1;
  quizScore.textContent = String(currentQuizScore);
  quizResult.dataset.outcome = actualOutcome;
  quizResultTitle.textContent = correct ? t("quiz.correct") : t("quiz.wrong", { outcome: actualOutcome });
  quizResultCopy.textContent = actualOutcome === "collision"
    ? `The car needs ${result.totalDistanceM.toFixed(1)} metres and reaches the obstacle at ${result.impactSpeedKmh.toFixed(0)} km/h.`
    : `The car needs ${result.totalDistanceM.toFixed(1)} metres, leaving ${result.clearanceM.toFixed(1)} metres.`;
  button.classList.add("is-selected");
  for (const predictionButton of predictionButtons) predictionButton.disabled = true;
  quizNext.hidden = false;
  quizNext.textContent = quizIndex === quizScenarios.length - 1 ? "See final score" : t("quiz.next");
}

for (const button of predictionButtons) button.addEventListener("click", () => answerPrediction(button));
quizNext?.addEventListener("click", () => {
  if (!quizResult || !quizResultTitle || !quizResultCopy || !quizNext) return;
  if (quizComplete) {
    quizIndex = 0;
    currentQuizScore = 0;
    renderQuizQuestion();
    return;
  }
  if (quizIndex < quizScenarios.length - 1) {
    quizIndex += 1;
    renderQuizQuestion();
    return;
  }
  quizResultTitle.textContent = t("quiz.final", { score: currentQuizScore, total: quizScenarios.length });
  quizResultCopy.textContent = currentQuizScore === quizScenarios.length
    ? "Perfect—you judged every stopping scenario correctly."
    : "Try again and watch how reaction time and grip change the result.";
  quizResult.dataset.outcome = currentQuizScore >= 4 ? "safe" : "tight";
  quizNext.textContent = t("quiz.restart");
  quizComplete = true;
});
renderQuizQuestion();

const weatherTabs = [...document.querySelectorAll<HTMLButtonElement>("[data-weather-tab]")];
const weatherPanels = document.querySelectorAll<HTMLElement>("[data-weather-panel]");

function selectWeatherTab(selectedTab: HTMLButtonElement, moveFocus = false): void {
  const selectedCondition = selectedTab.dataset.weatherTab;
  for (const tab of weatherTabs) {
    const isSelected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  }
  for (const panel of weatherPanels) panel.hidden = panel.dataset.weatherPanel !== selectedCondition;
  if (moveFocus) selectedTab.focus();
}

for (const [index, tab] of weatherTabs.entries()) {
  tab.addEventListener("click", () => selectWeatherTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + weatherTabs.length) % weatherTabs.length;
    const nextTab = weatherTabs[nextIndex];
    if (nextTab) selectWeatherTab(nextTab, true);
  });
}

window.addEventListener("languagechange", () => {
  updateChallengePreview(false);
  updateFollowingPreview();
  updateDuelPreview(false);
  renderQuizQuestion();
  localizeDocument();
  setHazardMessage(hazardMessageKey, hazardMessageVariables);
  renderHazardAnalysis();
});

localizeDocument();

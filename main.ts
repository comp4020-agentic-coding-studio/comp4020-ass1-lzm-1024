import { calculateStoppingDistance, compareTenKmh, type RoadCondition } from "./stopping-distance";
import { compareTruckStoppingDistance } from "./truck-stopping";
import { initLanguageSwitcher, localizeDocument, t } from "./i18n";

initLanguageSwitcher();

const DISTANCE_SCALE_M = 165;

const speedSlider = document.querySelector<HTMLInputElement>("#speed");
const treadSlider = document.querySelector<HTMLInputElement>("#tread-depth");
const roadInputs = document.querySelectorAll<HTMLInputElement>('input[name="road-condition"]');
const roadVisual = document.querySelector<HTMLElement>(".road-visual");
const speedValue = document.querySelector<HTMLOutputElement>("#speed-value");
const treadValue = document.querySelector<HTMLOutputElement>("#tread-value");
const reactionDistance = document.querySelector<HTMLOutputElement>("#reaction-distance");
const brakingDistance = document.querySelector<HTMLOutputElement>("#braking-distance");
const totalDistance = document.querySelector<HTMLOutputElement>("#total-distance");
const totalDistanceSecondary = document.querySelector<HTMLOutputElement>("#total-distance-secondary");
const modelNote = document.querySelector<HTMLElement>("#model-note");
const presetButtons = document.querySelectorAll<HTMLButtonElement>(".preset-buttons button");
const fasterSpeed = document.querySelector<HTMLOutputElement>("#faster-speed");
const slowerSpeed = document.querySelector<HTMLOutputElement>("#slower-speed");
const fasterSpeedCopy = document.querySelector<HTMLOutputElement>("#faster-speed-copy");
const slowerSpeedCopy = document.querySelector<HTMLOutputElement>("#slower-speed-copy");
const extraDistance = document.querySelector<HTMLOutputElement>("#extra-distance");
const residualSpeed = document.querySelector<HTMLOutputElement>("#residual-speed");
const truckSpeedSlider = document.querySelector<HTMLInputElement>("#truck-speed");
const truckSpeedValue = document.querySelector<HTMLOutputElement>("#truck-speed-value");
const truckCarDistance = document.querySelector<HTMLOutputElement>("#truck-car-distance");
const truckDistance = document.querySelector<HTMLOutputElement>("#truck-distance");
const truckExtraDistance = document.querySelector<HTMLOutputElement>("#truck-extra-distance");
const truckComparison = document.querySelector<HTMLElement>(".truck-comparison");

function sliderFill(slider: HTMLInputElement): string {
  const min = Number(slider.min);
  const max = Number(slider.max);
  return `${(((Number(slider.value) - min) / (max - min)) * 100).toFixed(2)}%`;
}

function selectedRoadCondition(): RoadCondition {
  return document.querySelector<HTMLInputElement>('input[name="road-condition"]:checked')?.value === "dry"
    ? "dry"
    : "wet";
}

function update(): void {
  if (
    !speedSlider ||
    !treadSlider ||
    !roadVisual ||
    !speedValue ||
    !treadValue ||
    !reactionDistance ||
    !brakingDistance ||
    !totalDistance ||
    !totalDistanceSecondary ||
    !modelNote
  ) return;

  const speedKmh = Number(speedSlider.value);
  const treadDepthMm = Number(treadSlider.value);
  const roadCondition = selectedRoadCondition();
  const result = calculateStoppingDistance(speedKmh, roadCondition, treadDepthMm);
  const comparison = compareTenKmh(speedKmh, roadCondition, treadDepthMm);
  const reactionPercent = (result.reactionDistanceM / DISTANCE_SCALE_M) * 100;
  const brakingPercent = (result.brakingDistanceM / DISTANCE_SCALE_M) * 100;
  const totalPercent = (result.totalDistanceM / DISTANCE_SCALE_M) * 100;

  roadVisual.style.setProperty("--reaction-width", `${reactionPercent.toFixed(3)}%`);
  roadVisual.style.setProperty("--braking-width", `${brakingPercent.toFixed(3)}%`);
  roadVisual.style.setProperty("--total-position", `${totalPercent.toFixed(3)}%`);
  roadVisual.dataset.condition = roadCondition;
  speedSlider.style.setProperty("--fill", sliderFill(speedSlider));
  treadSlider.style.setProperty("--fill", sliderFill(treadSlider));

  speedValue.textContent = `${speedKmh} km/h`;
  treadValue.textContent = `${treadDepthMm.toFixed(1)} mm`;
  reactionDistance.textContent = result.reactionDistanceM.toFixed(1);
  brakingDistance.textContent = result.brakingDistanceM.toFixed(1);
  totalDistance.textContent = result.totalDistanceM.toFixed(1);
  totalDistanceSecondary.textContent = result.totalDistanceM.toFixed(1);

  if (fasterSpeed && slowerSpeed && fasterSpeedCopy && slowerSpeedCopy && extraDistance && residualSpeed) {
    fasterSpeed.textContent = String(comparison.fasterSpeedKmh);
    slowerSpeed.textContent = String(comparison.slowerSpeedKmh);
    fasterSpeedCopy.textContent = String(comparison.fasterSpeedKmh);
    slowerSpeedCopy.textContent = String(comparison.slowerSpeedKmh);
    extraDistance.textContent = comparison.extraStoppingDistanceM.toFixed(1);
    residualSpeed.textContent = comparison.residualSpeedKmh.toFixed(0);
  }

  for (const button of presetButtons) {
    const isActive =
      Number(button.dataset.speed) === speedKmh &&
      Number(button.dataset.tread) === treadDepthMm &&
      button.dataset.road === roadCondition;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  modelNote.textContent = roadCondition === "wet"
    ? t("model.wet", { value: (result.treadMultiplier * 100).toFixed(1) })
    : t("model.dry", { value: (result.treadMultiplier * 100).toFixed(1) });
  localizeDocument();
}

if (speedSlider && treadSlider && roadInputs.length > 0) {
  speedSlider.addEventListener("input", update);
  treadSlider.addEventListener("input", update);
  for (const input of roadInputs) input.addEventListener("change", update);
  for (const button of presetButtons) {
    button.addEventListener("click", () => {
      speedSlider.value = button.dataset.speed ?? speedSlider.value;
      treadSlider.value = button.dataset.tread ?? treadSlider.value;
      const road = document.querySelector<HTMLInputElement>(
        `input[name="road-condition"][value="${button.dataset.road}"]`,
      );
      if (road) road.checked = true;
      update();
    });
  }
  update();
}

window.addEventListener("languagechange", () => {
  update();
  updateTruckComparison();
});

function updateTruckComparison(): void {
  if (
    !truckSpeedSlider ||
    !truckSpeedValue ||
    !truckCarDistance ||
    !truckDistance ||
    !truckExtraDistance ||
    !truckComparison
  ) return;

  const comparison = compareTruckStoppingDistance(Number(truckSpeedSlider.value));
  const scaleMaximumM = 200;

  truckSpeedSlider.style.setProperty("--fill", sliderFill(truckSpeedSlider));
  truckComparison.style.setProperty(
    "--car-distance-width",
    `${((comparison.carDistanceM / scaleMaximumM) * 100).toFixed(2)}%`,
  );
  truckComparison.style.setProperty(
    "--truck-distance-width",
    `${((comparison.truckDistanceM / scaleMaximumM) * 100).toFixed(2)}%`,
  );
  truckSpeedValue.textContent = `${comparison.speedKmh} km/h`;
  truckCarDistance.textContent = String(comparison.carDistanceM);
  truckDistance.textContent = String(comparison.truckDistanceM);
  truckExtraDistance.textContent = String(comparison.extraDistanceM);
}

if (truckSpeedSlider) {
  truckSpeedSlider.addEventListener("input", updateTruckComparison);
  updateTruckComparison();
}

import { currentGap, latestByCategory } from "./timeline";
import type { Category, Milestone, TechTransfer } from "./timeline";

// Matched military -> civil technology-transfer pairs. These are the actual
// evidence behind "the lag": a real breakthrough year in a military lane and
// the year (if any) the same technology reached civil aviation.
const TRANSFERS: TechTransfer[] = [
  {
    name: "Jet propulsion",
    militaryYear: 1944,
    militaryLabel: "Messerschmitt Me 262 enters service",
    civilYear: 1952,
    civilLabel: "de Havilland Comet enters commercial service",
  },
  {
    name: "Breaking the sound barrier",
    militaryYear: 1947,
    militaryLabel: "Bell X-1",
    civilYear: 1976,
    civilLabel: "Concorde enters supersonic passenger service",
  },
  {
    name: "Fly-by-wire flight controls",
    militaryYear: 1974,
    militaryLabel: "General Dynamics F-16 first flight",
    civilYear: 1988,
    civilLabel: "Airbus A320 enters service",
  },
  {
    name: "Stealth shaping",
    militaryYear: 1991,
    militaryLabel: "F-117 Nighthawk's combat debut",
    civilYear: null,
    civilLabel: null,
  },
  {
    name: "Majority-composite airframe",
    militaryYear: 1989,
    militaryLabel: "Northrop B-2 Spirit first flight",
    civilYear: 2009,
    civilLabel: "Boeing 787 first flight",
  },
];

const CATEGORIES: Category[] = ["civil", "fighter", "bomber"];

function parseMilestones(track: HTMLElement): Milestone[] {
  return Array.from(track.querySelectorAll<HTMLElement>(".milestone")).map((el) => ({
    year: Number(el.dataset.year),
    category: el.dataset.category as Category,
    title: el.querySelector(".milestone-title")?.textContent?.trim() ?? "",
  }));
}

function readCssNumber(el: HTMLElement, property: string): number {
  return Number.parseFloat(getComputedStyle(el).getPropertyValue(property));
}

const timelineEl = document.querySelector<HTMLElement>('[data-testid="core-interaction-trigger"]');
const trackEl = timelineEl?.querySelector<HTMLElement>(".timeline-track");
const readoutEl = document.querySelector<HTMLElement>('[data-testid="core-interaction-target"]');

if (timelineEl && trackEl && readoutEl) {
  const timeline = timelineEl;
  const track = trackEl;
  const readout = readoutEl;

  const milestones = parseMilestones(track);
  const startYear = readCssNumber(track, "--start-year");
  const pxPerYear = readCssNumber(track, "--px-per-year");

  function focusYear(): number {
    return Math.round(startYear + (timeline.scrollLeft + timeline.clientWidth / 2) / pxPerYear);
  }

  function update(): void {
    const year = focusYear();
    const gapLine = currentGap(TRANSFERS, year);
    const laneStatus = CATEGORIES.map((category) => {
      const milestone = latestByCategory(milestones, year, category);
      return milestone ? `${category}: ${milestone.title} (${milestone.year})` : `${category}: not yet`;
    }).join(" · ");
    readout.textContent = `${gapLine} ${laneStatus}`;
  }

  let scheduled = false;
  timeline.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  });

  // Progressive enhancement: the container already scrolls horizontally
  // with a trackpad or touch; this lets a plain vertical mouse wheel drive
  // it too, without disabling native scrolling for anyone else.
  timeline.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      timeline.scrollLeft += event.deltaY;
    },
    { passive: false },
  );

  update();
}

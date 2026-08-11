// Pure, DOM-free logic behind the timeline's readout: no scroll math, no
// rendering, just "given a focus year, what does the lag look like".

export type Category = "civil" | "fighter" | "bomber";

export interface Milestone {
  year: number;
  category: Category;
  title: string;
}

// A technology that appeared in a military lane before it (if ever) reached
// civil aviation. This is the actual evidence behind the "military leads
// civil by a lag" thesis — a real, citable pair of years, not an arbitrary
// difference between two unrelated aircraft that happen to be each lane's
// most recent entry.
export interface TechTransfer {
  name: string;
  militaryYear: number;
  militaryLabel: string;
  // null means the technology has not reached mainstream civil aviation.
  civilYear: number | null;
  civilLabel: string | null;
}

export function latestByCategory(
  milestones: readonly Milestone[],
  year: number,
  category: Category,
): Milestone | undefined {
  return milestones
    .filter((milestone) => milestone.category === category && milestone.year <= year)
    .sort((a, b) => b.year - a.year)[0];
}

// The transfer whose military debut is the most recent one at or before
// `year` — i.e. the breakthrough the visitor has just scrolled past.
export function activeTransfer(
  transfers: readonly TechTransfer[],
  year: number,
): TechTransfer | undefined {
  return transfers
    .filter((transfer) => transfer.militaryYear <= year)
    .sort((a, b) => b.militaryYear - a.militaryYear)[0];
}

export function currentGap(transfers: readonly TechTransfer[], year: number): string {
  const transfer = activeTransfer(transfers, year);
  if (!transfer) return `${year} — before powered flight reached either lane.`;

  if (transfer.civilYear === null) {
    const yearsSince = year - transfer.militaryYear;
    return `${year} — ${transfer.name}: military since ${transfer.militaryYear} (${transfer.militaryLabel}). ${
      yearsSince === 0 ? "Still" : `${yearsSince} year${yearsSince === 1 ? "" : "s"} on, still`
    } no civil equivalent.`;
  }

  if (year < transfer.civilYear) {
    const yearsSince = year - transfer.militaryYear;
    return `${year} — ${transfer.name}: military had it since ${transfer.militaryYear} (${transfer.militaryLabel}); civil aviation doesn't yet. ${yearsSince} year${yearsSince === 1 ? "" : "s"} and counting.`;
  }

  const gap = transfer.civilYear - transfer.militaryYear;
  return `${year} — ${transfer.name}: military ${transfer.militaryYear} (${transfer.militaryLabel}) to civil ${transfer.civilYear} (${transfer.civilLabel}) — a ${gap}-year gap.`;
}

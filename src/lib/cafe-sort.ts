import type { Cafe } from "@/data/cafes";

export type CafeSortId = "recommended" | "nearest" | "recently-verified";

export const CAFE_SORT_OPTIONS: ReadonlyArray<{
  id: CafeSortId;
  label: string;
  explanation: string;
}> = [
  {
    id: "recommended",
    label: "Recommended",
    explanation:
      "More community confirmations first; ties use fresher checks, then distance.",
  },
  {
    id: "nearest",
    label: "Nearest",
    explanation:
      "Shortest listed distance first; ties are alphabetical. New cafés without a distance follow.",
  },
  {
    id: "recently-verified",
    label: "Recently verified",
    explanation:
      "Newest community checks first; ties use confirmations, then distance. Undated map screenings follow.",
  },
];

const DAYS_PER_UNIT: Record<string, number> = {
  day: 1,
  days: 1,
  week: 7,
  weeks: 7,
  month: 30,
  months: 30,
  year: 365,
  years: 365,
};

function compareNumbers(a: number, b: number) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function compareNames(a: Cafe, b: Cafe) {
  const nameComparison = a.name.localeCompare(b.name, "en", {
    sensitivity: "base",
  });

  return nameComparison || a.id.localeCompare(b.id, "en");
}

function listedDistance(cafe: Cafe) {
  const distance = Number.parseFloat(cafe.distance);
  return Number.isFinite(distance) ? distance : Number.POSITIVE_INFINITY;
}

function daysSinceVerification(cafe: Cafe) {
  const freshness = cafe.freshness.trim().toLocaleLowerCase("en");

  if (freshness === "just now" || freshness === "today") return 0;
  if (freshness === "yesterday") return 1;

  const relativeDate = freshness.match(
    /^(?:an?|(\d+))\s+(day|days|week|weeks|month|months|year|years)\s+ago$/,
  );

  if (!relativeDate) return Number.POSITIVE_INFINITY;

  const quantity = relativeDate[1] ? Number(relativeDate[1]) : 1;
  return quantity * DAYS_PER_UNIT[relativeDate[2]];
}

function compareByDistance(a: Cafe, b: Cafe) {
  return compareNumbers(listedDistance(a), listedDistance(b));
}

function compareByFreshness(a: Cafe, b: Cafe) {
  return compareNumbers(daysSinceVerification(a), daysSinceVerification(b));
}

function compareByConfirmations(a: Cafe, b: Cafe) {
  return compareNumbers(b.confirmations, a.confirmations);
}

export function sortCafes(cafes: Cafe[], sortId: CafeSortId) {
  return [...cafes].sort((a, b) => {
    if (sortId === "nearest") {
      return compareByDistance(a, b) || compareNames(a, b);
    }

    if (sortId === "recently-verified") {
      return (
        compareByFreshness(a, b) ||
        compareByConfirmations(a, b) ||
        compareByDistance(a, b) ||
        compareNames(a, b)
      );
    }

    return (
      compareByConfirmations(a, b) ||
      compareByFreshness(a, b) ||
      compareByDistance(a, b) ||
      compareNames(a, b)
    );
  });
}

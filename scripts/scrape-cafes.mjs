// Build a reproducible, evidence-screened list of San Francisco work-café
// candidates from OpenStreetMap (OSM).
//
// OSM data is © OpenStreetMap contributors, licensed under the ODbL.
// This script uses Node 18+ global fetch and has no package dependencies.
//
// Usage:
//   node scripts/scrape-cafes.mjs > src/data/cafes.imported.ts
//   node scripts/scrape-cafes.mjs --limit 50 > src/data/cafes.imported.ts
//
// A record must have a name, coordinates, a complete street address, explicit
// positive internet access, and no explicit "indoor_seating=no" tag. These are
// evidence gates, not a claim that a café welcomes laptops or has power outlets.
// See docs/cafe-scraping-methodology.md for the complete selection metric.

const args = process.argv.slice(2);

function getArg(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return number;
}

// Covers San Francisco proper and deliberately excludes neighboring cities.
const SF_BOUNDS = {
  south: 37.7034,
  west: -122.527,
  north: 37.812,
  east: -122.3482,
};

// Must match MAP_CENTER in src/components/cafe-explorer.tsx ([lon, lat]).
const CENTER = { lat: 37.7708, lon: -122.4216 };
const LIMIT = positiveInteger(getArg("limit", "100"), "--limit");

// Names already present as fictional demo data; do not mix a real café that
// happens to share one of these exact names into the demo records.
const DEMO_NAMES = new Set([
  "juniper coffee",
  "field day café",
  "north star coffee",
  "paper plane",
  "the nook",
  "good day roasters",
]);

// Curated SF neighborhood centroids. This remains a heuristic: OSM usually
// does not have a neighborhood tag appropriate for display.
const NEIGHBORHOODS = [
  ["Lower Haight", 37.7715, -122.4312],
  ["Hayes Valley", 37.7759, -122.4245],
  ["The Mission", 37.7599, -122.4148],
  ["Mission Dolores", 37.7645, -122.427],
  ["SoMa", 37.7785, -122.4056],
  ["Duboce Triangle", 37.769, -122.433],
  ["The Castro", 37.7609, -122.435],
  ["Noe Valley", 37.7502, -122.4337],
  ["Cole Valley", 37.7659, -122.4497],
  ["NoPa", 37.7752, -122.439],
  ["Western Addition", 37.7805, -122.431],
  ["Japantown", 37.7852, -122.4295],
  ["Fillmore", 37.784, -122.433],
  ["Tenderloin", 37.784, -122.413],
  ["Nob Hill", 37.793, -122.4161],
  ["Potrero Hill", 37.7605, -122.4],
  ["Pacific Heights", 37.7925, -122.4382],
  ["Richmond District", 37.7805, -122.4705],
  ["Inner Sunset", 37.7628, -122.4656],
  ["Outer Sunset", 37.7536, -122.494],
  ["Chinatown", 37.7941, -122.4078],
  ["North Beach", 37.8023, -122.4098],
  ["Financial District", 37.794, -122.4005],
  ["Mission Bay", 37.7718, -122.3935],
  ["Dogpatch", 37.7599, -122.3888],
  ["Excelsior", 37.7247, -122.4326],
  ["Bernal Heights", 37.742, -122.415],
  ["West Portal", 37.7406, -122.4654],
];

const COLORS = ["green", "blue", "amber", "pink"];
const RADIANS = Math.PI / 180;
const POSITIVE_INTERNET_ACCESS = new Set(["yes", "wifi", "wlan"]);

function haversineMiles(aLat, aLon, bLat, bLon) {
  const radius = 3958.8;
  const dLat = (bLat - aLat) * RADIANS;
  const dLon = (bLon - aLon) * RADIANS;
  const lat1 = aLat * RADIANS;
  const lat2 = bLat * RADIANS;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function nearestNeighborhood(lat, lon) {
  let best = NEIGHBORHOODS[0];
  let bestDistance = Infinity;
  for (const neighborhood of NEIGHBORHOODS) {
    const distance = haversineMiles(lat, lon, neighborhood[1], neighborhood[2]);
    if (distance < bestDistance) {
      best = neighborhood;
      bestDistance = distance;
    }
  }
  return best[0];
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function rotationFor(id) {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (hash % 6) - 3;
}

function mapAddress(tags) {
  return `${tags["addr:housenumber"]} ${tags["addr:street"]}`;
}

function isPositiveInternetAccess(tags) {
  return POSITIVE_INTERNET_ACCESS.has((tags.internet_access || "").toLowerCase());
}

function hasCompleteAddress(tags) {
  return Boolean(tags["addr:housenumber"] && tags["addr:street"]);
}

function hasListedHours(tags) {
  return Boolean(tags.opening_hours) && !/(closed|coming soon)/i.test(tags.opening_hours);
}

function hasCoffeeServiceTag(tags) {
  return /coffee|cafe|tea|bakery|breakfast|pastry|donut|dessert|boba/i.test(
    `${tags.cuisine || ""} ${tags.name || ""}`,
  );
}

function qualityScore(tags) {
  // The four required gates are deliberately not included in the score: every
  // emitted result passed them. The score only prioritizes richer supporting
  // evidence while preserving the entire qualifying set.
  let score = 0;
  if (hasListedHours(tags)) score += 2;
  if (tags.website || tags["contact:website"]) score += 1;
  if (tags.phone || tags["contact:phone"]) score += 1;
  if (hasCoffeeServiceTag(tags)) score += 1;
  if (tags.indoor_seating === "yes") score += 1;
  if (["yes", "sidewalk", "patio", "terrace"].includes(tags.outdoor_seating)) score += 1;
  return score;
}

function candidateKey(name, tags) {
  return `${name.toLocaleLowerCase()}\u0000${tags["addr:housenumber"]}\u0000${tags["addr:street"].toLocaleLowerCase()}`;
}

async function overpass(query) {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  const errors = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "workinacafe-cafe-scraper/2.0 (https://github.com/anishthite/workinacafe)",
          Accept: "application/json",
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!response.ok) {
        errors.push(`${endpoint} returned ${response.status}`);
        continue;
      }
      return response.json();
    } catch (error) {
      errors.push(`${endpoint} failed: ${error.message}`);
    }
  }

  throw new Error(`All Overpass endpoints failed (${errors.join("; ")}).`);
}

const QUERY = `
[out:json][timeout:90];
(
  node["amenity"="cafe"](${SF_BOUNDS.south},${SF_BOUNDS.west},${SF_BOUNDS.north},${SF_BOUNDS.east});
  way["amenity"="cafe"](${SF_BOUNDS.south},${SF_BOUNDS.west},${SF_BOUNDS.north},${SF_BOUNDS.east});
  relation["amenity"="cafe"](${SF_BOUNDS.south},${SF_BOUNDS.west},${SF_BOUNDS.north},${SF_BOUNDS.east});
);
out center tags;
`;

function toCandidate(element) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  const name = (tags.name || "").trim();
  if (
    !name ||
    lat == null ||
    lon == null ||
    DEMO_NAMES.has(name.toLocaleLowerCase()) ||
    !hasCompleteAddress(tags) ||
    !isPositiveInternetAccess(tags) ||
    tags.indoor_seating === "no"
  ) {
    return null;
  }

  return {
    element,
    tags,
    name,
    latitude: lat,
    longitude: lon,
    distance: haversineMiles(CENTER.lat, CENTER.lon, lat, lon),
    score: qualityScore(tags),
  };
}

function toRecord(candidate, index) {
  const { element, tags, name, latitude, longitude, distance } = candidate;
  const id = `osm-${element.type}-${element.id}-${slugify(name)}`;
  return {
    id,
    name,
    neighborhood: nearestNeighborhood(latitude, longitude),
    address: mapAddress(tags),
    distance: `${distance.toFixed(1)} mi`,
    longitude: Number(longitude.toFixed(4)),
    latitude: Number(latitude.toFixed(4)),
    // This is a discovery list, not a timezone-aware live-hours service.
    isOpen: true,
    closesAt: "Hours vary",
    wifi: "Good",
    outlets: "A few",
    noise: "Conversational",
    calls: "Brief calls",
    outdoor: ["yes", "sidewalk", "patio", "terrace"].includes(tags.outdoor_seating),
    freshness: "screened from OpenStreetMap",
    confirmations: 0,
    seatTip: "Wi-Fi is mapped; seating and outlets still need a community check.",
    laptopPolicy: "Laptop policy not yet confirmed.",
    price: "$$",
    accessible: tags.wheelchair === "yes",
    color: COLORS[index % COLORS.length],
    rotation: rotationFor(id),
    submitted: true,
  };
}

function serialize(record) {
  const lines = Object.entries(record).map(([key, value]) => `    ${key}: ${JSON.stringify(value)},`);
  return `  {\n${lines.join("\n")}\n  },`;
}

async function main() {
  const data = await overpass(QUERY);
  const seen = new Set();
  const candidates = [];

  for (const element of data.elements) {
    const candidate = toCandidate(element);
    if (!candidate) continue;
    const key = candidateKey(candidate.name, candidate.tags);
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(candidate);
  }

  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      a.distance - b.distance ||
      a.name.localeCompare(b.name),
  );
  const chosen = candidates.slice(0, LIMIT);
  const records = chosen.map(toRecord);

  process.stderr.write(
    `Fetched ${data.elements.length} OSM elements; ${candidates.length} passed the work-café evidence gates; emitting ${records.length}.\n`,
  );

  const header = `// AUTO-GENERATED by scripts/scrape-cafes.mjs — do not edit by hand.
// Source: OpenStreetMap via the Overpass API, © OpenStreetMap contributors (ODbL).
// Regenerate: node scripts/scrape-cafes.mjs > src/data/cafes.imported.ts
// Search: amenity=cafe in the San Francisco bounding box; work-café evidence gates; limit ${LIMIT}.
// See docs/cafe-scraping-methodology.md for the audit, score, provenance, and caveats.

import type { Cafe } from "./cafes";

export const IMPORTED_CAFES: Cafe[] = [
`;
  process.stdout.write(`${header}${records.map(serialize).join("\n")}\n];\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

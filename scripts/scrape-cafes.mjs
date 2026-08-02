// Scrape work-friendly cafés near the Workspot map center from OpenStreetMap.
//
// Data source: OpenStreetMap via the Overpass API (https://overpass-api.de).
// OSM data is © OpenStreetMap contributors, licensed under the ODbL.
//
// This script is deliberately dependency-free (Node 18+ global fetch) and
// deterministic: given the same OSM snapshot it produces the same records.
//
// Usage:
//   node scripts/scrape-cafes.mjs > src/data/cafes.imported.ts
//   node scripts/scrape-cafes.mjs --limit 30    # cap number of cafés
//   node scripts/scrape-cafes.mjs --radius 3000 # search radius in metres
//
// It prints a complete TypeScript module exporting `IMPORTED_CAFES: Cafe[]`,
// so regenerating never touches the hand-authored records in cafes.ts.
//
// It only emits fields we can source or honestly derive. Fields OSM does not
// carry (outlets, noise, calls, seat tips, laptop policy, live hours) are set
// to neutral, clearly-unverified defaults and flagged with `submitted: true`
// so the UI shows them as fresh community imports awaiting confirmation.

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

// Must match MAP_CENTER in src/components/cafe-explorer.tsx ([lon, lat]).
const CENTER = { lat: 37.7708, lon: -122.4216 };
const RADIUS_M = Number(getArg("radius", "2500"));
const LIMIT = Number(getArg("limit", "28"));

// Names already present as demo data; skip any real-world collisions.
const EXISTING_NAMES = new Set([
  "juniper coffee",
  "field day café",
  "north star coffee",
  "paper plane",
  "the nook",
  "good day roasters",
]);

// Curated SF neighborhood centroids. We assign each café to the nearest one.
// This is a heuristic (OSM cafés rarely carry a reliable neighborhood tag).
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
];

const RADIANS = Math.PI / 180;
function haversineMiles(aLat, aLon, bLat, bLon) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (bLat - aLat) * RADIANS;
  const dLon = (bLon - aLon) * RADIANS;
  const lat1 = aLat * RADIANS;
  const lat2 = bLat * RADIANS;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestNeighborhood(lat, lon) {
  let best = NEIGHBORHOODS[0];
  let bestD = Infinity;
  for (const n of NEIGHBORHOODS) {
    const d = haversineMiles(lat, lon, n[1], n[2]);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best[0];
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Deterministic small rotation in the range used by the existing demo data.
function rotationFor(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 6) - 3; // -3..2
}

const COLORS = ["green", "blue", "amber", "pink"];

function mapWifi(tags) {
  const ia = tags.internet_access;
  if (ia === "wlan" || ia === "yes" || ia === "wifi") return "Good";
  return "Okay"; // unknown -> conservative floor (type has no "Unknown")
}

function mapAddress(tags) {
  const num = tags["addr:housenumber"];
  const street = tags["addr:street"];
  if (num && street) return `${num} ${street}`;
  if (street) return street;
  return "Address needs confirmation";
}

async function overpass(query) {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "workspot-cafe-scraper/1.0 (https://github.com/; OSM import)",
      Accept: "application/json",
    },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}: ${await res.text()}`);
  return res.json();
}

const QUERY = `
[out:json][timeout:60];
(
  node["amenity"="cafe"](around:${RADIUS_M},${CENTER.lat},${CENTER.lon});
  way["amenity"="cafe"](around:${RADIUS_M},${CENTER.lat},${CENTER.lon});
);
out center tags;
`;

function toRecord(el, index) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  const name = (tags.name || "").trim();
  const id = slugify(name);
  const distance = haversineMiles(CENTER.lat, CENTER.lon, lat, lon);
  return {
    id,
    name,
    neighborhood: nearestNeighborhood(lat, lon),
    address: mapAddress(tags),
    distance: `${distance.toFixed(1)} mi`,
    _distance: distance,
    longitude: Number(lon.toFixed(4)),
    latitude: Number(lat.toFixed(4)),
    isOpen: true, // live "open now" is not scraped; see methodology
    closesAt: "Hours vary",
    wifi: mapWifi(tags),
    outlets: "A few", // not in OSM
    noise: "Conversational", // not in OSM
    calls: "Brief calls", // not in OSM
    outdoor: tags.outdoor_seating === "yes",
    freshness: "imported from OpenStreetMap",
    confirmations: 0,
    seatTip: "No community seat tips yet — add one after your visit.",
    laptopPolicy: "Laptop policy not yet confirmed.",
    price: "$$", // OSM rarely carries reliable price data
    accessible: tags.wheelchair === "yes",
    color: COLORS[index % COLORS.length],
    rotation: rotationFor(id),
    submitted: true,
  };
}

function serialize(record) {
  const lines = Object.entries(record)
    .filter(([k]) => !k.startsWith("_")) // drop internal sort-only fields
    .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`);
  return `  {\n${lines.join("\n")}\n  },`;
}

async function main() {
  const data = await overpass(QUERY);
  const seen = new Set();
  const records = [];
  for (const el of data.elements) {
    const name = (el.tags?.name || "").trim();
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!name || lat == null || lon == null) continue;
    const key = name.toLowerCase();
    if (EXISTING_NAMES.has(key) || seen.has(key)) continue;
    seen.add(key);
    records.push(toRecord({ ...el, lat, lon }, records.length));
  }

  records.sort((a, b) => a._distance - b._distance);
  const chosen = records.slice(0, LIMIT);
  // Re-assign colors after sorting so the palette cycles by distance order.
  chosen.forEach((r, i) => (r.color = COLORS[i % COLORS.length]));

  process.stderr.write(
    `Fetched ${data.elements.length} elements, ${records.length} named unique cafés, emitting ${chosen.length}.\n`,
  );

  const header = `// AUTO-GENERATED by scripts/scrape-cafes.mjs — do not edit by hand.
// Source: OpenStreetMap via the Overpass API, © OpenStreetMap contributors (ODbL).
// Regenerate: node scripts/scrape-cafes.mjs > src/data/cafes.imported.ts
// Search: amenity=cafe within ${RADIUS_M}m of [${CENTER.lon}, ${CENTER.lat}], limit ${LIMIT}.
// See docs/cafe-scraping-methodology.md for field provenance and caveats.

import type { Cafe } from "./cafes";

export const IMPORTED_CAFES: Cafe[] = [
`;
  process.stdout.write(
    header + chosen.map(serialize).join("\n") + "\n];\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

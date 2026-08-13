# Café scraping methodology

How the imported café records in `src/data/cafes.imported.ts` were produced, so
the next batch is reproducible and the data provenance is honest.

## Goal

Grow the Workspot map beyond the six hand-authored demo cafés by importing
**real** cafés near the map center, without fabricating the work-signal fields
we cannot actually measure.

## Source

- **OpenStreetMap** (OSM), queried through the **Overpass API**
  (`https://overpass-api.de/api/interpreter`).
- OSM data is © OpenStreetMap contributors, licensed under the
  [ODbL](https://www.openstreetmap.org/copyright). Any published use must keep
  that attribution.

OSM was chosen over Google Places / Yelp because it is openly licensed,
free to query, and requires no API key — so this import is fully reproducible
by anyone with the repo.

## Search parameters

The scraper searches `amenity=cafe` nodes and ways within a radius of the map
center used by the app (`MAP_CENTER` in `src/components/cafe-explorer.tsx`).

| Parameter | Value | Why |
| --- | --- | --- |
| Center | `[-122.4216, 37.7708]` | Same center the map renders around |
| Radius | `2500 m` | Roughly the zoom-13.2 viewport across SF's Mission/Hayes core |
| Element types | `node`, `way` | Cafés are mapped as both points and building footprints |
| Limit | `28` | "A whole bunch" while keeping the list scannable |

Overpass QL query (see `scripts/scrape-cafes.mjs`):

```overpassql
[out:json][timeout:60];
(
  node["amenity"="cafe"](around:2500,37.7708,-122.4216);
  way["amenity"="cafe"](around:2500,37.7708,-122.4216);
);
out center tags;
```

## Pipeline

1. **Fetch** all `amenity=cafe` elements in radius (287 elements in the first run).
2. **Filter** to elements that have a `name` and coordinates.
3. **De-duplicate** by lowercased name, and drop any name that collides with the
   existing demo cafés.
4. **Map** each element to a `Cafe` record (see field provenance below).
5. **Sort** by distance from the map center and take the closest `--limit`.
6. **Emit** a complete TypeScript module (`IMPORTED_CAFES: Cafe[]`).

First run: `287 elements → 248 named unique cafés → 28 emitted`.

## Field provenance

We only claim what OSM can support. Everything else is a clearly-neutral
placeholder, and every imported café is flagged `submitted: true` so the UI
renders it as an unverified community import (the "New community spot" badge)
with `confirmations: 0`.

| Field | Source | Notes |
| --- | --- | --- |
| `name` | OSM `name` | Verbatim |
| `latitude` / `longitude` | OSM node / way center | Rounded to 4 dp |
| `address` | OSM `addr:housenumber` + `addr:street` | Falls back to "Address needs confirmation" |
| `distance` | Computed | Haversine from map center, in miles |
| `neighborhood` | **Derived (heuristic)** | Nearest of a curated SF neighborhood centroid list; OSM cafés rarely carry a reliable neighborhood tag |
| `wifi` | OSM `internet_access` | `wlan`/`yes`/`wifi` → "Good", else "Okay" (type has no "Unknown") |
| `outdoor` | OSM `outdoor_seating` | `yes` → true |
| `accessible` | OSM `wheelchair` | `yes` → true |
| `color` | Derived | Cycles green/blue/amber/pink by distance order |
| `rotation` | Derived | Deterministic hash of the id, range −3..2 |
| `outlets` | **Placeholder** | Not in OSM → "A few" |
| `noise` | **Placeholder** | Not in OSM → "Conversational" |
| `calls` | **Placeholder** | Not in OSM → "Brief calls" |
| `price` | **Placeholder** | OSM price data is unreliable → "$$" |
| `seatTip` / `laptopPolicy` | **Placeholder** | Human knowledge → "not yet confirmed" copy |
| `isOpen` / `closesAt` | **Not scraped** | Live "open now" needs an `opening_hours` parser + timezone-aware clock; set to `true` / "Hours vary" and flagged for follow-up |

### Known limitations / follow-ups

- **Live hours are not modeled.** Every import shows as tentatively open. A real
  follow-up would parse OSM `opening_hours` against the current time.
- **Neighborhood is a nearest-centroid guess**, not a polygon lookup. Cafés on a
  boundary can land in a neighbor. A future pass could use OSM boundary
  relations or a reverse-geocode.
- **Work signals (outlets/noise/calls/tips/policy) are placeholders** by design —
  these are exactly the community-confirmed fields Workspot exists to collect, so
  they should come from real check-ins, not scraping.

## Reproduce / regenerate

```bash
node scripts/scrape-cafes.mjs > src/data/cafes.imported.ts   # default: 28 cafés, 2500 m
node scripts/scrape-cafes.mjs --limit 40 --radius 4000 > src/data/cafes.imported.ts
npm run lint && npx tsc --noEmit && npm run build             # validate
```

The generated file is deterministic for a given OSM snapshot, so re-running only
changes records when the underlying OSM data changes.

## Scaling to "a whole bunch more"

- Raise `--limit` and `--radius`, or run several centers to cover more of SF.
- Add richer OSM tags (`cuisine`, `takeaway`, `opening_hours`) to the mapper.
- Keep generated data in `cafes.imported.ts` only — never hand-edit it, so a
  future re-scrape stays a one-command operation.

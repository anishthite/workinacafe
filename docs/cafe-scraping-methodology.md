# Café research, screening, and import methodology

This document records how the café lists in `src/data/cafes.imported.ts` are
produced and audited. It is designed to make the next research pass repeatable,
honest about what we know, and easy to improve.

## What “good to work from” means in this dataset

This is an **evidence-based discovery list**, not a definitive statement that a
café is laptop-friendly. An imported café is eligible only when OpenStreetMap
(OSM) provides evidence of all of the following:

1. It is tagged `amenity=cafe`, has a name, and has mappable coordinates.
2. It has a complete street address (`addr:housenumber` and `addr:street`).
3. It has explicit positive internet access: `internet_access=yes`, `wlan`, or
   `wifi`.
4. It is not explicitly mapped as `indoor_seating=no`.

Those are the **required gates**. They ensure the map has a real, locatable café
with mapped Wi-Fi and no evidence that it is standing/outdoor-only. They do not
prove outlet availability, seat availability, laptop policy, noise, or calls.
Those require a current community check-in and remain unverified in the UI.

The post-gate **quality score** ranks richer OSM evidence without excluding a
qualifying café:

| Evidence | Points | Reason |
| --- | ---: | --- |
| Listed, non-closure `opening_hours` tag | 2 | Stronger evidence the listing is maintained and usable to plan a visit |
| Official/contact website | 1 | Provides a path to verify before visiting |
| Phone/contact phone | 1 | Provides a second verification path |
| Coffee/café/tea/bakery/breakfast/pastry/donut/dessert/boba tag | 1 | Indicates it is plausibly a beverage/food venue rather than a miscoded listing |
| `indoor_seating=yes` | 1 | Positive interior seating evidence |
| Outdoor-seat tag of `yes`, `sidewalk`, `patio`, or `terrace` | 1 | Additional seating option |

Results are sorted by score, then distance from the app map center, then name.
The score says **how well documented** a candidate is; it does not claim one
café is better than another for focused work.

## Source and license

- **OpenStreetMap**, queried through the **Overpass API**.
- OSM data is © OpenStreetMap contributors and available under the
  [Open Database License](https://www.openstreetmap.org/copyright). Keep the
  source attribution in generated data and in any published use.

OSM is used because it is open, requires no account or API key, and lets the
entire import be reproduced without copying closed-directory reviews or
ratings.

## Closed-PR audit (2026-08-13)

The repository had three closed PRs. Only [PR #3](https://github.com/anishthite/workinacafe/pull/3)
added real café records; PRs #1 and #2 added the app and renamed the brand.

PR #3’s 28 records all resolve to real, currently mapped OSM `amenity=cafe`
features near the original map center. It was a **broad proximity import**, not
a work-café quality screen:

| Audit field for the 28 PR #3 records | Count |
| --- | ---: |
| Resolves to an OSM café feature | 28 / 28 |
| Explicit positive Wi‑Fi tag | 3 / 28 |
| Complete OSM street address | 21 / 28 |
| Non-closure `opening_hours` tag | 11 / 28 |
| Explicit `indoor_seating=no` | 1 / 28 |

Conclusion: the prior records are legitimate café leads and are appropriately
marked as unverified community imports, but 25/28 lack mapped Wi‑Fi evidence,
so they should not be described as validated work cafés. The screened list in
this change replaces that broad batch with candidates that pass the gates above.

## Current research run (2026-08-13)

The search covers San Francisco proper, rather than a small radius around the
initial map center, so the expanded list represents the city instead of only
Mission/Hayes. The bounding box deliberately excludes neighboring cities.

| Parameter | Value |
| --- | --- |
| South / west / north / east | `37.7034, -122.5270, 37.8120, -122.3482` |
| OSM feature type | `node`, `way`, `relation` tagged `amenity=cafe` |
| Retrieval endpoint | `overpass-api.de`, with `overpass.kumi.systems` fallback |
| Default output limit | 100 qualified results |
| Snapshot result | 793 OSM elements → 96 evidence-qualified locations → 96 emitted |

There are 96 results rather than an arbitrary 100 because 96 is the complete
set that passed the stated gates in this snapshot. Including four weaker
locations only to reach 100 would make the data less trustworthy.

### Reproduce the exact workflow

```bash
node scripts/scrape-cafes.mjs > src/data/cafes.imported.ts
npm run lint && npx tsc --noEmit && npm run build
```

The generated output is deterministic for a particular OSM snapshot. OSM is
live data, so a later run may add, remove, or update candidates. The script
tries a second public Overpass endpoint if the primary is busy.

## Pipeline

1. Fetch every `amenity=cafe` node, way, and relation inside the San Francisco
   bounding box.
2. Drop unnamed and unmappable features, fictional demo-name collisions, and
   records that fail any required work-café evidence gate.
3. De-duplicate by normalized name + house number + street. This retains
   distinct branches at different addresses.
4. Score remaining candidates using the documentation-quality metric above.
5. Sort by score, distance to `MAP_CENTER`, and name; apply `--limit`.
6. Emit the full `IMPORTED_CAFES` TypeScript module with a stable OSM feature ID
   (`osm-{type}-{id}-{slug}`), so same-name branches cannot collide in the UI.

## Field provenance and intentional defaults

Every generated record has `submitted: true`, `confirmations: 0`, and a prompt
to add a community check. That keeps source-derived discovery data visually
distinct from actual community confirmation.

| Field | Source / handling |
| --- | --- |
| `id` | OSM element type + element ID + name slug |
| `name` | OSM `name`, verbatim |
| coordinates | OSM node coordinate or way/relation center; rounded to four decimals |
| `address` | OSM house number + street (required) |
| `distance` | Derived with Haversine distance from the map center |
| `neighborhood` | Derived from nearest curated SF neighborhood centroid; heuristic only |
| `wifi` | Explicit positive OSM `internet_access` gate → `Good` |
| `outdoor` | OSM `outdoor_seating`; `yes`, `sidewalk`, `patio`, or `terrace` → true |
| `accessible` | OSM `wheelchair=yes` only |
| `color`, `rotation` | Deterministic presentation values |
| `outlets`, `noise`, `calls`, `price` | Neutral placeholders; no quality claim is made |
| `seatTip`, `laptopPolicy` | Explicitly asks for community confirmation |
| `isOpen`, `closesAt` | Not a live-hours system; set to tentative `true` / `Hours vary` even when OSM has `opening_hours` |

## How to improve the method

- Add timestamped, first-party café website checks for current hours and laptop
  policy, storing the source URL and check date rather than treating a page as
  permanent truth.
- Add community check-ins for outlets, seating availability, noise, calls, and
  laptop policy; make those fields eligible for “confirmed” filters only after
  multiple recent independent reports.
- Use neighborhood polygons or reverse geocoding instead of nearest centroids.
- Add a parser for OSM `opening_hours` with the café’s local timezone; do not
  use raw hours to imply that a venue is open now.
- Periodically rerun the script, diff the generated output, and manually inspect
  removals, address changes, and any newly qualifying locations before release.

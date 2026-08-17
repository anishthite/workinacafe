# Community café work map — product and UI plan

> Greenfield note: the repository is currently empty, so this plan assumes a new web app rather than changes to an existing interface.

## 1. Product promise

Help someone answer one question quickly:

**“Where nearby can I comfortably work for the next 1–3 hours?”**

This should not become another generic café review site. The useful difference is structured, recent, community-confirmed information about working conditions: Wi‑Fi, outlets, noise, seating, call friendliness, laptop rules, cost, and the best area to sit.

A good north-star metric is: **search → useful café detail viewed or directions opened**. A supporting community metric is the percentage of cafés whose work details were confirmed in the last 90 days.

## 2. Recommended information architecture

### Desktop: list on the left, map on the right

Use a **360–420 px left sidebar** and let the map own the remaining canvas. This is better than a right sidebar because people naturally scan result names first and then look across to their matching pins. It also leaves map controls in the familiar right-side area.

Do not add both left and right rails. Selecting a café should change the left rail from the result list into a detail panel; Back returns to the list.

**Sticky top bar**

- Small brand mark / wordmark
- Large location-aware search: “Search city, neighborhood, or café”
- Current-location control
- Primary **Add a café** button

**Left result rail**

- Result count and “Search this area” state
- Horizontally scrollable quick filters: Open now, Great Wi‑Fi, Outlets, Quiet, Calls OK, Outdoor
- Sort: Recommended, Nearest, Recently verified
- Compact café cards showing:
  - photo, name, distance, open/closed
  - 3–4 work signals rather than a generic star score
  - “Verified 3 days ago by 4 people”
  - one useful seat tip, such as “Best outlets along the back wall”

**Map canvas**

- mapcn / MapLibre map as the main visual surface
- Custom café pins with three states: default, hover-linked, selected
- Cluster markers when zoomed out
- Selected-pin popup with name, open state, top work signals, and “View details”
- Zoom, compass, and locate controls on the right
- “Search this area” pill after the user pans, rather than automatically replacing results mid-pan

### Mobile: map plus bottom sheet

There is no sidebar on mobile.

- Search stays at the top.
- Filters sit in one horizontal chip row.
- Results and café details live in a draggable bottom sheet over the map.
- **Add café** becomes a labeled floating action button, not an icon-only mystery action.
- The sheet has three useful snap points: peek, half, and full.

## 3. Café detail content

Make the detail page factual and scannable before social.

1. **Hero:** photo, name, open state, distance, Share, Directions
2. **Workability summary:** separate scores/signals for Wi‑Fi, outlets, noise, seating, and calls
3. **Laptop policy:** allowed, restricted hours, purchase/time limit, or unknown
4. **Best seat tips:** concrete community notes such as “window bar has 6 outlets”
5. **Practical details:** price level/minimum spend, restroom, accessibility, outdoor seating, hours
6. **Recent confirmations:** timestamped “still accurate” confirmations and field-level corrections
7. **Photos:** prioritize workspace/seating photos over drink photography
8. **Community actions:** Confirm details, Suggest edit, Report closed/incorrect

Avoid one opaque “work score” at launch. Users care about different trade-offs; visible facets are more trustworthy.

## 4. Add-a-café flow

Use a focused drawer on desktop and a full-screen step flow on mobile.

### Step 1 — Find the place

Search an address/place provider first. Show likely duplicates before allowing a new entry. If the place is missing, let the contributor drop/adjust a pin.

### Step 2 — Add basics

- Café name, address, map pin, website
- Opening hours
- One workspace-oriented photo

### Step 3 — Describe working conditions

Use tap-friendly choices with **Unknown / Not sure** available. Never force fake precision.

- Wi‑Fi: unavailable / unreliable / good / great
- Outlets: none / a few / many, plus a location note
- Noise: quiet / conversational / lively / loud
- Seating: counter / table / communal / outdoor, with comfort note
- Calls: fine / brief calls only / not appropriate
- Laptop policy: welcome / restricted times / not allowed / unknown
- Cost or purchase expectation
- Accessibility and restroom
- “Where is the best spot to sit?” short note

### Step 4 — Review and publish

- Show exactly what will become public.
- Ask when the contributor last visited.
- Publish as **community-submitted** until another member confirms it.
- Return to the selected new pin with a clear success state and an invitation to share.

Autosave the draft locally. If a user closes the drawer accidentally, offer to resume.

## 5. Community trust model

Freshness matters more than raw vote count.

- Every fact carries `updatedAt`, `visitedAt`, and contributor provenance.
- Members can confirm individual facts instead of rewriting the whole listing.
- Show “confirmed by 4 people in the last 30 days,” not lifetime likes.
- Flag contradictory reports for moderator review.
- Keep edits reversible with a simple contribution history.
- Rate-limit anonymous contributions and photo uploads.
- Let café owners claim a page, but visually distinguish owner-provided facts from community observations.

Suggested listing states: `pending`, `published`, `needs_review`, `closed`.

## 6. Lean data model

- **Cafe:** identity, address, coordinates, hours, links, listing status
- **WorkProfile:** Wi‑Fi, outlets, noise, seating, call policy, laptop policy, cost, accessibility, restroom
- **SeatTip:** café, short location note, optional workspace photo, helpful count
- **Contribution:** author, café, changed fields, visited date, evidence, moderation state
- **Confirmation:** member, café/field, accurate or outdated, timestamp

Store location as a geospatial point and query by the current map bounds. Return only fields needed for pins/cards until a café is selected.

## 7. Visual direction — Excalidraw-native

Make the product feel like a **living community sketch map**, not a polished corporate directory. It should look intentionally drawn while remaining as usable as a normal map application.

- White or lightly warm paper-like canvas with navy “ink” and a restrained blue/green/amber marker palette
- Excalifont (the current Excalidraw typeface) for headings, labels, filters, and cards; keep dense metadata in a compact legible mono/sans face
- Slightly rough 1.5–2 px borders, imperfect dividers, and hand-drawn arrows instead of shadows or glass effects
- Mostly square or softly rounded cards with subtle line wobble; avoid making every object a pill
- Hachure/sketch fills only for selections, warnings, and contribution states—not every surface
- Custom hand-drawn café pins and cluster circles, with handwritten numbers and small outlet/Wi‑Fi marks
- Workspace photos can sit in taped-on or outlined frames, but should stay rectangular and easy to scan
- No glossy gradients, heavy elevation, blur, or generic dashboard chrome

The mapcn basemap should remain geographically clear. Use a muted map style, then make the **application layer** Excalidraw-like: rough pins, sketch popups, outlined controls, paper panels, and hand-drawn selection links. Do not attempt to distort road geometry or labels into illegibility.

### Interaction polish

- Hovering a card draws/emphasizes a rough selection ring around its pin; hovering a pin highlights and scrolls to its card.
- A selected card can gain a quick hachure wash rather than a conventional drop shadow.
- Selected states update immediately; avoid decorative loading delays.
- Popovers open from their trigger in about 150–200 ms with a strong ease-out.
- Buttons get subtle press feedback (`scale(0.97)`); the drawn wobble itself should not animate repeatedly.
- Animate only transform/opacity and respect `prefers-reduced-motion`.
- Keep map movement and bottom-sheet gestures interruptible.
- Use the sketch style consistently in empty, loading, error, and moderation states so it feels intentional rather than like an unfinished wireframe.

## 8. mapcn implementation notes

mapcn is a good fit because it provides composable React map components built on MapLibre GL and styled to work with Tailwind and shadcn/ui. Its documented install command is:

```bash
pnpm dlx shadcn@latest add @mapcn/map
```

Plan to use the map component plus markers, popups, controls, and clustering. Keep result-card state and selected-marker state in the same URL/query state so the map/list interaction is shareable and Back works.

Important: mapcn’s project documentation notes that its default CARTO basemap has commercial-use terms. V1 therefore uses the keyless OpenFreeMap basemap with OpenStreetMap attribution; provider capacity and terms should still be reviewed before a larger public launch.

## 9. Suggested technical foundation

Keep the first version conventional:

- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- mapcn / MapLibre GL
- Postgres with PostGIS (a managed service such as Supabase is fine)
- Object storage for resized workspace photos
- Server-side geocoding proxy with caching and provider attribution

Do not introduce a separate search service until Postgres text + geospatial search is measurably insufficient.

## 10. Delivery sequence

### Phase 1 — Discovery shell

- App frame, responsive sidebar/bottom sheet, top search
- mapcn map, sample café pins, clusters, map controls
- Linked card/pin hover and selection
- Filters, selected café detail, URL-backed map state
- Empty, loading, map-error, and no-results states

**Done when:** a visitor can search/pan/filter, select a café, understand its work conditions, and open directions on desktop or mobile.

### Phase 2 — Contributions

- Anonymous contribution flow with abuse safeguards
- Add-café flow with place deduplication and draggable pin
- Structured work-profile form, photo upload, draft restore
- Suggest-edit and confirm-details actions

**Done when:** a visitor can add a café without creating an obvious duplicate and can correct stale information without replacing the whole listing.

### Phase 3 — Trust and moderation

- Freshness labels and field-level provenance
- Review queue, reports, reversible changes
- Claimed-owner metadata separated from community observations

**Done when:** stale or conflicting information is visible, reviewable, and recoverable.

### Phase 4 — Retention and polish

- “Recently verified near you” prompts
- Better photo gallery and seat-tip ranking
- Accessibility/performance pass and real-device gesture tuning
- Analytics for search-to-detail, detail-to-directions, and contribution completion

## 11. Explicit non-goals for the first release

- No social feed, DMs, follower graph, or comments thread
- No public user accounts or saved-place lists
- No reservations or payments
- No live occupancy claims unless backed by reliable data
- No indoor floor-plan editor
- No algorithmically mysterious universal rating
- No native app before the responsive web experience proves demand

## 12. First design checkpoint

Before building the backend, prototype and test these three connected screens with realistic café data:

1. Desktop map + left results
2. Selected café detail in the left rail
3. Add-a-café step flow

The key usability test: give someone a neighborhood and ask them to find a quiet café with outlets, then add a missing café. If both tasks are obvious without explanation, the structure is ready to implement.

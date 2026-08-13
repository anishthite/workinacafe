"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Camera,
  Check,
  Clock3,
  Coffee,
  ExternalLink,
  Flag,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  PlugZap,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Trees,
  UserRound,
  Users,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AddCafeDialog } from "@/components/add-cafe-dialog";
import { CafeSketch } from "@/components/cafe-sketch";
import {
  MonetizationDialog,
  type MonetizationOffer,
} from "@/components/monetization-dialog";
import {
  Map,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";
import {
  CAFES,
  FILTERS,
  cafeMatchesFilters,
  type Cafe,
  type FilterId,
} from "@/data/cafes";

const MAP_CENTER: [number, number] = [-122.4216, 37.7708];
const MAP_STYLES = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/positron",
};

function Signal({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="signal">
      <span className="signal__icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function MarkerPin({
  cafe,
  index,
  selected,
  hovered,
}: {
  cafe: Cafe;
  index: number;
  selected: boolean;
  hovered: boolean;
}) {
  return (
    <span
      className={`sketch-pin sketch-pin--${cafe.color} ${selected ? "is-selected" : ""} ${hovered ? "is-hovered" : ""}`}
      style={{ "--pin-rotation": `${cafe.rotation}deg` } as React.CSSProperties}
    >
      {index + 1}
    </span>
  );
}

function ResultCard({
  cafe,
  index,
  active,
  saved,
  onSelect,
  onHover,
  onToggleSaved,
}: {
  cafe: Cafe;
  index: number;
  active: boolean;
  saved: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  onToggleSaved: () => void;
}) {
  return (
    <article
      className={`result-card rough-surface result-card--${cafe.color} ${active ? "is-active hachure-fill" : ""}`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <button className="result-card__main" onClick={onSelect} type="button">
        <CafeSketch cafe={cafe} compact />
        <div className="result-card__copy">
          <div className="result-card__title-row">
            <span className="result-card__number">{index + 1}</span>
            <div>
              <h3>{cafe.name}</h3>
              <p>{cafe.neighborhood} · {cafe.distance}</p>
            </div>
          </div>
          <div className="result-card__signals">
            <span><Wifi aria-hidden="true" /> {cafe.wifi}</span>
            <span><PlugZap aria-hidden="true" /> {cafe.outlets}</span>
            <span><Volume2 aria-hidden="true" /> {cafe.noise}</span>
          </div>
          <p className="result-card__tip">“{cafe.seatTip}”</p>
          <div className="freshness">
            <BadgeCheck aria-hidden="true" />
            <span>checked {cafe.freshness} by {cafe.confirmations}</span>
          </div>
        </div>
      </button>
      <button
        aria-label={saved ? `Remove ${cafe.name} from saved cafés` : `Save ${cafe.name}`}
        className={`save-button ${saved ? "is-saved" : ""}`}
        onClick={onToggleSaved}
        type="button"
      >
        <Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} />
      </button>
    </article>
  );
}

function EmptyResults({ clearFilters }: { clearFilters: () => void }) {
  return (
    <div className="empty-results">
      <span className="empty-results__doodle">?</span>
      <h3>No cafés match that sketch.</h3>
      <p>Try removing a filter or searching another neighborhood.</p>
      <button className="text-button" onClick={clearFilters} type="button">
        <X aria-hidden="true" /> Clear filters
      </button>
    </div>
  );
}

function OwnerCallout({ onClaim }: { onClaim: () => void }) {
  return (
    <section className="owner-callout rough-surface">
      <div>
        <span className="eyebrow"><BadgeCheck aria-hidden="true" /> Café owner?</span>
        <h3>Make your work details easy to trust.</h3>
        <p>Claim a verified profile. It is disclosed and never affects community ranking.</p>
      </div>
      <button className="text-button" onClick={onClaim} type="button">
        Partner with us →
      </button>
    </section>
  );
}

function CafeDetail({
  cafe,
  saved,
  onBack,
  onOpenOffer,
  onToggleSaved,
  onToast,
}: {
  cafe: Cafe;
  saved: boolean;
  onBack: () => void;
  onOpenOffer: (offer: MonetizationOffer) => void;
  onToggleSaved: () => void;
  onToast: (message: string) => void;
}) {
  const directionsUrl = `https://www.openstreetmap.org/directions?to=${cafe.latitude}%2C${cafe.longitude}`;

  return (
    <div className="detail-panel">
      <div className="detail-panel__toolbar">
        <button className="text-button" onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" /> Back to the map
        </button>
        <div>
          <button
            aria-label={saved ? "Remove from saved cafés" : "Save café"}
            className={`icon-button ${saved ? "is-saved" : ""}`}
            onClick={onToggleSaved}
            type="button"
          >
            <Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} />
          </button>
          <button
            aria-label="Share café"
            className="icon-button"
            onClick={() => onToast("Share link copied — in spirit, for this V1 ✦")}
            type="button"
          >
            <Share2 aria-hidden="true" />
          </button>
        </div>
      </div>

      <CafeSketch cafe={cafe} />

      <div className="detail-panel__title">
        {cafe.submitted && <span className="new-badge">New community spot</span>}
        <h2>{cafe.name}</h2>
        <p>
          <MapPin aria-hidden="true" /> {cafe.address} · {cafe.distance}
        </p>
        <div className={cafe.isOpen ? "open-state" : "open-state is-closed"}>
          <span /> {cafe.isOpen ? `Open · until ${cafe.closesAt}` : `Closed · ${cafe.closesAt}`}
        </div>
        {cafe.partner && (
          <div className="partner-status">
            <BadgeCheck aria-hidden="true" />
            <span>Owner-verified work details · updated {cafe.partner.detailsUpdated}</span>
          </div>
        )}
      </div>

      <div className={cafe.partner?.workdayPass ? "detail-actions detail-actions--with-pass" : "detail-actions"}>
        {cafe.partner?.workdayPass && (
          <button className="sketch-button sketch-button--pass" onClick={() => onOpenOffer("workday-pass")} type="button">
            <Coffee aria-hidden="true" /> Workday pass · {cafe.partner.workdayPass.price}
          </button>
        )}
        <a className="sketch-button sketch-button--primary hachure-fill" href={directionsUrl} rel="noreferrer" target="_blank">
          <Navigation aria-hidden="true" /> Directions
        </a>
        <button className="sketch-button" onClick={() => onToast("Details confirmed — thanks, neighbor!")} type="button">
          <Check aria-hidden="true" /> Still accurate
        </button>
      </div>

      <section className="detail-section">
        <div className="section-heading">
          <h3>Work setup</h3>
          <span>community notes</span>
        </div>
        <div className="signal-grid">
          <Signal icon={<Wifi aria-hidden="true" />} label="Wi-Fi" value={cafe.wifi} />
          <Signal icon={<PlugZap aria-hidden="true" />} label="Outlets" value={cafe.outlets} />
          <Signal icon={<Volume2 aria-hidden="true" />} label="Noise" value={cafe.noise} />
          <Signal icon={<Phone aria-hidden="true" />} label="Calls" value={cafe.calls} />
        </div>
        <blockquote className="seat-tip hachure-fill">
          <span>best seat →</span>
          “{cafe.seatTip}”
        </blockquote>
      </section>

      <section className="detail-section detail-facts">
        <h3>Good to know</h3>
        <dl>
          <div><dt><Clock3 aria-hidden="true" /> Laptop policy</dt><dd>{cafe.laptopPolicy}</dd></div>
          <div><dt><Coffee aria-hidden="true" /> Spend</dt><dd>{cafe.price}</dd></div>
          <div><dt><Trees aria-hidden="true" /> Outdoor seats</dt><dd>{cafe.outdoor ? "Yes" : "No"}</dd></div>
          <div><dt><UserRound aria-hidden="true" /> Accessible</dt><dd>{cafe.accessible ? "Yes" : "Not fully"}</dd></div>
        </dl>
      </section>

      <section className="verification-card rough-surface">
        <BadgeCheck aria-hidden="true" />
        <div>
          <h3>Freshly checked</h3>
          <p>Confirmed by {cafe.confirmations} people · last update {cafe.freshness}</p>
          <button onClick={() => onToast("Edit suggestion opened for community review.")} type="button">Suggest an edit →</button>
        </div>
      </section>

      <div className="detail-links">
        <button onClick={() => onToast("Photo uploads are queued for V1.1.")} type="button"><Camera aria-hidden="true" /> Add workspace photo</button>
        <button onClick={() => onToast("Thanks — a moderator will take a look.")} type="button"><Flag aria-hidden="true" /> Report an issue</button>
      </div>

      <section className="detail-owner-cta">
        <div>
          <span className="eyebrow"><BadgeCheck aria-hidden="true" /> Café owner?</span>
          <h3>Keep your work profile current.</h3>
          <p>Verified partners are disclosed; they never get a ranking boost.</p>
        </div>
        <button className="text-button" onClick={() => onOpenOffer("partner")} type="button">Explore partner beta →</button>
      </section>
    </div>
  );
}

export function CafeExplorer() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Set<FilterId>>(new Set(["open"]));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [communityCafes, setCommunityCafes] = useState<Cafe[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [monetizationOffer, setMonetizationOffer] = useState<MonetizationOffer | null>(null);
  const [mapMoved, setMapMoved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const allCafes = useMemo(() => [...communityCafes, ...CAFES], [communityCafes]);

  const visibleCafes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return allCafes.filter((cafe) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        cafe.name.toLocaleLowerCase().includes(normalizedQuery) ||
        cafe.neighborhood.toLocaleLowerCase().includes(normalizedQuery);
      return matchesQuery && cafeMatchesFilters(cafe, filters);
    });
  }, [allCafes, filters, query]);

  const selectedCafe = allCafes.find((cafe) => cafe.id === selectedId) ?? null;

  const toggleFilter = (filter: FilterId) => {
    setFilters((current) => {
      const next = new Set(current);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const toggleSaved = (id: string) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        setToast("Removed from your saved cafés.");
      } else {
        next.add(id);
        setToast("Saved for your next work session ✦");
      }
      return next;
    });
  };

  const publishCafe = (cafe: Cafe) => {
    setCommunityCafes((current) => [cafe, ...current]);
    setSelectedId(cafe.id);
    setAddOpen(false);
    setToast(`${cafe.name} is now on the community map!`);
  };

  return (
    <main className="app-shell">
      <header className="topbar rough-surface">
        <button aria-label="workina.cafe home" className="wordmark" onClick={() => setSelectedId(null)} type="button">
          <span className="wordmark__mark"><Coffee aria-hidden="true" /></span>
          <span>work<span>ina.cafe</span></span>
        </button>

        <label className="global-search rough-input">
          <Search aria-hidden="true" />
          <input
            aria-label="Search cafés and neighborhoods"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a café or neighborhood"
            value={query}
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery("")} type="button">
              <X aria-hidden="true" />
            </button>
          )}
          <kbd>⌘ K</kbd>
        </label>

        <nav className="topbar__actions" aria-label="Account actions">
          <button className="saved-link" onClick={() => setToast(savedIds.size ? `${savedIds.size} saved café${savedIds.size === 1 ? "" : "s"}.` : "No saved cafés yet.")} type="button">
            <Bookmark aria-hidden="true" /> <span>Saved</span>
            {savedIds.size > 0 && <b>{savedIds.size}</b>}
          </button>
          <button className="sketch-button sketch-button--primary hachure-fill" onClick={() => setAddOpen(true)} type="button">
            <Plus aria-hidden="true" /> Add a café
          </button>
          <button aria-label="Open profile" className="avatar-button" onClick={() => setToast("Profiles are coming in V1.1.")} type="button">AT</button>
        </nav>
      </header>

      <div className="explorer-layout">
        <aside className="results-panel rough-surface">
          {selectedCafe ? (
            <CafeDetail
              cafe={selectedCafe}
              onBack={() => setSelectedId(null)}
              onOpenOffer={setMonetizationOffer}
              onToast={setToast}
              onToggleSaved={() => toggleSaved(selectedCafe.id)}
              saved={savedIds.has(selectedCafe.id)}
            />
          ) : (
            <>
              <div className="results-panel__header">
                <div>
                  <span className="eyebrow"><Sparkles aria-hidden="true" /> Community checked</span>
                  <h1>Find your next desk away from home.</h1>
                  <p>{visibleCafes.length} café{visibleCafes.length === 1 ? "" : "s"} around San Francisco</p>
                </div>
                <button aria-label="Show filter options" className="icon-button filter-button" type="button">
                  <SlidersHorizontal aria-hidden="true" />
                </button>
              </div>

              <div className="filter-row" aria-label="Café filters">
                {FILTERS.map((filter) => (
                  <button
                    aria-pressed={filters.has(filter.id)}
                    className={filters.has(filter.id) ? "filter-chip is-active hachure-fill" : "filter-chip"}
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    type="button"
                  >
                    {filters.has(filter.id) && <Check aria-hidden="true" />}
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="results-sort">
                <span><MapPin aria-hidden="true" /> Near the Mission</span>
                <button type="button">Recommended ↓</button>
              </div>

              <div className="results-list">
                {visibleCafes.map((cafe, index) => (
                  <ResultCard
                    active={hoveredId === cafe.id}
                    cafe={cafe}
                    index={index}
                    key={cafe.id}
                    onHover={(hovered) => setHoveredId(hovered ? cafe.id : null)}
                    onSelect={() => setSelectedId(cafe.id)}
                    onToggleSaved={() => toggleSaved(cafe.id)}
                    saved={savedIds.has(cafe.id)}
                  />
                ))}
                {visibleCafes.length === 0 && (
                  <EmptyResults clearFilters={() => { setFilters(new Set()); setQuery(""); }} />
                )}
                {visibleCafes.length > 0 && <OwnerCallout onClaim={() => setMonetizationOffer("partner")} />}
              </div>
            </>
          )}
        </aside>

        <section aria-label="Map of community cafés" className="map-panel">
          <Map
            center={MAP_CENTER}
            className="community-map"
            maxZoom={17}
            minZoom={11}
            onViewportChange={() => setMapMoved(true)}
            styles={MAP_STYLES}
            theme="light"
            zoom={13.2}
          >
            {visibleCafes.map((cafe, index) => (
              <MapMarker
                key={cafe.id}
                latitude={cafe.latitude}
                longitude={cafe.longitude}
                onClick={() => setSelectedId(cafe.id)}
                onMouseEnter={() => setHoveredId(cafe.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <MarkerContent>
                  <MarkerPin
                    cafe={cafe}
                    hovered={hoveredId === cafe.id}
                    index={index}
                    selected={selectedId === cafe.id}
                  />
                </MarkerContent>
                <MarkerTooltip className="marker-tooltip rough-surface">
                  {cafe.name} · {cafe.wifi} Wi-Fi
                </MarkerTooltip>
              </MapMarker>
            ))}

            {selectedCafe && visibleCafes.some((cafe) => cafe.id === selectedCafe.id) && (
              <MapPopup
                anchor="bottom"
                className="cafe-popup rough-surface"
                closeButton
                latitude={selectedCafe.latitude}
                longitude={selectedCafe.longitude}
                onClose={() => setSelectedId(null)}
                offset={38}
              >
                <span className="eyebrow">{selectedCafe.isOpen ? "open now" : "closed"}</span>
                <strong>{selectedCafe.name}</strong>
                <p>{selectedCafe.wifi} Wi-Fi · {selectedCafe.outlets} outlets</p>
                <button onClick={() => setSelectedId(selectedCafe.id)} type="button">View details →</button>
              </MapPopup>
            )}

            <MapControls
              className="sketch-map-controls"
              onLocate={() => setToast("Map centered on your location.")}
              showCompass
              showLocate
              showZoom
            />
          </Map>

          <div className="map-caption rough-surface">
            <Users aria-hidden="true" />
            <span><strong>Community map</strong> · conditions change, check the date</span>
          </div>

          {mapMoved && (
            <button className="search-area-button rough-surface" onClick={() => { setMapMoved(false); setToast("Showing the freshest notes in this area."); }} type="button">
              <Search aria-hidden="true" /> Search this area
            </button>
          )}

          <button className="mobile-add-button sketch-button sketch-button--primary hachure-fill" onClick={() => setAddOpen(true)} type="button">
            <Plus aria-hidden="true" /> Add
          </button>

          <button className="mobile-locate-button icon-button" onClick={() => setToast("Use the locate control on the map to center your position.")} type="button">
            <LocateFixed aria-hidden="true" />
            <span className="sr-only">Find my location</span>
          </button>
        </section>
      </div>

      <AddCafeDialog open={addOpen} onClose={() => setAddOpen(false)} onPublish={publishCafe} />
      <MonetizationDialog
        cafe={selectedCafe ?? CAFES[0]}
        key={monetizationOffer ?? "closed"}
        offer={monetizationOffer}
        onClose={() => setMonetizationOffer(null)}
        onComplete={(message) => {
          setMonetizationOffer(null);
          setToast(message);
        }}
      />

      {toast && (
        <div aria-live="polite" className="toast rough-surface" role="status">
          <Check aria-hidden="true" /> {toast}
        </div>
      )}

      <a className="source-link" href="https://mapcn.dev" rel="noreferrer" target="_blank">
        Map built with mapcn <ExternalLink aria-hidden="true" />
      </a>
    </main>
  );
}

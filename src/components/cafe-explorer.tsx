"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  Clock3,
  Coffee,
  ExternalLink,
  Flag,
  Info,
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

type ConfirmationFieldId = "wifi" | "outlets" | "noise" | "laptopPolicy";

type SessionConfirmation = {
  fields: ConfirmationFieldId[];
};

const CONFIRMATION_LABELS: Record<ConfirmationFieldId, string> = {
  wifi: "Wi-Fi",
  outlets: "Outlets",
  noise: "Quietness",
  laptopPolicy: "Laptop policy",
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
  onSelect,
  onHover,
}: {
  cafe: Cafe;
  index: number;
  active: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
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
  confirmation,
  onBack,
  onConfirm,
  onOpenOffer,
  onToast,
}: {
  cafe: Cafe;
  confirmation?: SessionConfirmation;
  onBack: () => void;
  onConfirm: (fields: ConfirmationFieldId[]) => void;
  onOpenOffer: (offer: MonetizationOffer) => void;
  onToast: (message: string) => void;
}) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<ConfirmationFieldId>>(
    () => new Set(confirmation?.fields ?? []),
  );
  const directionsUrl = `https://www.openstreetmap.org/directions?to=${cafe.latitude}%2C${cafe.longitude}`;
  const confirmationPanelId = `confirmation-panel-${cafe.id}`;
  const confirmationFields: { id: ConfirmationFieldId; value: string }[] = [
    { id: "wifi", value: cafe.wifi },
    { id: "outlets", value: cafe.outlets },
    { id: "noise", value: cafe.noise },
    { id: "laptopPolicy", value: cafe.laptopPolicy },
  ];
  const confirmationCount = cafe.confirmations + (confirmation ? 1 : 0);

  const toggleConfirmationField = (field: ConfirmationFieldId) => {
    setSelectedFields((current) => {
      const next = new Set(current);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const submitConfirmation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = confirmationFields
      .map(({ id }) => id)
      .filter((field) => selectedFields.has(field));
    if (fields.length === 0) return;
    onConfirm(fields);
  };

  return (
    <div className="detail-panel">
      <div className="detail-panel__toolbar">
        <button className="text-button" onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" /> Back to the map
        </button>
        <div>
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
        <button
          aria-controls={confirmationPanelId}
          aria-expanded={confirmationOpen}
          className={confirmationOpen ? "sketch-button confirmation-trigger is-active" : "sketch-button confirmation-trigger"}
          onClick={() => setConfirmationOpen((open) => !open)}
          type="button"
        >
          <Check aria-hidden="true" /> {confirmation ? "Checked this visit" : "Still accurate"}
        </button>
      </div>

      {confirmationOpen && (
        <section
          aria-labelledby={`${confirmationPanelId}-title`}
          className="confirmation-panel rough-surface"
          id={confirmationPanelId}
        >
          <div className="confirmation-panel__heading">
            <span aria-hidden="true" className="confirmation-panel__doodle">
              <Check />
            </span>
            <div>
              <span className="eyebrow">Community check-in</span>
              <h3 id={`${confirmationPanelId}-title`}>What did you verify?</h3>
              <p>Check only the facts you saw during this visit.</p>
            </div>
          </div>

          <form onSubmit={submitConfirmation}>
            <fieldset>
              <legend className="sr-only">Facts you verified at {cafe.name}</legend>
              <div className="confirmation-facts">
                {confirmationFields.map((field) => {
                  const checked = selectedFields.has(field.id);
                  return (
                    <label
                      className={checked ? "confirmation-fact is-selected" : "confirmation-fact"}
                      key={field.id}
                    >
                      <input
                        checked={checked}
                        onChange={() => toggleConfirmationField(field.id)}
                        type="checkbox"
                      />
                      <span aria-hidden="true" className="confirmation-fact__check">
                        <Check />
                      </span>
                      <span className="confirmation-fact__copy">
                        <strong>{CONFIRMATION_LABELS[field.id]}</strong>
                        <span>{field.value}</span>
                      </span>
                      <small>community fact</small>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="confirmation-panel__submit-row">
              <p>{selectedFields.size === 0 ? "Choose at least one fact." : `${selectedFields.size} fact${selectedFields.size === 1 ? "" : "s"} ready to confirm.`}</p>
              <button
                className="sketch-button sketch-button--primary hachure-fill"
                disabled={selectedFields.size === 0}
                type="submit"
              >
                <Check aria-hidden="true" /> {confirmation ? "Update my check" : "Confirm selected"}
              </button>
            </div>
          </form>

          {confirmation && (
            <div aria-live="polite" className="confirmation-panel__feedback" role="status">
              <BadgeCheck aria-hidden="true" />
              <p>
                <strong>Thanks — {confirmation.fields.length} fact{confirmation.fields.length === 1 ? " is" : "s are"} fresh as of just now.</strong>
                {" "}The café now shows {confirmationCount} community confirmation{confirmationCount === 1 ? "" : "s"} in this session.
              </p>
            </div>
          )}

          <div className="confirmation-panel__disclosure">
            <Info aria-hidden="true" />
            <p>
              <strong>Just this browser session.</strong> Nothing is sent or made public, and refreshing clears your check. Community checks update freshness only—not ranking. Owner-provided facts remain separate and labeled.
            </p>
          </div>
        </section>
      )}

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
          <h3>{confirmation ? "Checked by you just now" : "Freshly checked"}</h3>
          <p>
            {confirmation ? `${confirmationCount} community confirmations` : `Confirmed by ${confirmationCount} people`} · last community check {confirmation ? "just now" : cafe.freshness}
          </p>
          {confirmation && (
            <p className="verification-card__fields">
              You verified {confirmation.fields.map((field) => CONFIRMATION_LABELS[field]).join(", ")}.
            </p>
          )}
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
  const [communityCafes, setCommunityCafes] = useState<Cafe[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [monetizationOffer, setMonetizationOffer] = useState<MonetizationOffer | null>(null);
  const [sessionConfirmations, setSessionConfirmations] = useState<Record<string, SessionConfirmation>>({});
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

        <nav className="topbar__actions" aria-label="Café actions">
          <button className="sketch-button sketch-button--primary hachure-fill" onClick={() => setAddOpen(true)} type="button">
            <Plus aria-hidden="true" /> Add a café
          </button>
        </nav>
      </header>

      <div className="explorer-layout">
        <aside className="results-panel rough-surface">
          {selectedCafe ? (
            <CafeDetail
              cafe={selectedCafe}
              confirmation={sessionConfirmations[selectedCafe.id]}
              key={selectedCafe.id}
              onBack={() => setSelectedId(null)}
              onConfirm={(fields) => {
                setSessionConfirmations((current) => ({
                  ...current,
                  [selectedCafe.id]: { fields },
                }));
              }}
              onOpenOffer={setMonetizationOffer}
              onToast={setToast}
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

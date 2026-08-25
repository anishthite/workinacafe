"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coffee,
  History,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { Cafe } from "@/data/cafes";

type AddCafeDialogProps = {
  onClose: () => void;
  onPublish: (cafe: Cafe) => void;
};

type Draft = {
  name: string;
  address: string;
  neighborhood: string;
  wifi: Cafe["wifi"];
  outlets: Cafe["outlets"];
  noise: Cafe["noise"];
  calls: Cafe["calls"];
  seatTip: string;
};

const INITIAL_DRAFT: Draft = {
  name: "",
  address: "",
  neighborhood: "The Mission",
  wifi: "Great",
  outlets: "Many",
  noise: "Conversational",
  calls: "Brief calls",
  seatTip: "",
};

const STEPS = ["Find it", "Pin + basics", "Work setup", "Review"];
const DRAFT_STORAGE_KEY = "workinacafe:add-cafe-draft";

type StoredDraft = {
  version: 1;
  step: number;
  draft: Draft;
};

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.address === "string" &&
    typeof candidate.neighborhood === "string" &&
    isOneOf(candidate.wifi, ["Okay", "Good", "Great"] as const) &&
    isOneOf(candidate.outlets, ["None", "A few", "Many"] as const) &&
    isOneOf(candidate.noise, ["Quiet", "Conversational", "Lively"] as const) &&
    isOneOf(candidate.calls, ["Not ideal", "Brief calls", "Calls welcome"] as const) &&
    typeof candidate.seatTip === "string"
  );
}

function readStoredDraft(): StoredDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) return null;

    const candidate = JSON.parse(saved) as Partial<StoredDraft>;
    if (
      candidate.version !== 1 ||
      !Number.isInteger(candidate.step) ||
      typeof candidate.step !== "number" ||
      candidate.step < 0 ||
      candidate.step >= STEPS.length ||
      !isDraft(candidate.draft)
    ) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }

    return candidate as StoredDraft;
  } catch {
    return null;
  }
}

function removeStoredDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // The form remains usable when storage is blocked or unavailable.
  }
}

function persistDraft(draft: Draft, step: number) {
  try {
    if (isMeaningfulDraft(draft)) {
      const storedDraft: StoredDraft = { version: 1, step, draft };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(storedDraft));
    } else {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  } catch {
    // Browser privacy settings and quota failures should not block the form.
  }
}

function isMeaningfulDraft(draft: Draft) {
  return (Object.keys(INITIAL_DRAFT) as (keyof Draft)[]).some(
    (key) => draft[key] !== INITIAL_DRAFT[key],
  );
}

function validatedStep(step: number, draft: Draft) {
  if (draft.name.trim().length <= 1) return 0;
  if (step > 1 && draft.address.trim().length <= 3) return 1;
  return step;
}

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="choice-group">
      <legend>{label}</legend>
      <div className="choice-group__options">
        {options.map((option) => (
          <button
            className={value === option ? "choice-chip is-active" : "choice-chip"}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {value === option && <Check aria-hidden="true" />}
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function AddCafeDialog({ onClose, onPublish }: AddCafeDialogProps) {
  const [savedDraft] = useState(readStoredDraft);
  const [step, setStep] = useState(() =>
    savedDraft ? validatedStep(savedDraft.step, savedDraft.draft) : 0,
  );
  const [draft, setDraft] = useState<Draft>(() => savedDraft?.draft ?? INITIAL_DRAFT);
  const [restoredDraft, setRestoredDraft] = useState(() => Boolean(savedDraft));

  const close = useCallback(() => {
    persistDraft(draft, step);
    onClose();
  }, [draft, onClose, step]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    persistDraft(draft, step);
  }, [draft, step]);

  const canContinue =
    (step === 0 && draft.name.trim().length > 1) ||
    (step === 1 && draft.address.trim().length > 3) ||
    step > 1;

  const publish = () => {
    const cafe: Cafe = {
      id: `community-${Date.now()}`,
      name: draft.name.trim(),
      neighborhood: draft.neighborhood.trim() || "Community pick",
      address: draft.address.trim(),
      distance: "new",
      longitude: -122.4155,
      latitude: 37.7689,
      isOpen: true,
      closesAt: "hours unconfirmed",
      wifi: draft.wifi,
      outlets: draft.outlets,
      noise: draft.noise,
      calls: draft.calls,
      outdoor: false,
      freshness: "just now",
      confirmations: 1,
      seatTip: draft.seatTip.trim() || "Seat tip still needed.",
      laptopPolicy: "Community confirmation needed",
      price: "$$",
      accessible: true,
      color: "green",
      rotation: -1,
      submitted: true,
    };

    onPublish(cafe);
    removeStoredDraft();
    setDraft(INITIAL_DRAFT);
    setStep(0);
    setRestoredDraft(false);
  };

  const discardDraft = () => {
    removeStoredDraft();
    setDraft(INITIAL_DRAFT);
    setStep(0);
    setRestoredDraft(false);
  };

  return (
    <div className="dialog-backdrop" onMouseDown={close}>
      <section
        aria-labelledby="add-cafe-title"
        aria-modal="true"
        className="add-dialog rough-surface"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="add-dialog__header">
          <div>
            <span className="eyebrow">
              <Sparkles aria-hidden="true" /> Community contribution
            </span>
            <h2 id="add-cafe-title">Add a café worth working from</h2>
          </div>
          <button className="icon-button" onClick={close} type="button">
            <X aria-hidden="true" />
            <span className="sr-only">Close add café dialog</span>
          </button>
        </header>

        <ol aria-label="Add café progress" className="stepper">
          {STEPS.map((label, index) => (
            <li className={index <= step ? "is-active" : ""} key={label}>
              <span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span>
              <small>{label}</small>
            </li>
          ))}
        </ol>

        <div className="add-dialog__content">
          {restoredDraft && (
            <div aria-live="polite" className="draft-recovery" role="status">
              <History aria-hidden="true" />
              <div>
                <strong>Saved draft restored</strong>
                <span>Your unfinished café was saved only in this browser.</span>
              </div>
              <button className="text-button" onClick={discardDraft} type="button">
                Discard draft
              </button>
            </div>
          )}
          {step === 0 && (
            <div className="dialog-step">
              <div className="dialog-step__intro">
                <Search aria-hidden="true" />
                <div>
                  <h3>First, find the place</h3>
                  <p>We check the community map before making a duplicate.</p>
                </div>
              </div>
              <label className="field-label" htmlFor="cafe-name">
                Café name
              </label>
              <div className="dialog-search rough-input">
                <Search aria-hidden="true" />
                <input
                  autoFocus
                  id="cafe-name"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Try “Corner Coffee”"
                  value={draft.name}
                />
              </div>
              {draft.name.trim().length > 1 && (
                <div className="duplicate-note">
                  <Coffee aria-hidden="true" />
                  <div>
                    <strong>No exact match nearby.</strong>
                    <span>You can add this as a new community spot.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="dialog-step">
              <div className="dialog-step__intro">
                <MapPin aria-hidden="true" />
                <div>
                  <h3>Put it on the map</h3>
                  <p>Enough detail for someone to find the right front door.</p>
                </div>
              </div>
              <div className="field-grid">
                <label className="field-label">
                  Street address
                  <input
                    className="rough-input"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder="123 Valencia St"
                    value={draft.address}
                  />
                </label>
                <label className="field-label">
                  Neighborhood
                  <input
                    className="rough-input"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        neighborhood: event.target.value,
                      }))
                    }
                    value={draft.neighborhood}
                  />
                </label>
              </div>
              <div className="pin-preview" aria-label="Map pin preview">
                <span className="pin-preview__road pin-preview__road--one" />
                <span className="pin-preview__road pin-preview__road--two" />
                <span className="sketch-pin sketch-pin--green is-selected">+</span>
                <small>Pin preview · The Mission</small>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="dialog-step">
              <div className="dialog-step__intro">
                <Coffee aria-hidden="true" />
                <div>
                  <h3>What is it actually like to work here?</h3>
                  <p>Honest estimates are better than fake precision.</p>
                </div>
              </div>
              <div className="choice-grid">
                <ChoiceGroup
                  label="Wi-Fi"
                  onChange={(wifi) =>
                    setDraft((current) => ({ ...current, wifi }))
                  }
                  options={["Okay", "Good", "Great"]}
                  value={draft.wifi}
                />
                <ChoiceGroup
                  label="Outlets"
                  onChange={(outlets) =>
                    setDraft((current) => ({ ...current, outlets }))
                  }
                  options={["None", "A few", "Many"]}
                  value={draft.outlets}
                />
                <ChoiceGroup
                  label="Noise"
                  onChange={(noise) =>
                    setDraft((current) => ({ ...current, noise }))
                  }
                  options={["Quiet", "Conversational", "Lively"]}
                  value={draft.noise}
                />
                <ChoiceGroup
                  label="Calls"
                  onChange={(calls) =>
                    setDraft((current) => ({ ...current, calls }))
                  }
                  options={["Not ideal", "Brief calls", "Calls welcome"]}
                  value={draft.calls}
                />
              </div>
              <label className="field-label">
                Best spot to sit <span>optional</span>
                <textarea
                  className="rough-input"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      seatTip: event.target.value,
                    }))
                  }
                  placeholder="e.g. the back wall has outlets and stays quiet"
                  rows={2}
                  value={draft.seatTip}
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="dialog-step">
              <div className="dialog-step__intro">
                <Check aria-hidden="true" />
                <div>
                  <h3>Ready for a community check</h3>
                  <p>This appears as newly submitted until someone confirms it.</p>
                </div>
              </div>
              <div className="review-sheet hachure-fill">
                <div>
                  <span className="eyebrow">New café</span>
                  <h3>{draft.name}</h3>
                  <p>{draft.address}</p>
                </div>
                <dl>
                  <div>
                    <dt>Wi-Fi</dt>
                    <dd>{draft.wifi}</dd>
                  </div>
                  <div>
                    <dt>Outlets</dt>
                    <dd>{draft.outlets}</dd>
                  </div>
                  <div>
                    <dt>Noise</dt>
                    <dd>{draft.noise}</dd>
                  </div>
                  <div>
                    <dt>Calls</dt>
                    <dd>{draft.calls}</dd>
                  </div>
                </dl>
                <p className="review-sheet__tip">
                  “{draft.seatTip || "Seat tip still needed."}”
                </p>
              </div>
              <p className="dialog-footnote">
                V1 keeps submissions in this browser. Persistent publishing and
                moderator review are the next release.
              </p>
            </div>
          )}
        </div>

        <footer className="add-dialog__footer">
          <button
            className="text-button"
            onClick={() => (step === 0 ? close() : setStep(step - 1))}
            type="button"
          >
            <ArrowLeft aria-hidden="true" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < 3 ? (
            <button
              className="sketch-button sketch-button--primary"
              disabled={!canContinue}
              onClick={() => setStep(step + 1)}
              type="button"
            >
              Continue <ArrowRight aria-hidden="true" />
            </button>
          ) : (
            <button
              className="sketch-button sketch-button--primary hachure-fill"
              onClick={publish}
              type="button"
            >
              Publish café <Check aria-hidden="true" />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

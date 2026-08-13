"use client";

import { BadgeCheck, CalendarCheck, Check, Coffee, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Cafe } from "@/data/cafes";

export type MonetizationOffer = "partner" | "workday-pass";

type MonetizationDialogProps = {
  cafe?: Cafe;
  offer: MonetizationOffer | null;
  onClose: () => void;
  onComplete: (message: string) => void;
};

export function MonetizationDialog({
  cafe,
  offer,
  onClose,
  onComplete,
}: MonetizationDialogProps) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!offer) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [offer, onClose]);

  if (!offer) return null;

  const pass = cafe?.partner?.workdayPass;
  const isPartnerOffer = offer === "partner";
  const title = isPartnerOffer
    ? "Turn café details into a trusted work profile"
    : `Try a workday at ${cafe?.name ?? "this café"}`;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onComplete(
      isPartnerOffer
        ? "You’re on the café partner beta list. We’ll follow up before any billing."
        : "Thanks — you’re on the workday-pass pilot list. No reservation was made.",
    );
  };

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="monetization-dialog-title"
        aria-modal="true"
        className="conversion-dialog rough-surface"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="conversion-dialog__header">
          <span className="eyebrow">
            {isPartnerOffer ? <BadgeCheck aria-hidden="true" /> : <CalendarCheck aria-hidden="true" />}
            {isPartnerOffer ? "Café partner beta" : "Workday pass pilot"}
          </span>
          <button aria-label="Close" className="icon-button" onClick={onClose} type="button">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="conversion-dialog__content">
          <h2 id="monetization-dialog-title">{title}</h2>
          {isPartnerOffer ? (
            <>
              <p>
                Keep your laptop policy, hours, availability, and workday offers current for
                people deciding where to work.
              </p>
              <div className="offer-card offer-card--partner">
                <BadgeCheck aria-hidden="true" />
                <div>
                  <strong>Verified work profile</strong>
                  <span>Owner-updated details, perks, and a clear community disclosure.</span>
                </div>
                <b>from $29/mo</b>
              </div>
              <ul className="offer-list">
                <li><Check aria-hidden="true" /> Update work-specific details anytime</li>
                <li><Check aria-hidden="true" /> Add a workday pass or a café-funded perk</li>
                <li><Check aria-hidden="true" /> See profile views and directions taps</li>
              </ul>
              <p className="trust-note">
                Partner status is always disclosed and never changes community recommendations.
              </p>
            </>
          ) : (
            <>
              <p>Reserve a reliable desk-and-coffee window when a normal café visit feels too uncertain.</p>
              <div className="offer-card offer-card--pass">
                <Coffee aria-hidden="true" />
                <div>
                  <strong>{pass?.price ?? "$12"} workday pass</strong>
                  <span>{pass?.includes ?? "Coffee and a reliable place to work"}</span>
                </div>
                <b>{pass?.availability ?? "Limited spots"}</b>
              </div>
              <dl className="pass-facts">
                <div><dt>When</dt><dd>{pass?.hours ?? "Hours to be confirmed"}</dd></div>
                <div><dt>Why it matters</dt><dd>A clear arrival promise, not a higher map rank.</dd></div>
              </dl>
              <p className="trust-note">
                This is a demand test only: joining the pilot will not charge or reserve you.
              </p>
            </>
          )}
        </div>

        <form className="conversion-dialog__footer" onSubmit={submit}>
          <label className="field-label" htmlFor="offer-email">
            Email for the pilot
            <input
              className="rough-input"
              id="offer-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <button className="sketch-button sketch-button--primary hachure-fill" type="submit">
            <Sparkles aria-hidden="true" />
            {isPartnerOffer ? "Join partner beta" : "I’d book this"}
          </button>
        </form>
      </section>
    </div>
  );
}

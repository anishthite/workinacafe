# Monetization strategy — workina.cafe

## Recommendation

Start with a **verified café partner profile** at a founding price of **$29/month per location**. It is the best first revenue experiment because it sells to the party that gets direct operational value—café owners—while preserving free, useful discovery for the people who keep the map accurate.

The implemented prototype makes this deliberately clear:

- A small “Café owner?” callout in the results panel opens a partner-beta interest form.
- Every café detail page has an owner path. A participating venue displays “Owner-verified work details” and its last-update date.
- A partner’s possible **workday pass** is a separate, amber action. It does not replace Directions, and the dialog explicitly says it does not affect ranking.
- Both buttons are demand tests: they collect pilot interest but do not take payment, reserve space, or pretend to perform a transaction.

This should be the first thing shipped to real users. Launch in one dense neighborhood, manually onboard 5–10 cafés, and validate owners before building billing, dashboards, availability, or booking infrastructure.

## The product principle

Keep **community discovery and ranking free**. Café data becomes valuable only when people continue to contribute fresh, candid notes about Wi-Fi, outlets, noise, laptop policies, and availability. Selling position in those results would damage the trust and contribution flywheel.

Revenue must pay for an adjacent, separately disclosed benefit:

- Owners pay to maintain a verified operational profile and optionally offer a workday product.
- Workers may later pay for a real coordination benefit, such as a local work club or saved-workflow tools—not access to basic café facts.
- Sponsors may support a neighborhood guide only when the sponsorship is unmistakably labeled and isolated from recommendations.

## What comparable products suggest

| Comparable | Observed model | What it means for workina.cafe |
| --- | --- | --- |
| [Nomad List / Pieter Levels](https://levels.io/startups) | The free city-data product is paired with paid member/community features and sponsorships. Levels describes the data as free, says memberships were the revenue source, and recommends testing demand before building the paid feature. | Preserve open café discovery. A paid layer needs to add a different kind of value—connection or coordination—not hide the map. |
| [Nomad List founder notes](https://levels.io/nomad-list-founder/) | The paid membership expanded beyond chat into profiles, trips, and member features. | Do not launch a generic “Pro map.” Consider a member layer only after workina has enough local activity to make introductions, work sessions, or trusted updates meaningfully valuable. |
| [Hoodmaps’ crowdsource lesson](https://levels.io/hoodmaps/) | The product relies on user-generated map input, voting, and anti-spam mechanics. In a later conversation, Levels notes that making a map paywalled can shrink the contributor base and weaken accuracy. | Treat community reporting and verification as a non-negotiable public good. Give contributors recognition and utility rather than a paywall. |
| [Letswork credits](https://www.letswork.io/credits) and a [café day-pass listing](https://www.letswork.io/venues/united-arab-emirates/dubai/caf%C3%A9-rider/cowork) | Letswork sells flexible access/credits for cafés, hotels, and coworking; a listed café offers day passes from AED 15 with a perk. | There is evidence for paid, café-based work access when the venue makes a concrete promise. It is an operations and supply business, so test one standardized pass before attempting a marketplace. |

Pieter Levels also reports that broad affiliate and generic display-ad revenue were weak for his products, while direct sponsorship and paid, distinct features were stronger in his experience ([notes](https://levels.io/bootstrapping)). That is directional founder evidence, not a guarantee, but it argues against starting with banner ads or undifferentiated affiliate links.

## Monetization options, ranked

| Rank | Scheme | Buyer | Why it can work | Main risk | Decision |
| ---: | --- | --- | --- | --- | --- |
| 1 | Verified café partner profile | Café owner | Clear benefit: accurate laptop policy/hours, a disclosed owner channel, optional offers, basic local intent analytics. No need to restrict the public map. | Owners may not value the profile without local traffic. | Prototype now; sell manually. |
| 2 | Workday pass / café-funded perk | Worker, with venue revenue share | Converts uncertainty (“will I get a seat and coffee?”) into a defined product. Captures high intent at the venue page. | Requires a reliable seat promise, cancellation/support, tax/refund handling, and supply operations. | Prototype as an interest test only; activate after partner demand is proven. |
| 3 | Local work club | Worker | Can mirror Nomad List’s paid-community model with co-working sessions, introductions, and member-led freshness checks. | Empty community makes a paid club feel hollow; gating data harms the map. | Run free events first; do not build checkout yet. |
| 4 | Clearly labeled neighborhood sponsor | A relevant local/remote-work brand | Simple sales motion once traffic is meaningful; can subsidize free map access. | A sponsored café placement is easily confused with a recommendation. | Consider only with fixed placements and a no-ranking policy. |
| 5 | Team benefit / local-work budget | Employers | Could aggregate passes and coordinate occasional team workdays. | Enterprise sales and invoicing are a major product/company shift. | Revisit only after a pass has repeat consumer use. |
| 6 | Affiliate links or generic ads | Advertisers | Low implementation cost. | Weak economics, visual clutter, and misaligned incentives; not a differentiator. | Do not pursue initially. |

## The two prototypes

### 1. Verified café partner profile — primary test

**Offer**

- Founding beta: $29/month/location; month-to-month; no ranking boost.
- Owner can update work-specific facts, publish a policy/perk, and see profile views plus directions taps.
- Public disclosure: “Owner-verified work details” and a visible update timestamp.

**Why $29**

It is low enough to make a manual beta conversation easy, but high enough to distinguish paid intent from a free-directory claim. It should be treated as a hypothesis, not a pricing decision. The beta form intentionally has no checkout; a short owner interview comes first.

**Success bar (first 30 days)**

- Speak to 20 qualified café owners in one neighborhood.
- At least 8 request the beta and at least 5 explicitly agree to pay $29/month after seeing the offer.
- At least 80% of those partners update a work detail within 30 days.
- Fewer than 5% of worker feedback items claim that partner status changed the recommendation or reduced trust.

If owners want accurate profiles but will not pay, test a café-funded worker perk before lowering price. If workers distrust the badge, keep owner fields visibly separate from community fields or stop the model.

### 2. Workday pass — secondary test

**Offer**

- One venue, two quiet weekday windows, $12 pilot price.
- Promise must be specific: e.g. “9 AM–1 PM, filter coffee + a reserved desk, six spots.”
- The venue page carries the offer; search/result ordering stays untouched.

**Success bar (before integrating payments)**

- At least 25% of unique views of the partner café’s detail page select “I’d book this,” with at least 20 unique high-intent sign-ups.
- At least 60% of sign-ups confirm a proposed date/time in a manual follow-up.
- The café can honour the promise for four weekly pilots without seating conflicts or negative community feedback.

If this clears, choose either a 10–15% booking fee paid by the café or a modest worker service fee—never both in the first pilot. Keep the unit economics visible: payment processing, refunds, no-shows, support, and any perk cost must be included before setting a take rate.

## Experiment instrumentation to add with persistence

This prototype uses in-session forms only because the application currently has no authentication, backend, or payment system. Before a public test, record these events with consent and a clear privacy notice:

| Event | Properties | Why |
| --- | --- | --- |
| `partner_cta_opened` | surface, neighborhood, selected_cafe_id | Identifies where owners discover the offer. |
| `partner_beta_submitted` | surface, email domain, selected_cafe_id | Measures owner demand; follow up manually. |
| `workday_pass_opened` | cafe_id, price, pass_hours | Captures qualified worker interest. |
| `workday_pass_interest_submitted` | cafe_id, price, pass_hours | Measures conversion from venue-page intent. |
| `community_detail_confirmed` | cafe_id, partner_status | Watches whether partner venues still receive community verification. |
| `trust_feedback_submitted` | cafe_id, partner_status, sentiment | Guardrail against pay-to-play perception. |

Avoid putting email addresses in client analytics. Send them to a minimal server endpoint/CRM with explicit consent and only use analytics for the non-identifying conversion event.

## Rollout plan

1. **Week 1 — supply interviews.** Use the partner-beta screen in 20 owner conversations. Learn whether the desired outcome is profile accuracy, a quieter-hours offer, more coffee revenue, or something else. Do not collect payment yet.
2. **Week 2 — pilot five profiles.** Verify the owner relationship manually, publish an update timestamp, and ask a small sample of workers whether the disclosure is clear.
3. **Weeks 3–4 — one workday-pass pilot.** Run it only with the most engaged venue and one fully specific promise. Manually confirm each attendee.
4. **Decision.** Build partner self-serve billing only if five owners commit to paid renewal. Build booking only if the pass hits its high-intent and fulfilment bars. Otherwise iterate the offer, not the map’s ranking.

## Explicit non-goals for this release

- No paid ranking, “featured” search results, or hidden sponsor influence.
- No consumer paywall for café facts, filtering, or community contribution.
- No checkout, booking, calendar reservation, payment collection, or claim verification in this static prototype.
- No advertising network or affiliate implementation.

These boundaries are intentional: they preserve the core trust loop while validating whether there is a business adjacent to it.

"use client";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Compass,
  MapPin,
  Navigation,
  Phone,
  PlugZap,
  Plus,
  Route,
  Search,
  Sparkles,
  Trees,
  Users,
  Volume2,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CafeSketch } from "@/components/cafe-sketch";
import { CAFES, type Cafe } from "@/data/cafes";

type DirectionId = "match" | "now" | "compare" | "guide" | "session";

type Direction = {
  id: DirectionId;
  number: string;
  name: string;
  shortName: string;
  premise: string;
  bestFor: string;
};

const DIRECTIONS: Direction[] = [
  {
    id: "match",
    number: "01",
    name: "Focus Finder",
    shortName: "Match",
    premise: "A quick needs-first match that recommends one confident answer.",
    bestFor: "Decisive solo work",
  },
  {
    id: "now",
    number: "02",
    name: "Right Now",
    shortName: "Now",
    premise: "A live-feeling dashboard for the next 30 minutes, not endless research.",
    bestFor: "Fast nearby choices",
  },
  {
    id: "compare",
    number: "03",
    name: "The Shortlist",
    shortName: "Compare",
    premise: "A calm head-to-head decision table for people weighing trade-offs.",
    bestFor: "Deliberate planning",
  },
  {
    id: "guide",
    number: "04",
    name: "Neighborhood Notes",
    shortName: "Guide",
    premise: "An editorial field guide that makes each neighborhood feel discoverable.",
    bestFor: "Exploring a new area",
  },
  {
    id: "session",
    number: "05",
    name: "Workday Planner",
    shortName: "Plan",
    premise: "A lightweight workday planner that turns a café decision into a simple ritual.",
    bestFor: "Repeat weekly routines",
  },
];

const FEATURED_CAFES = CAFES.slice(0, 4);
const byId = (id: string) => CAFES.find((cafe) => cafe.id === id) ?? CAFES[0];

function WorkSignals({ cafe, compact = false }: { cafe: Cafe; compact?: boolean }) {
  return (
    <div className={`prototype-signals ${compact ? "prototype-signals--compact" : ""}`}>
      <span><Wifi aria-hidden="true" /> {cafe.wifi}</span>
      <span><PlugZap aria-hidden="true" /> {cafe.outlets}</span>
      <span><Volume2 aria-hidden="true" /> {cafe.noise}</span>
    </div>
  );
}

function CafeMiniCard({
  cafe,
  active = false,
  onClick,
}: {
  cafe: Cafe;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`prototype-cafe-card ${active ? "is-active" : ""}`} onClick={onClick} type="button">
      <CafeSketch cafe={cafe} compact />
      <span className="prototype-cafe-card__copy">
        <strong>{cafe.name}</strong>
        <small>{cafe.neighborhood} · {cafe.distance}</small>
        <WorkSignals cafe={cafe} compact />
      </span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

function FocusFinder() {
  const [goal, setGoal] = useState("Deep focus");
  const [selectedId, setSelectedId] = useState("juniper");
  const cafe = byId(selectedId);
  const goals = ["Deep focus", "A few calls", "Meet someone"];
  const matchingCafe = goal === "A few calls" ? byId("good-day") : goal === "Meet someone" ? byId("field-day") : cafe;

  return (
    <section className="direction-screen direction-screen--match">
      <div className="match-topline">
        <Link href="/" className="prototype-wordmark"><Coffee aria-hidden="true" /> workina.cafe</Link>
        <span><MapPin aria-hidden="true" /> Mission, San Francisco</span>
      </div>

      <div className="match-hero">
        <div>
          <span className="prototype-kicker"><Sparkles aria-hidden="true" /> A better work break</span>
          <h1>What kind of workday<br />are you having?</h1>
          <p>Tell us the shape of your next few hours. We’ll bring the café research down to one good call.</p>
        </div>
        <div className="match-doodle" aria-hidden="true">
          <span>✦</span><Coffee /><i />
        </div>
      </div>

      <div className="match-board">
        <section className="match-questions" aria-label="Find a café for your work style">
          <div className="match-step"><span>01</span><div><small>Your work mode</small><strong>Make this easy on yourself.</strong></div></div>
          <div className="match-goals">
            {goals.map((option) => (
              <button className={goal === option ? "is-selected" : ""} key={option} onClick={() => setGoal(option)} type="button">
                {goal === option && <Check aria-hidden="true" />} {option}
              </button>
            ))}
          </div>
          <div className="match-step"><span>02</span><div><small>Time window</small><strong>Starting now · about 2 hours</strong></div><button type="button"><Clock3 aria-hidden="true" /></button></div>
          <div className="match-step"><span>03</span><div><small>Walk tolerance</small><strong>Up to 12 minutes</strong></div><button type="button"><Navigation aria-hidden="true" /></button></div>
          <div className="match-step"><span>04</span><div><small>Non-negotiable</small><strong>Reliable outlets</strong></div><button type="button"><PlugZap aria-hidden="true" /></button></div>
        </section>

        <aside className="match-answer">
          <span className="prototype-kicker"><Sparkles aria-hidden="true" /> Best fit today</span>
          <div className="match-answer__headline">
            <CafeSketch cafe={matchingCafe} />
            <div><h2>{matchingCafe.name}</h2><p>{matchingCafe.distance} away · open until {matchingCafe.closesAt}</p></div>
          </div>
          <p className="match-reason">“{matchingCafe.seatTip}”</p>
          <WorkSignals cafe={matchingCafe} />
          <div className="match-answer__proof"><span>92%</span><p>match for <strong>{goal.toLowerCase()}</strong><br />Confirmed {matchingCafe.freshness}</p></div>
          <button className="prototype-primary-button" onClick={() => setSelectedId(matchingCafe.id)} type="button">Take me there <ArrowRight aria-hidden="true" /></button>
          <button className="prototype-text-button" type="button">See 3 other good fits <ChevronRight aria-hidden="true" /></button>
        </aside>
      </div>

      <div className="match-footnote"><span>Why this matches</span> <Wifi aria-hidden="true" /> great signal <span>·</span> <PlugZap aria-hidden="true" /> outlets near your seat <span>·</span> <Volume2 aria-hidden="true" /> quiet after lunch</div>
    </section>
  );
}

function RightNow() {
  const [activeId, setActiveId] = useState("juniper");
  const activeCafe = byId(activeId);

  return (
    <section className="direction-screen direction-screen--now">
      <header className="now-header">
        <Link href="/" className="prototype-wordmark"><Coffee aria-hidden="true" /> workina.cafe</Link>
        <label><Search aria-hidden="true" /><input aria-label="Search a café" placeholder="Search nearby" /><kbd>⌘K</kbd></label>
        <button type="button"><MapPin aria-hidden="true" /> Mission</button>
      </header>

      <div className="now-layout">
        <aside className="now-sidebar">
          <div className="now-heading"><span>Thursday · 1:42 PM</span><h1>Good places<br />to work <em>now.</em></h1><p>Fresh notes within a 12 min walk.</p></div>
          <div className="now-filters"><button className="is-selected" type="button"><Check aria-hidden="true" /> Open</button><button type="button">Quiet</button><button type="button">Outlets</button><button type="button">Calls OK</button></div>
          <div className="now-results-meta"><strong>12 places</strong><span>Sorted by walk time</span><button type="button">Filters +</button></div>
          <div className="now-cafe-list">
            {FEATURED_CAFES.map((cafe) => <CafeMiniCard active={activeId === cafe.id} cafe={cafe} key={cafe.id} onClick={() => setActiveId(cafe.id)} />)}
          </div>
        </aside>

        <div className="now-map" aria-label="Map preview of cafés nearby">
          <div className="now-map__roads" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          {FEATURED_CAFES.map((cafe, index) => (
            <button aria-label={`Select ${cafe.name}`} className={`now-pin now-pin--${index + 1} ${activeId === cafe.id ? "is-active" : ""}`} key={cafe.id} onClick={() => setActiveId(cafe.id)} type="button"><Coffee aria-hidden="true" /><span>{index + 1}</span></button>
          ))}
          <div className="now-location"><span /><small>You are here</small></div>
          <div className="now-map__controls"><button type="button">+</button><button type="button">−</button><button type="button"><Compass aria-hidden="true" /></button></div>
          <div className="now-selected-card">
            <div><span className={activeCafe.isOpen ? "status-open" : "status-open is-closed"}>{activeCafe.isOpen ? "Open now" : "Closed"}</span></div>
            <h2>{activeCafe.name}</h2><p><MapPin aria-hidden="true" /> {activeCafe.distance} · {activeCafe.neighborhood}</p>
            <WorkSignals cafe={activeCafe} />
            <button className="prototype-primary-button" type="button">Directions <ArrowUpRight aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Compare() {
  const [leftId, setLeftId] = useState("juniper");
  const [rightId, setRightId] = useState("field-day");
  const left = byId(leftId);
  const right = byId(rightId);
  const metrics = [
    { label: "Walk", icon: <Navigation aria-hidden="true" />, left: left.distance, right: right.distance, winner: left.distance < right.distance ? "left" : "right" },
    { label: "Wi-Fi", icon: <Wifi aria-hidden="true" />, left: left.wifi, right: right.wifi, winner: left.wifi === "Great" ? "left" : right.wifi === "Great" ? "right" : "" },
    { label: "Outlets", icon: <PlugZap aria-hidden="true" />, left: left.outlets, right: right.outlets, winner: left.outlets === "Many" ? "left" : right.outlets === "Many" ? "right" : "" },
    { label: "Noise", icon: <Volume2 aria-hidden="true" />, left: left.noise, right: right.noise, winner: left.noise === "Quiet" ? "left" : right.noise === "Quiet" ? "right" : "" },
    { label: "Calls", icon: <Phone aria-hidden="true" />, left: left.calls, right: right.calls, winner: left.calls === "Calls welcome" ? "left" : right.calls === "Calls welcome" ? "right" : "" },
  ];

  return (
    <section className="direction-screen direction-screen--compare">
      <header className="compare-header"><Link href="/" className="prototype-wordmark"><Coffee aria-hidden="true" /> workina.cafe</Link><nav><a href="#compare">Discover</a><a className="is-current" href="#compare">Shortlist <b>2</b></a><a href="#compare">Neighborhoods</a></nav></header>
      <main className="compare-main">
        <div className="compare-intro"><span className="prototype-kicker">Your Thursday shortlist</span><h1>Two places.<br />One easy decision.</h1><p>Compare the details that actually affect a work session, then be on your way.</p></div>
        <div className="compare-grid">
          <section className="compare-place compare-place--left">
            <span className="compare-label">Option A <Check aria-hidden="true" /> closer</span><CafeSketch cafe={left} /><select aria-label="First café to compare" onChange={(event) => setLeftId(event.target.value)} value={leftId}>{FEATURED_CAFES.map((cafe) => <option key={cafe.id} value={cafe.id}>{cafe.name}</option>)}</select><p><MapPin aria-hidden="true" /> {left.neighborhood} · Open until {left.closesAt}</p><blockquote>“{left.seatTip}”</blockquote>
          </section>
          <section className="compare-table" aria-label="Café comparison">
            <div className="compare-table__title"><span>Work setup</span><small>community checked</small></div>
            {metrics.map((metric) => <div className="compare-metric" key={metric.label}><strong className={metric.winner === "left" ? "is-winner" : ""}>{metric.left}{metric.winner === "left" && <Check aria-hidden="true" />}</strong><span>{metric.icon}{metric.label}</span><strong className={metric.winner === "right" ? "is-winner" : ""}>{metric.winner === "right" && <Check aria-hidden="true" />}{metric.right}</strong></div>)}
            <div className="compare-verification"><span>Freshness</span><strong>{left.freshness}</strong><strong>{right.freshness}</strong></div>
          </section>
          <section className="compare-place compare-place--right">
            <span className="compare-label">Option B <Check aria-hidden="true" /> outdoor</span><CafeSketch cafe={right} /><select aria-label="Second café to compare" onChange={(event) => setRightId(event.target.value)} value={rightId}>{FEATURED_CAFES.map((cafe) => <option key={cafe.id} value={cafe.id}>{cafe.name}</option>)}</select><p><MapPin aria-hidden="true" /> {right.neighborhood} · Open until {right.closesAt}</p><blockquote>“{right.seatTip}”</blockquote>
          </section>
        </div>
        <div className="compare-verdict"><div><span className="prototype-kicker"><Sparkles aria-hidden="true" /> Our nudge</span><h2>Pick {left.name} for a focused afternoon.</h2><p>It wins on Wi-Fi, outlets, quiet, and distance. {right.name} is the better choice if a patio matters today.</p></div><button className="prototype-primary-button" type="button">Directions to {left.name} <ArrowRight aria-hidden="true" /></button></div>
      </main>
    </section>
  );
}

function NeighborhoodGuide() {
  const [spot, setSpot] = useState(0);
  const guideStops = [byId("north-star"), byId("juniper"), byId("field-day")];
  const current = guideStops[spot];

  return (
    <section className="direction-screen direction-screen--guide">
      <header className="guide-header"><Link href="/" className="prototype-wordmark"><Coffee aria-hidden="true" /> workina.cafe</Link><nav><a href="#guide">Find a desk</a><a className="is-current" href="#guide">Neighborhood notes</a></nav><button type="button"><Search aria-hidden="true" /> Search</button></header>
      <main className="guide-main">
        <div className="guide-hero"><span className="prototype-kicker"><Route aria-hidden="true" /> Field guide no. 04</span><h1>A workday<br /><em>around the Mission.</em></h1><p>Three café moods, a 22-minute walk, and enough local detail to find a desk that fits the way you want to spend today.</p><div className="guide-meta"><span><MapPin aria-hidden="true" /> 0.9 mile loop</span><span><Clock3 aria-hidden="true" /> Best 10am–3pm</span><span><Users aria-hidden="true" /> 36 recent notes</span></div></div>
        <div className="guide-map" aria-label="An illustrated route through the Mission"><div className="guide-map__path" /><span className="guide-map__neighborhood guide-map__neighborhood--one">Dolores<br />Park</span><span className="guide-map__neighborhood guide-map__neighborhood--two">Valencia<br />Street</span>{guideStops.map((cafe, index) => <button className={`guide-stop guide-stop--${index + 1} ${spot === index ? "is-active" : ""}`} key={cafe.id} onClick={() => setSpot(index)} type="button"><b>{index + 1}</b><span>{cafe.name}</span></button>)}<div className="guide-map__legend"><span><i /> walk route</span><span><b>1</b> work stop</span></div></div>
        <section className="guide-stop-detail"><div className="guide-stop-detail__number">0{spot + 1}</div><CafeSketch cafe={current} /><div><span className="prototype-kicker">{spot === 0 ? "Start with focus" : spot === 1 ? "Settle in" : "Finish with air"}</span><h2>{current.name}</h2><p>{current.neighborhood} · {current.distance} from the center</p></div><blockquote>“{current.seatTip}”</blockquote><WorkSignals cafe={current} /><button className="prototype-secondary-button" type="button">Open this stop <ArrowRight aria-hidden="true" /></button></section>
        <section className="guide-notes"><div><span className="prototype-kicker"><Coffee aria-hidden="true" /> The neighborhood read</span><h2>Small tables,<br />big workday energy.</h2></div><p>The Mission is best when you want a little life around your focus. Start toward Valencia before the lunch rush, then make the quieter streets your afternoon escape.</p><button type="button">Read all neighborhood notes <ArrowUpRight aria-hidden="true" /></button></section>
      </main>
    </section>
  );
}

function WorkdayPlanner() {
  const [selectedSlot, setSelectedSlot] = useState("1:30 PM");
  const [added, setAdded] = useState(false);
  const schedule = [
    { time: "9:00 AM", title: "Morning focus", detail: "Home", status: "done" },
    { time: "11:30 AM", title: "Team sync", detail: "Video call", status: "done" },
    { time: "1:30 PM", title: "Write the brief", detail: "Juniper Coffee", status: "active" },
    { time: "4:00 PM", title: "Admin & wrap", detail: "Open slot", status: "upcoming" },
  ];
  const cafe = byId("juniper");

  return (
    <section className="direction-screen direction-screen--session">
      <aside className="session-rail"><Link href="/" className="session-logo"><Coffee aria-hidden="true" /></Link><nav><button className="is-current" type="button"><CalendarDays aria-hidden="true" /><span>Plan</span></button><button type="button"><Compass aria-hidden="true" /><span>Explore</span></button></nav><div className="session-rail__bottom"><button type="button"><Plus aria-hidden="true" /> New session</button></div></aside>
      <main className="session-main"><header><div><span>Thursday, October 24</span><h1>Plan your afternoon.</h1></div><button className="session-weather" type="button"><span>19°</span><Trees aria-hidden="true" /> Patio weather</button></header><section className="session-overview"><div className="session-date"><button type="button">‹</button><div><span>OCT</span><strong>24</strong><small>THU</small></div><button type="button">›</button></div><div><span className="prototype-kicker"><Sparkles aria-hidden="true" /> Today’s intention</span><h2>Two quiet hours,<br />somewhere with power.</h2></div><div className="session-progress"><strong>2 <small>/ 4</small></strong><span>sessions complete</span><div><i /><i /><i /><i /></div></div></section><section className="session-content"><div className="session-timeline"><div className="session-section-title"><h2>Your workday</h2><button type="button">Edit day</button></div>{schedule.map((item) => <button className={`timeline-item is-${item.status} ${selectedSlot === item.time ? "is-selected" : ""}`} key={item.time} onClick={() => setSelectedSlot(item.time)} type="button"><time>{item.time}</time><span className="timeline-item__line"><i /></span><span><strong>{item.title}</strong><small>{item.detail}</small></span>{item.status === "done" ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}</button>)}</div><aside className="session-detail"><span className="prototype-kicker"><Coffee aria-hidden="true" /> {selectedSlot === "1:30 PM" ? "Next session" : "Session details"}</span><h2>{selectedSlot === "1:30 PM" ? "A focused afternoon at Juniper." : schedule.find((item) => item.time === selectedSlot)?.title}</h2>{selectedSlot === "1:30 PM" ? <><div className="session-cafe"><CafeSketch cafe={cafe} /><div><strong>{cafe.name}</strong><span><MapPin aria-hidden="true" /> 6 min walk</span><span className="status-open">Open until {cafe.closesAt}</span></div></div><WorkSignals cafe={cafe} /><p className="session-quote">“{cafe.seatTip}”</p><button className="prototype-primary-button" type="button">Start directions <Navigation aria-hidden="true" /></button><button className="prototype-text-button" onClick={() => setAdded(!added)} type="button">{added ? "Added to this plan" : "Add a 4pm backup"} <Plus aria-hidden="true" /></button></> : <><p className="session-empty">A little structure goes a long way. Add a café, a task, or leave yourself room to wander.</p><button className="prototype-secondary-button" type="button"><Plus aria-hidden="true" /> Add a work session</button></>}</aside></section></main>
    </section>
  );
}

export function CafePrototypeLab() {
  const [active, setActive] = useState<DirectionId>("match");
  const direction = useMemo(() => DIRECTIONS.find((item) => item.id === active) ?? DIRECTIONS[0], [active]);

  return (
    <main className="prototype-lab">
      <header className="prototype-lab__header">
        <div><Link href="/" className="prototype-lab__back"><ArrowRight aria-hidden="true" /> Back to product</Link><h1>Five ways to find a good desk.</h1><p>Alternate interface directions for workina.cafe, each built around a different moment of intent.</p></div>
        <div className="prototype-lab__status"><span>Concept lab</span><b>5 interactive routes</b></div>
      </header>
      <div className="prototype-lab__chooser" role="tablist" aria-label="Choose a UI direction">
        {DIRECTIONS.map((item) => <button aria-selected={active === item.id} className={active === item.id ? "is-active" : ""} key={item.id} onClick={() => setActive(item.id)} role="tab" type="button"><span>{item.number}</span><strong>{item.shortName}</strong><small>{item.bestFor}</small></button>)}
      </div>
      <div className="prototype-lab__caption"><span>{direction.number} — {direction.name}</span><p>{direction.premise}</p></div>
      <div className="prototype-stage">
        {active === "match" && <FocusFinder />}
        {active === "now" && <RightNow />}
        {active === "compare" && <Compare />}
        {active === "guide" && <NeighborhoodGuide />}
        {active === "session" && <WorkdayPlanner />}
      </div>
      <footer className="prototype-lab__footer"><span>Built with the existing community café data</span><span>Click into each direction to explore its core interaction</span></footer>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RANKING_FEES, supplyCounts, type SupplySide } from "@/lib/travel/marketplace";

export const Route = createFileRoute("/for-providers")({
  component: ForProviders,
  head: () => ({ meta: [{ title: "List on Gesht" }] }),
});

const SIDES: { id: SupplySide; title: string; body: string; need: string }[] = [
  {
    id: "flight",
    title: "Flights — local ticket desks",
    body: "Wego and Kayak stay affiliate. They already pay on click. The ranking fee is for Erbil, Slemani, and Baghdad IATA shops — RideFly, Gashtyar, Al Shaheen, the street agency that still quotes on WhatsApp. Airlines we only deep-link. Do not pretend there are 100 carriers into EBL.",
    need: "IATA number, city, WhatsApp, airports you ticket, IQD or USD.",
  },
  {
    id: "hotel",
    title: "Hotels — the property, not Booking",
    body: "Booking.com is the graph. Independent pensions, shrine hotels, and Erbil 4-stars pay to stand above “open Booking”. Chains can buy Spotlight. The unit is the front desk that answers at 11pm, not a second OTA.",
    need: "Property name, rooms, nightly IQD, WhatsApp, photos. Dual-list with Booking is fine.",
  },
  {
    id: "package",
    title: "Packages — licensed inbound operators",
    body: "There are not 100 Kurdistan tour companies. There are maybe fifty licensed desks. Same WhatsApp pipe as hiking, with a multi-day itinerary. Visit Kurdistan stays an inquiry, not a cart.",
    need: "License, typical itineraries, season, pickup city, per-person IQD.",
  },
  {
    id: "car",
    title: "Cars — rental desks and with-driver",
    body: "Hertz and Avis are the airport names. Most KRG kilometres are a driver-guide. Rank the person with the Land Cruiser, not a ghost fleet. Eighty desks is the ceiling: airport counters plus with-driver in Erbil, Slemani, Duhok, Baghdad.",
    need: "Counter or driver name, cities, with-driver vs self-drive, day rate IQD, WhatsApp.",
  },
  {
    id: "care",
    title: "Care — facilitators pay, hospitals don’t",
    body: "A cancer center is not a villa. Hospitals and specialties stay free and unranked by money. The ranking fee is for facilitators who file the letter and the hop. Never sell “rank #1 for surgery”.",
    need: "Facilitator name, corridors (home / TR / JO / IR / IN), WhatsApp, languages, what they actually file.",
  },
  {
    id: "hike",
    title: "Hiking clubs and arrangers",
    body: "Clubs stay free forever. Commercial guides pay only if they want the Sponsored strip.",
    need: "Name, city, WhatsApp, trails, Friday price IQD, club or paid desk.",
  },
  {
    id: "stay",
    title: "Weekend villas and apartments",
    body: "Sign managers, not 100 Instagram pages. Thursday search, WhatsApp close.",
    need: "Photos, sleeps-how-many, nightly IQD, Friday premium, WhatsApp after 9pm.",
  },
  {
    id: "bus",
    title: "Garages, VIP fleets, station guides",
    body: "No GTFS. Corridor, window, fare, phone. Sixty operators is honest.",
    need: "Operator, garage, corridors, window, fare IQD, VIP vs minibus, WhatsApp.",
  },
];

function ForProviders() {
  const counts = useMemo(() => supplyCounts(), []);
  const [side, setSide] = useState<SupplySide>("flight");
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [inventory, setInventory] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { side, name, city, phone, inventory, at: new Date().toISOString() };
    try {
      const prev = JSON.parse(localStorage.getItem("gesht-apply") || "[]") as unknown[];
      localStorage.setItem("gesht-apply", JSON.stringify([payload, ...prev].slice(0, 20)));
    } catch {
      /* ignore */
    }
    setSent(true);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-fg">
      <Atmosphere />
      <div className="relative z-10">
        <SiteHeader solid />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Supply</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
            Search is free. Ranking is a fee.
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Travelers never pay Gesht. Clubs and hospitals never pay. OTAs already pay as affiliates.
            A ticket shop, a villa manager, a garage, or a medical facilitator pays only to stand
            higher when someone searches their city. Paid slots are marked Sponsored. WhatsApp is
            the checkout.
          </p>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SIDES.map((s) => (
              <div key={s.id} className="rounded-xl bg-surface px-4 py-4 shadow-border">
                <dt className="text-xs uppercase tracking-wide text-faint">{s.title.split(" — ")[0]}</dt>
                <dd className="mt-1 font-display text-3xl tabular-nums">
                  {counts[s.id].listed}
                  <span className="ml-2 text-base text-muted">/ {counts[s.id].target}</span>
                </dd>
                <p className="mt-1 text-xs text-muted">listed now · target</p>
              </div>
            ))}
          </dl>

          <section className="mt-12">
            <h2 className="font-display text-2xl tracking-tight">Every medium, a different seller</h2>
            <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SIDES.map((s) => (
                <li key={s.id} className="rounded-xl bg-surface p-5 shadow-border">
                  <p className="font-display text-xl">{s.title}</p>
                  <p className="mt-2 text-sm text-muted">{s.body}</p>
                  <p className="mt-3 text-xs text-faint">{s.need}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 grid gap-4 sm:grid-cols-3">
            {(["free", "featured", "spotlight"] as const).map((tier) => {
              const f = RANKING_FEES[tier];
              return (
                <div key={tier} className="rounded-xl bg-surface p-5 shadow-border">
                  <p className="text-xs uppercase tracking-wide text-faint">{tier}</p>
                  <p className="mt-1 font-display text-3xl tabular-nums">
                    {f.iqd === 0 ? "0" : `${f.iqd.toLocaleString("en")} IQD`}
                    <span className="ml-2 text-base text-muted">/ month</span>
                  </p>
                  {f.usd ? <p className="text-xs text-faint">about ${f.usd}</p> : null}
                  <p className="mt-2 text-sm text-muted">{f.seats}</p>
                </div>
              );
            })}
          </section>
          <p className="mt-3 text-xs text-muted">
            Affiliates (Wego, Booking, airline sites) never buy IQD rank — they pay on the click we
            already send. After thirty free WhatsApp opens a month, extra leads are 2,000 IQD each
            for commercial desks. Never clubs. Never hospitals.
          </p>

          <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="font-display text-2xl tracking-tight">Two pipes, not one marketplace</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>
                  <strong className="text-fg">Affiliate.</strong> Flights and chain hotels already
                  live on Wego and Booking. Gesht opens the same search. Revenue is CPA/CPC from
                  those desks, not a ranking invoice in Erbil.
                </li>
                <li>
                  <strong className="text-fg">Local desk.</strong> IATA shops, villa managers,
                  garages, with-driver, facilitators. They have no API. They have WhatsApp. Rank
                  is a monthly IQD fee. Lead is a prefilled message with a Gesht id.
                </li>
                <li>
                  <strong className="text-fg">Never for sale.</strong> Hiking clubs, hospital names,
                  specialty lists. Money can lift a facilitator beside Acıbadem. It cannot bury
                  King Hussein Cancer Center under a paid clinic.
                </li>
              </ul>
            </div>

            <form onSubmit={submit} className="rounded-2xl bg-surface p-5 shadow-lift">
              <p className="font-display text-xl">Claim or join</p>
              <p className="mt-1 text-sm text-muted">
                Listed in two days if the WhatsApp is real. No ranking fee until you pick Featured.
              </p>
              {sent ? (
                <p className="mt-6 text-sm">
                  Saved on this device. Message us from that WhatsApp and we will claim the desk.
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1">
                    {SIDES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSide(s.id)}
                        className={`rounded-lg px-3 py-1.5 text-sm ${side === s.id ? "bg-primary text-primary-fg" : "bg-sunken"}`}
                      >
                        {s.id}
                      </button>
                    ))}
                  </div>
                  <Input required placeholder="Desk or club name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input required placeholder="WhatsApp with country code" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input
                    placeholder="What you actually sell"
                    value={inventory}
                    onChange={(e) => setInventory(e.target.value)}
                  />
                  <Button type="submit">Request a listing</Button>
                </div>
              )}
            </form>
          </section>

          <p className="mt-10 text-sm text-muted">
            Searchers stay on{" "}
            <Link to="/" className="text-primary underline-offset-2 hover:underline">
              Gesht
            </Link>
            . Providers come here.
          </p>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

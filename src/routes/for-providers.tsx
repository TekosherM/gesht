import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RANKING_FEES,
  supplyCounts,
  type SupplySide,
} from "@/lib/travel/marketplace";

export const Route = createFileRoute("/for-providers")({
  component: ForProviders,
  head: () => ({ meta: [{ title: "List on Gesht" }] }),
});

const SIDES: { id: SupplySide; title: string; body: string; need: string }[] = [
  {
    id: "hike",
    title: "Hiking clubs and arrangers",
    body: "Clubs stay free forever. Commercial guides pay only if they want the Sponsored strip. Searchers already land on Hawraman, Gali Ali Beg, Halgurd — we hand you the WhatsApp with the trail and the date filled in.",
    need: "Name, city, WhatsApp, the trails you actually run, a typical Friday price in IQD, and whether you are a club or a paid desk.",
  },
  {
    id: "stay",
    title: "Weekend villas and apartments",
    body: "Shaqlawa, Dukan, Korek, Amedi. We are not Airbnb checkout. We are the Thursday search that ends in a call. Property managers with ten houses beat a hundred unmanaged listings.",
    need: "Photos, sleeps-how-many, nightly IQD plus Friday premium, blocked dates, WhatsApp for the person who answers after 9pm.",
  },
  {
    id: "bus",
    title: "Garages, VIP fleets, station guides",
    body: "Iraq has almost no public bus API. Gesht lists the corridor, the usual window, the usual fare, and the phone that actually picks up. Guides at the garage are a product too.",
    need: "Operator name, garage, corridors, depart window, fare IQD, VIP vs minibus, WhatsApp.",
  },
];

function ForProviders() {
  const counts = useMemo(() => supplyCounts(), []);
  const [side, setSide] = useState<SupplySide>("hike");
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
            Travelers never pay Gesht. Clubs never pay Gesht. A Shaqlawa villa, a Halgurd guide, or a
            VIP garage pays only to stand higher when someone searches their city. Every paid slot is
            marked Sponsored. WhatsApp is the checkout.
          </p>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {SIDES.map((s) => (
              <div key={s.id} className="rounded-xl bg-surface px-4 py-4 shadow-border">
                <dt className="text-xs uppercase tracking-wide text-faint">{s.title}</dt>
                <dd className="mt-1 font-display text-3xl tabular-nums">
                  {counts[s.id].listed}
                  <span className="ml-2 text-base text-muted">/ {counts[s.id].target}</span>
                </dd>
                <p className="mt-1 text-xs text-muted">listed now · target this year</p>
              </div>
            ))}
          </dl>

          <section className="mt-12">
            <h2 className="font-display text-2xl tracking-tight">What has to be true</h2>
            <ol className="mt-4 grid gap-4 lg:grid-cols-3">
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
            After thirty free WhatsApp opens a month, extra leads are 2,000 IQD each — only for
            commercial desks, never clubs. Paid rank cannot hide a better unpaid fit; it can only
            lift a complete listing.
          </p>

          <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="font-display text-2xl tracking-tight">How 100 actually happens</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li>
                  <strong className="text-fg">Hiking.</strong> There are not 100 tour companies in the
                  KRG. There are clubs, university groups, licensed individual guides, ZMT community
                  hosts, and a few expedition desks. Count those as 100 desks. Clubs stay free.
                  Operators claim a profile we already seeded.
                </li>
                <li>
                  <strong className="text-fg">Villas.</strong> Do not chase 100 Instagram pages. Sign
                  20–30 managers who already run 5–20 houses each. Dual-list anyone already on Booking
                  or OpenSooq. The unit of supply is the person who answers the phone on Thursday night.
                </li>
                <li>
                  <strong className="text-fg">Buses.</strong> Sixty operators is the honest ceiling:
                  two Erbil terminals, Slemani garaj, Al-Nahda, Kirkuk, Basra, VIP Turkey lines, and
                  station guides. Live GTFS will not appear. A weekly “still running?” WhatsApp will.
                </li>
                <li>
                  <strong className="text-fg">Both sides.</strong> Searcher → ranked list → prefilled
                  WhatsApp with a Gesht lead id → provider dashboard of inquiries. No card checkout in
                  v1. FastPay / Qi Card / transfer for the ranking fee.
                </li>
              </ul>
            </div>

            <form onSubmit={submit} className="rounded-2xl bg-surface p-5 shadow-lift">
              <p className="font-display text-xl">Claim or join</p>
              <p className="mt-1 text-sm text-muted">
                We list you within two days if the WhatsApp is real. No ranking fee until you pick
                Featured.
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
                  <Input required placeholder="City (Erbil, Slemani, Shaqlawa…)" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input required placeholder="WhatsApp with country code" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input
                    placeholder="Trails, houses, or corridors you actually run"
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

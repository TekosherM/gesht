import { Compass, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AgentGuide } from "@/components/guide/agent-guide";
import { RouteArc, SourceSweep } from "@/components/live-bits";
import { CareCorridors } from "@/components/results/care-corridors";
import { HikingGroups } from "@/components/results/hiking-groups";
import { OperatorsRow, type Desk } from "@/components/results/operators-row";
import { OutboundLinks } from "@/components/results/outbound-links";
import { ResultCard } from "@/components/results/result-cards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cheapest } from "@/lib/travel/format";
import operatorsCatalog from "../../../data/operators.json";
import { alsoConsider, searchTravel } from "@/lib/travel/search";
import { outboundsFor } from "@/lib/travel/outbounds";
import { airportFor } from "@/lib/travel/meta";
import { getPlace } from "@/lib/travel/places";
import { modeMeta } from "@/lib/travel/params";
import type { HikingGroup, OutboundLink, SearchQuery, TravelOffer } from "@/lib/travel/types";
import { cn } from "@/lib/utils";

type ApiPayload = {
  offers?: TravelOffer[];
  outbounds?: OutboundLink[];
  groups?: HikingGroup[];
  operators?: Desk[];
  disclaimer?: string;
};

export function ResultBoard({
  query,
  loading,
  onMode,
}: {
  query: SearchQuery;
  loading: boolean;
  onMode: (mode: SearchQuery["mode"]) => void;
}) {
  const [sort, setSort] = useState<"price" | "duration">("price");
  const [grade, setGrade] = useState<"all" | "easy" | "moderate" | "hard">("all");
  const [guideOpen, setGuideOpen] = useState(true);
  const [api, setApi] = useState<ApiPayload | null>(null);
  const localOffers = useMemo(() => searchTravel(query), [query]);
  const alts = useMemo(() => alsoConsider(query), [query]);

  useEffect(() => {
    const params = new URLSearchParams({
      mode: query.mode,
      to: query.to,
      depart: query.depart,
      guests: String(query.guests),
      rooms: String(query.rooms),
    });
    if (query.from) params.set("from", query.from);
    if (query.returnDate) params.set("returnDate", query.returnDate);
    let dead = false;
    fetch(`/api/gesht/search?${params}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("search"))))
      .then((data: ApiPayload) => {
        if (!dead) setApi(data);
      })
      .catch(() => {
        if (!dead) setApi(null);
      });
    return () => {
      dead = true;
    };
  }, [query.mode, query.to, query.from, query.depart, query.returnDate, query.guests, query.rooms]);

  const offers =
    query.mode === "hiking" && api?.offers && api.offers.length > 0 ? api.offers : localOffers;

  const sorted = useMemo(() => {
    const copy = [...offers].filter((o) => {
      if (query.mode !== "hiking" || grade === "all" || o.kind !== "hike") return true;
      return o.grade === grade;
    });
    copy.sort((a, b) => score(a, sort) - score(b, sort));
    return copy;
  }, [offers, sort, grade, query.mode]);

  const dest = getPlace(query.to);
  const origin = query.from ? getPlace(query.from) : undefined;
  const fromCode = origin?.iata ?? origin?.name ?? "—";
  const toCode = dest?.iata ?? dest?.name ?? "—";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wide text-faint uppercase">
              {modeMeta[query.mode].label}
            </p>
            {origin && dest ? (
              <div className="mt-2 max-w-md">
                <RouteArc from={fromCode} to={toCode} meta={`${origin.name} → ${dest.name}`} />
              </div>
            ) : (
              <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{dest?.name}</h1>
            )}
            <p className="mt-1 text-sm text-muted">
              {loading
                ? "Sweeping desks…"
                : sorted.length
                  ? `${sorted.length} option${sorted.length === 1 ? "" : "s"}`
                  : "Nothing listed for this pair yet — try another city or mode."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setGuideOpen(true)}
            >
              <Compass className="size-3.5" />
              Guide
            </Button>
            <div className="inline-flex rounded-md bg-sunken p-0.5">
              <SortChip active={sort === "price"} onClick={() => setSort("price")}>
                Price
              </SortChip>
              <SortChip active={sort === "duration"} onClick={() => setSort("duration")}>
                Time
              </SortChip>
            </div>
            {query.mode === "hiking" ? (
              <div className="inline-flex rounded-md bg-sunken p-0.5">
                {(["all", "easy", "moderate", "hard"] as const).map((g) => (
                  <SortChip key={g} active={grade === g} onClick={() => setGrade(g)}>
                    {g === "all" ? "All" : g}
                  </SortChip>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {!loading && query.mode === "medical" ? <CareCorridors query={query} /> : null}

        <div className="mt-4 rounded-xl bg-surface/80 p-3 shadow-border">
          <p className="mb-2 text-[11px] font-medium tracking-wide text-faint uppercase">
            Source sweep
          </p>
          <SourceSweep running={loading} mode={query.mode} />
        </div>

        <OutboundLinks
          links={api?.outbounds?.length ? api.outbounds : outboundsFor(query.mode, query)}
          disclaimer={
            api?.disclaimer ??
            "Gesht opens the same search on the desk that holds the seats. Live prices live there."
          }
        />

        {alts.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {alts.map((a) => (
              <button
                key={a.mode}
                type="button"
                onClick={() => onMode(a.mode)}
                className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium shadow-border transition-[box-shadow,transform] duration-200 hover:shadow-border-hover"
              >
                {a.label}
                <span className="ml-1.5 text-muted">{a.detail}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full rounded-xl" />
              ))
            : sorted.map((offer, i) => (
                <div key={offer.id} className={cn("rise-in", `stagger-${Math.min(i + 1, 6)}`)}>
                  <ResultCard offer={offer} query={query} />
                </div>
              ))}
        </div>

        {!loading && query.mode === "hiking" ? (
          <HikingGroups groups={api?.groups ?? []} />
        ) : null}

        {!loading ? (
          <OperatorsRow
            desks={
              api?.operators && api.operators.length
                ? api.operators
                : (operatorsCatalog as Array<Desk & { modes?: string[]; booking_style?: string }>).
                    filter((d) => (d.modes ?? []).includes(query.mode)).
                    map((d) => ({
                      id: d.id,
                      name: d.name,
                      city: d.city,
                      website: d.website,
                      bookingStyle: d.bookingStyle ?? d.booking_style,
                      notes: d.notes,
                    }))
            }
          />
        ) : null}

        {!loading && sorted.length === 0 ? (
          <div className="mt-8 rounded-xl bg-surface px-6 py-12 text-center shadow-border">
            <SlidersHorizontal className="mx-auto size-6 text-muted" />
            <p className="mt-3 font-display text-xl">No listings on this corridor</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {query.mode === "flights" && airportFor(query.to)
                ? `No metal into ${dest?.name}. Nearest airport is ${getPlace(airportFor(query.to) ?? "")?.name ?? "Erbil"}.`
                : query.mode === "car"
                  ? "Gesht will not invent a drive across a sea or a visa line. Fly, or pick two cities inside Iraq and the KRG."
                  : "Try another city, or switch mode — car works for any two inland cities."}
            </p>
            {alts.length ? (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {alts.map((a) => (
                  <button
                    key={a.mode}
                    type="button"
                    onClick={() => onMode(a.mode)}
                    className="rounded-full bg-sunken px-3 py-1.5 text-xs font-medium"
                  >
                    {a.label}
                    <span className="ml-1.5 text-muted">{a.detail}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={cn(!guideOpen && "hidden lg:block", "lg:sticky lg:top-20 lg:self-start")}>
        <AgentGuide query={query} open={guideOpen} onOpenChange={setGuideOpen} />
      </div>
    </div>
  );
}

function score(offer: TravelOffer, sort: "price" | "duration") {
  if (offer.kind === "flight") {
    return sort === "duration" ? offer.durationMin : cheapest(offer.sources);
  }
  if (offer.kind === "bus") {
    return sort === "duration" ? offer.durationMin : cheapest(offer.sources);
  }
  if (offer.kind === "hotel") return offer.nightlyUsd;
  if (offer.kind === "car") return sort === "duration" ? offer.hours * 60 : offer.fuelUsd;
  if (offer.kind === "hike") return sort === "duration" ? offer.hours * 60 : offer.priceUsd;
  if (offer.kind === "stay") return offer.nightlyUsd;
  if (offer.kind === "care") return sort === "duration" ? offer.nights * 24 * 60 : offer.priceUsd;
  return offer.priceUsd;
}

function SortChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-[6px] px-3 text-xs font-medium transition-colors",
        active ? "bg-surface text-fg shadow-border" : "text-muted",
      )}
    >
      {children}
    </button>
  );
}
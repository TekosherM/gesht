import { Compass, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { AgentGuide } from "@/components/guide/agent-guide";
import { ResultCard } from "@/components/results/result-cards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cheapest } from "@/lib/travel/format";
import { alsoConsider, searchTravel } from "@/lib/travel/search";
import { getPlace } from "@/lib/travel/places";
import { modeMeta } from "@/lib/travel/params";
import type { SearchQuery, TravelOffer } from "@/lib/travel/types";
import { cn } from "@/lib/utils";

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
  const [guideOpen, setGuideOpen] = useState(true);
  const offers = useMemo(() => searchTravel(query), [query]);
  const alts = useMemo(() => alsoConsider(query), [query]);

  const sorted = useMemo(() => {
    const copy = [...offers];
    copy.sort((a, b) => score(a, sort) - score(b, sort));
    return copy;
  }, [offers, sort]);

  const dest = getPlace(query.to);
  const origin = query.from ? getPlace(query.from) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-faint uppercase">
              {modeMeta[query.mode].label}
            </p>
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
              {origin ? `${origin.name} to ${dest?.name}` : dest?.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {loading
                ? "Comparing sources…"
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
          </div>
        </div>

        {alts.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {alts.map((a) => (
              <button
                key={a.mode}
                type="button"
                onClick={() => onMode(a.mode)}
                className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium shadow-border hover:shadow-border-hover"
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

        {!loading && sorted.length === 0 ? (
          <div className="mt-8 rounded-xl bg-surface px-6 py-12 text-center shadow-border">
            <SlidersHorizontal className="mx-auto size-6 text-muted" />
            <p className="mt-3 font-display text-xl">No listings on this corridor</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Try a gateway such as Istanbul or Dubai for flights, or switch to car for any two
              cities inside Iraq and the KRG.
            </p>
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
        "h-8 rounded-[6px] px-3 text-xs font-medium",
        active ? "bg-surface text-fg shadow-border" : "text-muted",
      )}
    >
      {children}
    </button>
  );
}

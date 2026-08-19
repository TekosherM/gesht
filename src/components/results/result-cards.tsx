import {
  Bus,
  CarFront,
  Clock3,
  Fuel,
  Hotel,
  Mountain,
  Plane,
  Route,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cheapest, durationLabel, hoursLabel, usd } from "@/lib/travel/format";
import { nightsBetween } from "@/lib/travel/search";
import { getPlace } from "@/lib/travel/places";
import type {
  BusOffer,
  CarOffer,
  FlightOffer,
  HotelOffer,
  PackageOffer,
  SearchQuery,
  TravelOffer,
} from "@/lib/travel/types";

export function ResultCard({ offer, query }: { offer: TravelOffer; query: SearchQuery }) {
  switch (offer.kind) {
    case "flight":
      return <FlightCard offer={offer} />;
    case "hotel":
      return <HotelCard offer={offer} query={query} />;
    case "bus":
      return <BusCard offer={offer} />;
    case "car":
      return <CarCard offer={offer} />;
    case "package":
      return <PackageCard offer={offer} />;
  }
}

function FlightCard({ offer }: { offer: FlightOffer }) {
  const from = getPlace(offer.from);
  const to = getPlace(offer.to);
  const low = cheapest(offer.sources);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Plane className="size-3.5" />
            <span>
              {offer.airline}
              <span className="text-faint"> · {offer.flightNo}</span>
            </span>
            {offer.cabin === "business" ? <Badge>Business</Badge> : null}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TimeBlock time={offer.depart} code={from?.iata ?? from?.name} city={from?.name} />
            <div className="text-center text-xs text-muted">
              <p className="tabular-nums">{durationLabel(offer.durationMin)}</p>
              <div className="my-1 h-px w-16 bg-line sm:w-24" />
              <p>{offer.stops === 0 ? "Nonstop" : `${offer.stops} stop${offer.via ? ` · ${offer.via}` : ""}`}</p>
            </div>
            <TimeBlock time={offer.arrive} code={to?.iata ?? to?.name} city={to?.name} align="right" />
          </div>
        </div>
        <PriceStack sources={offer.sources} low={low} />
      </div>
    </Card>
  );
}

function HotelCard({ offer, query }: { offer: HotelOffer; query: SearchQuery }) {
  const nights = nightsBetween(query.depart, query.returnDate);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Hotel className="size-3.5" />
            <span>{offer.area}</span>
            <Stars n={offer.stars} />
          </div>
          <h3 className="mt-1 font-display text-xl tracking-tight">{offer.name}</h3>
          <p className="mt-1 text-sm text-muted">{offer.note}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {offer.amenities.map((a) => (
              <Badge key={a}>{a}</Badge>
            ))}
          </div>
          <p className="mt-3 text-xs text-faint">
            {offer.rating.toFixed(1)} guest score · {offer.reviews.toLocaleString()} reviews
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted">per night</p>
          <p className="font-display text-3xl tabular-nums tracking-tight">{usd(offer.nightlyUsd)}</p>
          <p className="text-xs text-muted">{nights} night{nights === 1 ? "" : "s"} · {usd(offer.nightlyUsd * nights)}</p>
          <p className="mt-2 text-xs text-faint">Booking · Agoda · Hotel</p>
        </div>
      </div>
    </Card>
  );
}

function BusCard({ offer }: { offer: BusOffer }) {
  const from = getPlace(offer.from);
  const to = getPlace(offer.to);
  const low = cheapest(offer.sources);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Bus className="size-3.5" />
            <span>
              {offer.operator}
              <span className="text-faint"> · {offer.seat}</span>
            </span>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TimeBlock time={offer.depart} code={from?.name} city="Garage" />
            <div className="text-center text-xs text-muted">
              <p className="tabular-nums">{durationLabel(offer.durationMin)}</p>
              <div className="my-1 h-px w-16 bg-line" />
              <p>Road</p>
            </div>
            <TimeBlock time={offer.arrive} code={to?.name} city="Garage" align="right" />
          </div>
        </div>
        <PriceStack sources={offer.sources} low={low} />
      </div>
    </Card>
  );
}

function CarCard({ offer }: { offer: CarOffer }) {
  const from = getPlace(offer.from);
  const to = getPlace(offer.to);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm text-muted">
        <CarFront className="size-3.5" />
        <span>
          {from?.name} to {to?.name}
        </span>
        <Badge className="capitalize">{offer.road}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Route} label="Distance" value={`${offer.km} km`} />
        <Stat icon={Clock3} label="Driving time" value={hoursLabel(offer.hours)} />
        <Stat icon={Fuel} label="Fuel (est.)" value={usd(offer.fuelUsd)} />
        <Stat icon={Mountain} label="Checkpoints" value={String(offer.checkpoints)} />
      </div>
      {offer.waypoints.length ? (
        <p className="mt-4 text-sm text-muted">Via {offer.waypoints.join(" · ")}</p>
      ) : null}
      <ul className="mt-3 space-y-1.5 text-sm text-muted">
        {offer.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </Card>
  );
}

function PackageCard({ offer }: { offer: PackageOffer }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-faint uppercase">{offer.season}</p>
          <h3 className="mt-1 font-display text-xl tracking-tight">{offer.title}</h3>
          <p className="mt-1 text-sm text-muted">
            {offer.nights} nights · {offer.cities.map((id) => getPlace(id)?.name ?? id).join(" → ")}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {offer.includes.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">from</p>
          <p className="font-display text-3xl tabular-nums tracking-tight">{usd(offer.priceUsd)}</p>
          <p className="text-xs text-muted">per person</p>
        </div>
      </div>
    </Card>
  );
}

function TimeBlock({
  time,
  code,
  city,
  align = "left",
}: {
  time: string;
  code?: string;
  city?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="font-display text-2xl tabular-nums tracking-tight">{time}</p>
      <p className="text-sm font-medium">{code}</p>
      <p className="text-xs text-muted">{city}</p>
    </div>
  );
}

function PriceStack({ sources, low }: { sources: { source: string; usd: number }[]; low: number }) {
  return (
    <div className="shrink-0 sm:min-w-36 sm:text-right">
      <p className="text-xs text-muted">from</p>
      <p className="font-display text-3xl tabular-nums tracking-tight">{usd(low)}</p>
      <ul className="mt-2 space-y-1 text-xs text-muted">
        {sources.map((s) => (
          <li key={s.source} className="flex justify-between gap-4 sm:justify-end sm:gap-3">
            <span>{s.source}</span>
            <span className="tabular-nums text-fg">{usd(s.usd)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-primary">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="size-3 fill-current" />
      ))}
    </span>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Route;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-bg px-3 py-2">
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-faint uppercase">
        <Icon className="size-3" />
        {label}
      </p>
      <p className="mt-1 font-medium tabular-nums">{value}</p>
    </div>
  );
}

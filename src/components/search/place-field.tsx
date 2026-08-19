import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  featuredDestinations,
  gatewayPlaces,
  hikeDestinations,
  medicalDestinations,
  searchPlaces,
  weekendDestinations,
} from "@/lib/travel/places";
import type { Place, TravelMode } from "@/lib/travel/types";
import { cn } from "@/lib/utils";

export function PlaceField({
  label,
  value,
  exclude,
  mode,
  autoFocus,
  onSelect,
}: {
  label: string;
  value?: Place;
  exclude?: string;
  mode: TravelMode;
  autoFocus?: boolean;
  onSelect: (place: Place) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchPlaces(q, { exclude, mode }), [q, exclude, mode]);
  const searching = q.trim().length > 0;

  const grouped = useMemo(() => {
    const filtered = results.filter((p) => p.id !== exclude);
    const krg = filtered.filter((p) => p.region === "krg");
    const federal = filtered.filter((p) => p.region === "federal");
    const gateways =
      mode === "hotels" ||
      mode === "car" ||
      mode === "bus" ||
      mode === "hiking" ||
      mode === "weekends"
        ? []
        : filtered.filter((p) => p.region === "gateway");
    return { krg, federal, gateways };
  }, [results, exclude, mode]);

  const chips = useMemo(() => {
    if (mode === "hiking") return hikeDestinations.filter((p) => p.id !== exclude);
    if (mode === "weekends") return weekendDestinations.filter((p) => p.id !== exclude);
    if (mode === "medical") return medicalDestinations.filter((p) => p.id !== exclude);
    const extras =
      mode === "hotels" || mode === "car" || mode === "bus"
        ? []
        : gatewayPlaces.slice(0, 4);
    return [...featuredDestinations, ...extras].filter((p) => p.id !== exclude);
  }, [exclude, mode]);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-muted">{label}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
        <Input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={value ? value.name : "Type a place"}
          className="pl-10"
        />
      </div>

      {!searching ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm shadow-border transition-[box-shadow,background-color] duration-150 hover:shadow-border-hover",
                value?.id === p.id ? "bg-primary text-primary-fg" : "bg-surface text-fg",
              )}
            >
              {p.name}
              {p.iata ? <span className="ml-1 text-xs opacity-70">{p.iata}</span> : null}
            </button>
          ))}
        </div>
      ) : (
        <>
          <PlaceGroup title="Kurdistan Region" places={grouped.krg} onSelect={onSelect} />
          <PlaceGroup title="Federal Iraq" places={grouped.federal} onSelect={onSelect} />
          {grouped.gateways.length > 0 ? (
            <PlaceGroup title="Gateways" places={grouped.gateways} onSelect={onSelect} />
          ) : null}
          {grouped.krg.length + grouped.federal.length + grouped.gateways.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No matching city.</p>
          ) : null}
        </>
      )}

      {value && !searching ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <MapPin className="size-3.5 text-primary" />
          {value.name}
          <span className="text-faint">
            {value.localName}
            {value.iata ? ` · ${value.iata}` : ""}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function PlaceGroup({
  title,
  places,
  onSelect,
}: {
  title: string;
  places: Place[];
  onSelect: (p: Place) => void;
}) {
  if (!places.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium tracking-wide text-faint uppercase">{title}</p>
      <ul className="flex flex-col gap-1">
        {places.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors duration-150 hover:bg-sunken"
            >
              <span>
                <span className="block text-sm font-medium">{p.name}</span>
                <span className="block text-xs text-muted">{p.localName}</span>
              </span>
              <span className="font-mono text-xs text-faint">{p.iata ?? p.country}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

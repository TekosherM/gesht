import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { careCorridors, corridorOfCity } from "@/lib/travel/care-corridors";
import { usd } from "@/lib/travel/format";
import type { SearchQuery } from "@/lib/travel/types";
import { cn } from "@/lib/utils";

export function CareCorridors({ query }: { query: SearchQuery }) {
  const active = corridorOfCity(query.to);
  return (
    <div className="mt-6">
      <p className="text-[11px] font-medium tracking-wide text-faint uppercase">
        Four outbound corridors — plus staying home
      </p>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Turkey is the default upgrade. Jordan is Arabic oncology. Iran is the
        land-and-cash hop from Slemani. India is cheaper for complex surgery —
        letter, then visa, then ticket.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {careCorridors.map((c) => {
          const on = active === c.id;
          return (
            <li key={c.id}>
              <Link
                to="/search"
                search={{
                  mode: "medical",
                  to: c.hub,
                  from: query.from,
                  depart: query.depart,
                  returnDate: query.returnDate,
                  guests: query.guests,
                  rooms: query.rooms,
                }}
                className={cn(
                  "block h-full rounded-xl px-3 py-3 shadow-border transition-colors",
                  on ? "bg-fg text-bg" : "bg-surface hover:bg-raised",
                )}
              >
                <p className="text-[11px] font-medium tracking-wide uppercase opacity-70">
                  {c.country}
                </p>
                <p className="mt-0.5 font-display text-lg tracking-tight">{c.label}</p>
                <p className={cn("mt-1 text-xs leading-snug", on ? "opacity-80" : "text-muted")}>
                  {c.bestFor}
                </p>
                <p className={cn("mt-2 flex items-center gap-1 text-xs", on ? "opacity-80" : "text-faint")}>
                  <Plane className="size-3" />
                  from {usd(c.fromUsd)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { defaultDepartIso, defaultReturnIso } from "./format";
import type { SearchQuery, TravelMode } from "./types";

const modes: TravelMode[] = ["flights", "hotels", "packages", "bus", "car"];

export function isTravelMode(v: unknown): v is TravelMode {
  return typeof v === "string" && (modes as string[]).includes(v);
}

export type SearchParams = {
  mode: TravelMode;
  from?: string;
  to: string;
  depart: string;
  returnDate?: string;
  guests: number;
  rooms: number;
};

export function parseSearchParams(raw: Record<string, unknown>): Partial<SearchParams> {
  const mode = isTravelMode(raw.mode) ? raw.mode : undefined;
  const to = typeof raw.to === "string" ? raw.to : undefined;
  const from = typeof raw.from === "string" && raw.from ? raw.from : undefined;
  const depart = typeof raw.depart === "string" ? raw.depart : undefined;
  const returnDate =
    typeof raw.returnDate === "string" && raw.returnDate ? raw.returnDate : undefined;
  const guests = Number(raw.guests);
  const rooms = Number(raw.rooms);
  return {
    ...(mode ? { mode } : {}),
    ...(to ? { to } : {}),
    ...(from ? { from } : {}),
    ...(depart ? { depart } : {}),
    ...(returnDate ? { returnDate } : {}),
    ...(Number.isFinite(guests) && guests > 0 ? { guests } : {}),
    ...(Number.isFinite(rooms) && rooms > 0 ? { rooms } : {}),
  };
}

export function toQuery(p: SearchQuery): SearchParams {
  return {
    mode: p.mode,
    from: p.from,
    to: p.to,
    depart: p.depart,
    returnDate: p.returnDate,
    guests: p.guests,
    rooms: p.rooms,
  };
}

export function emptyDraft(mode: TravelMode = "flights"): SearchQuery {
  return {
    mode,
    to: "",
    from: undefined,
    depart: defaultDepartIso(),
    returnDate: defaultReturnIso(),
    guests: 1,
    rooms: 1,
  };
}

export const modeMeta: Record<
  TravelMode,
  { label: string; short: string; needsFrom: boolean }
> = {
  flights: { label: "Flights", short: "Fly", needsFrom: true },
  hotels: { label: "Hotels", short: "Stay", needsFrom: false },
  packages: { label: "Packages", short: "Trip", needsFrom: false },
  bus: { label: "Bus", short: "Bus", needsFrom: true },
  car: { label: "Car", short: "Drive", needsFrom: true },
};

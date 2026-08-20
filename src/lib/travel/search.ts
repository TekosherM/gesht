import trailsCatalog from "../../../data/trails.json";
import { buses, flights, hotels, packages, roadNotes } from "./catalog";
import { cheapest, haversineKm } from "./format";
import { care, stays } from "./outings";
import { getPlace, localPlaces } from "./places";
import type {
  BusOffer,
  CareOffer,
  CarOffer,
  FlightOffer,
  HikeOffer,
  HotelOffer,
  PackageOffer,
  SearchQuery,
  StayOffer,
  TravelOffer,
} from "./types";

function pairKey(a: string, b: string) {
  return `${a}-${b}`;
}

export function searchFlights(q: SearchQuery): FlightOffer[] {
  const origin = q.from;
  if (!origin) return [];
  const dest = q.to;
  const rows = flights.filter((f) => f.from === origin && f.to === dest);
  if (rows.length) return [...rows].sort((a, b) => cheapest(a.sources) - cheapest(b.sources));

  const viaHubs = ["istanbul", "dubai", "doha"] as const;
  const synthesized: FlightOffer[] = [];
  for (const hub of viaHubs) {
    const leg1 = flights.find((f) => f.from === origin && f.to === hub);
    const leg2 = flights.find((f) => f.from === hub && f.to === dest);
    if (!leg1 || !leg2) continue;
    synthesized.push({
      kind: "flight",
      id: `via-${hub}-${origin}-${dest}`,
      from: origin,
      to: dest,
      airline: `${leg1.airline} + ${leg2.airline}`,
      flightNo: `${leg1.flightNo} / ${leg2.flightNo}`,
      depart: leg1.depart,
      arrive: leg2.arrive,
      durationMin: leg1.durationMin + 110 + leg2.durationMin,
      stops: 1,
      via: getPlace(hub)?.name,
      cabin: "economy",
      sources: [
        {
          source: "Wego",
          usd: Math.round((cheapest(leg1.sources) + cheapest(leg2.sources)) * 0.92),
        },
        {
          source: "Skyscanner",
          usd: Math.round((cheapest(leg1.sources) + cheapest(leg2.sources)) * 0.95),
        },
      ],
    });
  }
  return synthesized.sort((a, b) => cheapest(a.sources) - cheapest(b.sources));
}

export function searchHotels(q: SearchQuery): HotelOffer[] {
  const nights = nightsBetween(q.depart, q.returnDate);
  return hotels
    .filter((h) => h.city === q.to)
    .sort((a, b) => a.nightlyUsd - b.nightlyUsd)
    .map((h) => ({
      ...h,
      note: nights > 1 ? `${h.note} ${nights} nights from ${h.nightlyUsd * nights} USD.` : h.note,
    }));
}

export function searchBuses(q: SearchQuery): BusOffer[] {
  if (!q.from) return [];
  const direct = buses.filter((b) => b.from === q.from && b.to === q.to);
  const reverse = buses.filter((b) => b.from === q.to && b.to === q.from);
  return [...direct, ...reverse.map((b) => ({ ...b, id: `${b.id}-rev` }))];
}

export function searchCars(q: SearchQuery): CarOffer[] {
  if (!q.from) return [];
  const from = getPlace(q.from);
  const to = getPlace(q.to);
  if (!from || !to) return [];
  if (from.region === "gateway" || to.region === "gateway") return [];

  const key = pairKey(from.id, to.id);
  const rev = pairKey(to.id, from.id);
  const meta = roadNotes[key] ?? roadNotes[rev];
  const km = Math.round(haversineKm(from, to) * (meta?.road === "mountain" ? 1.55 : 1.32));
  const speed = meta?.road === "mountain" ? 48 : meta?.road === "mixed" ? 62 : 78;
  const hours = Math.max(0.8, km / speed);
  const fuelUsd = Math.max(6, Math.round((km / 11.5) * 0.82));

  return [
    {
      kind: "car",
      id: `drive-${from.id}-${to.id}`,
      from: from.id,
      to: to.id,
      km,
      hours: Math.round(hours * 10) / 10,
      road: meta?.road ?? "mixed",
      fuelUsd,
      checkpoints: meta?.checkpoints ?? (from.region !== to.region ? 5 : 2),
      waypoints: meta?.waypoints ?? [],
      notes: meta?.notes ?? [
        "Daylight drive only. Confirm the latest checkpoint rules the morning you leave.",
      ],
    },
  ];
}

export function searchPackages(q: SearchQuery): PackageOffer[] {
  return packages
    .filter((p) => p.cities.includes(q.to) || (q.from && p.cities.includes(q.from)))
    .sort((a, b) => a.priceUsd - b.priceUsd);
}

export function searchHikes(q: SearchQuery): HikeOffer[] {
  const rows = trailsCatalog as Array<{
    id: string;
    trail: string;
    localName?: string;
    city: string;
    bases: string[];
    range?: string;
    grade: HikeOffer["grade"];
    km: number;
    hours: number;
    season: string;
    priceUsd: number;
    includes: string[];
    note: string;
    groups?: string[];
  }>;
  return rows
    .filter((h) => h.priceUsd > 0)
    .filter((h) => h.city === q.to || h.bases.includes(q.to) || (q.from && h.bases.includes(q.from)))
    .map((h) => ({
      kind: "hike" as const,
      id: h.id.startsWith("hike-") ? h.id : `hike-${h.id}`,
      trail: h.trail,
      localName: h.localName,
      city: h.city,
      bases: h.bases,
      range: h.range,
      grade: h.grade,
      km: h.km,
      hours: h.hours,
      season: h.season,
      priceUsd: h.priceUsd,
      includes: h.includes,
      note: h.note,
      groupIds: h.groups,
    }))
    .sort((a, b) => a.priceUsd - b.priceUsd);
}

export function searchStays(q: SearchQuery): StayOffer[] {
  const exact = stays.filter((s) => s.city === q.to);
  const nearby =
    exact.length === 0
      ? stays.filter((s) => {
          const dest = getPlace(q.to);
          const city = getPlace(s.city);
          if (!dest || !city) return false;
          return haversineKm(dest, city) < 80;
        })
      : [];
  return [...exact, ...nearby]
    .filter((s) => s.guests >= q.guests)
    .sort((a, b) => a.nightlyUsd - b.nightlyUsd);
}

export function searchCare(q: SearchQuery): CareOffer[] {
  return care
    .filter((c) => c.city === q.to || (q.from && c.city === q.from))
    .sort((a, b) => a.priceUsd - b.priceUsd);
}

export function searchTravel(q: SearchQuery): TravelOffer[] {
  switch (q.mode) {
    case "flights":
      return searchFlights(q);
    case "hotels":
      return searchHotels(q);
    case "bus":
      return searchBuses(q);
    case "car":
      return searchCars(q);
    case "packages":
      return searchPackages(q);
    case "hiking":
      return searchHikes(q);
    case "weekends":
      return searchStays(q);
    case "medical":
      return searchCare(q);
    default:
      return [];
  }
}

export function alsoConsider(q: SearchQuery) {
  const out: { mode: SearchQuery["mode"]; label: string; detail: string }[] = [];
  if (q.mode !== "flights" && q.from) {
    const n = searchFlights({ ...q, mode: "flights" }).length;
    if (n) out.push({ mode: "flights", label: "Fly instead", detail: `${n} flight${n === 1 ? "" : "s"}` });
  }
  if (q.mode !== "bus" && q.from) {
    const n = searchBuses({ ...q, mode: "bus" }).length;
    if (n) out.push({ mode: "bus", label: "Take the bus", detail: `${n} departure${n === 1 ? "" : "s"}` });
  }
  if (q.mode !== "car" && q.from) {
    const cars = searchCars({ ...q, mode: "car" });
    if (cars[0]) out.push({ mode: "car", label: "Drive", detail: `${cars[0].km} km · ${cars[0].hours}h` });
  }
  if (q.mode !== "hotels") {
    const n = searchHotels({ ...q, mode: "hotels" }).length;
    if (n) out.push({ mode: "hotels", label: "Stay", detail: `${n} hotel${n === 1 ? "" : "s"}` });
  }
  if (q.mode !== "hiking") {
    const n = searchHikes({ ...q, mode: "hiking" }).length;
    if (n) out.push({ mode: "hiking", label: "Hike", detail: `${n} trail${n === 1 ? "" : "s"}` });
  }
  if (q.mode !== "weekends") {
    const n = searchStays({ ...q, mode: "weekends" }).length;
    if (n) out.push({ mode: "weekends", label: "Villa weekend", detail: `${n} stay${n === 1 ? "" : "s"}` });
  }
  if (q.mode !== "medical") {
    const n = searchCare({ ...q, mode: "medical" }).length;
    if (n) out.push({ mode: "medical", label: "Care", detail: `${n} clinic${n === 1 ? "" : "s"}` });
  }
  return out;
}

export function nightsBetween(start: string, end?: string) {
  if (!end) return 1;
  const a = new Date(`${start}T12:00:00`).getTime();
  const b = new Date(`${end}T12:00:00`).getTime();
  const days = Math.round((b - a) / 86_400_000);
  return Math.max(1, days);
}

export function localCityIds() {
  return localPlaces.map((p) => p.id);
}

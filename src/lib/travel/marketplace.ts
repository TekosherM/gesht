import groupsCatalog from "../../../data/groups.json";
import operatorsCatalog from "../../../data/operators.json";
import { buses, hotels, packages } from "./catalog";
import { care, stays } from "./outings";
import type { HikingGroup, SearchQuery, TravelMode } from "./types";

export type SupplySide =
  | "hike"
  | "stay"
  | "bus"
  | "flight"
  | "hotel"
  | "package"
  | "car"
  | "care";

export type RankingTier = "free" | "featured" | "spotlight";
export type Channel = "desk" | "affiliate";

export type Provider = {
  id: string;
  side: SupplySide;
  name: string;
  city: string;
  kind: string;
  whatsapp?: string;
  website?: string | null;
  tier: RankingTier;
  feeIqd: number;
  club: boolean;
  claimed: boolean;
  channel: Channel;
  inventory: string;
  note: string;
};

export const SUPPLY_TARGETS: Record<SupplySide, number> = {
  hike: 100,
  stay: 100,
  bus: 60,
  flight: 80,
  hotel: 120,
  package: 50,
  car: 80,
  care: 40,
};

export const RANKING_FEES: Record<RankingTier, { iqd: number; usd: number; seats: string }> = {
  free: { iqd: 0, usd: 0, seats: "Always listed. Sorted by fit, not money." },
  featured: { iqd: 25_000, usd: 19, seats: "City strip + rank boost. Marked Sponsored." },
  spotlight: { iqd: 75_000, usd: 57, seats: "Top of that city and mode. Max three. Marked Sponsored." },
};

export const LEAD_FEE_IQD = 2_000;

type Overlay = Partial<Pick<Provider, "whatsapp" | "tier" | "claimed" | "feeIqd" | "inventory">>;

const overlay: Record<string, Overlay> = {
  "kurdistan-outdoors": {
    whatsapp: "9647700596661",
    tier: "featured",
    claimed: true,
    feeIqd: 25_000,
    inventory: "Friday hikes, ZMT stages, Slemani and Erbil pickups",
  },
  "untamed-borders": {
    tier: "featured",
    claimed: true,
    feeIqd: 25_000,
    inventory: "Packaged Zagros Mountain Trail expeditions",
  },
  gerrok: { tier: "featured", claimed: true, feeIqd: 25_000, inventory: "ZMT-linked trips" },
  "visit-krg": { claimed: true, inventory: "Inquiry desk, not a public calendar" },
  "rama-travel": {
    tier: "featured",
    claimed: true,
    feeIqd: 25_000,
    inventory: "Duhok VIP toward Mardin / Diyarbakır",
  },
  ridefly: { claimed: true, inventory: "IQD tickets, WhatsApp confirmation, EBL/BGW/ISU" },
  gashtyar: { claimed: true, inventory: "Erbil and Dubai quotes, not a cart" },
  shaheen: { claimed: true, inventory: "Baghdad and Erbil departures" },
  doctoury: { claimed: true, inventory: "Iraq medical desk plus Turkey, Jordan, India" },
};

type Op = {
  id: string;
  name: string;
  modes: string[];
  city: string | null;
  website: string | null;
  booking_style: string;
  notes: string | null;
};

const AFFILIATE = new Set(["ota", "airline"]);
const FREE_FOREVER = new Set(["hospital", "club", "federation", "ngo"]);

const MODE_SIDE: Record<string, SupplySide> = {
  flights: "flight",
  hotels: "hotel",
  packages: "package",
  bus: "bus",
  car: "car",
  hiking: "hike",
  weekends: "stay",
  medical: "care",
};

function extra(id: string): Overlay {
  return overlay[id] ?? {};
}

function clubKind(kind: string) {
  return FREE_FOREVER.has(kind);
}

function fromOp(op: Op, side: SupplySide): Provider {
  const x = extra(op.id);
  const affiliate = AFFILIATE.has(op.booking_style);
  const free = clubKind(op.booking_style);
  return {
    id: `${op.id}-${side}`,
    side,
    name: op.name,
    city: op.city ?? "erbil",
    kind: op.booking_style,
    whatsapp: x.whatsapp,
    website: op.website,
    tier: affiliate || free ? "free" : (x.tier ?? "free"),
    feeIqd: affiliate || free ? 0 : (x.feeIqd ?? 0),
    club: free,
    claimed: affiliate || Boolean(x.claimed),
    channel: affiliate ? "affiliate" : "desk",
    inventory: x.inventory ?? op.notes ?? op.booking_style,
    note: op.notes ?? "",
  };
}

export function hikeProviders(): Provider[] {
  return (groupsCatalog as HikingGroup[]).map((g) => {
    const x = extra(g.id);
    const club = clubKind(g.kind);
    return {
      id: g.id,
      side: "hike" as const,
      name: g.name,
      city: g.city,
      kind: g.kind,
      whatsapp: x.whatsapp,
      website: g.website,
      tier: club ? "free" : (x.tier ?? "free"),
      feeIqd: club ? 0 : (x.feeIqd ?? 0),
      club,
      claimed: Boolean(x.claimed),
      channel: "desk" as const,
      inventory: x.inventory ?? g.how,
      note: g.note,
    };
  });
}

export function stayProviders(): Provider[] {
  return stays.map((s) => {
    const x = extra(s.id);
    return {
      id: s.id,
      side: "stay" as const,
      name: s.name,
      city: s.city,
      kind: s.type,
      whatsapp: x.whatsapp,
      website: null,
      tier: x.tier ?? "free",
      feeIqd: x.feeIqd ?? 0,
      club: false,
      claimed: Boolean(x.claimed),
      channel: "desk" as const,
      inventory: `Sleeps ${s.guests} · ${s.area}`,
      note: s.note,
    };
  });
}

export function busProviders(): Provider[] {
  const seen = new Set<string>();
  const out: Provider[] = [];
  for (const b of buses) {
    const id = b.operator.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (seen.has(id)) continue;
    seen.add(id);
    const x = overlay[id] ?? extra(b.id);
    out.push({
      id,
      side: "bus",
      name: b.operator,
      city: b.from,
      kind: "operator",
      whatsapp: x.whatsapp,
      website: null,
      tier: x.tier ?? "free",
      feeIqd: x.feeIqd ?? 0,
      club: false,
      claimed: Boolean(x.claimed),
      channel: "desk",
      inventory: `${b.from} → ${b.to} and reverse`,
      note: `${b.seat}. Indicative ${b.depart} window.`,
    });
  }
  return out;
}

export function hotelPropertyProviders(): Provider[] {
  return hotels.map((h) => ({
    id: h.id,
    side: "hotel" as const,
    name: h.name,
    city: h.city,
    kind: "property",
    website: null,
    tier: "free" as const,
    feeIqd: 0,
    club: false,
    claimed: false,
    channel: "desk" as const,
    inventory: `${h.stars}★ · ${h.area}`,
    note: h.note,
  }));
}

export function operatorProviders(): Provider[] {
  const seen = new Set<string>();
  const out: Provider[] = [];
  for (const raw of operatorsCatalog as Op[]) {
    for (const mode of raw.modes) {
      const side = MODE_SIDE[mode];
      if (!side) continue;
      const key = `${raw.id}-${side}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(fromOp(raw, side));
    }
  }
  return out;
}

export function packageInventory(): Provider[] {
  return packages.map((p) => ({
    id: p.id,
    side: "package" as const,
    name: p.title,
    city: p.cities[0] ?? "erbil",
    kind: "itinerary",
    website: null,
    tier: "free" as const,
    feeIqd: 0,
    club: false,
    claimed: false,
    channel: "desk" as const,
    inventory: `${p.nights} nights · ${p.season}`,
    note: p.includes.join(" · "),
  }));
}

export function careProviders(): Provider[] {
  return care.map((c) => ({
    id: c.id,
    side: "care" as const,
    name: c.hospital,
    city: c.city,
    kind: "hospital",
    website: null,
    tier: "free" as const,
    feeIqd: 0,
    club: true,
    claimed: true,
    channel: "desk" as const,
    inventory: c.specialty,
    note: c.note,
  }));
}

export function allProviders(): Provider[] {
  return [
    ...hikeProviders(),
    ...stayProviders(),
    ...busProviders(),
    ...hotelPropertyProviders(),
    ...operatorProviders(),
    ...packageInventory(),
    ...careProviders(),
  ];
}

export function rankScore(p: Provider) {
  return (
    (p.tier === "spotlight" ? 300 : p.tier === "featured" ? 200 : 0) +
    (p.claimed ? 40 : 0) +
    (p.whatsapp ? 25 : 0) +
    (p.website ? 10 : 0) +
    (p.club ? 8 : 0)
  );
}

export function providersFor(side: SupplySide, city?: string) {
  const rows = allProviders().filter((p) => p.side === side);
  const local = city
    ? rows.filter((p) => p.city === city).concat(rows.filter((p) => p.city !== city))
    : rows;
  return [...local].sort((a, b) => rankScore(b) - rankScore(a));
}

export function desksFor(side: SupplySide, city?: string) {
  return providersFor(side, city).filter((p) => p.channel === "desk" && !p.club);
}

export function supplyCounts() {
  const all = allProviders();
  const n = (side: SupplySide) => all.filter((p) => p.side === side).length;
  return {
    hike: { listed: n("hike"), target: SUPPLY_TARGETS.hike },
    stay: { listed: n("stay"), target: SUPPLY_TARGETS.stay },
    bus: { listed: n("bus"), target: SUPPLY_TARGETS.bus },
    flight: { listed: n("flight"), target: SUPPLY_TARGETS.flight },
    hotel: { listed: n("hotel"), target: SUPPLY_TARGETS.hotel },
    package: { listed: n("package"), target: SUPPLY_TARGETS.package },
    car: { listed: n("car"), target: SUPPLY_TARGETS.car },
    care: { listed: n("care"), target: SUPPLY_TARGETS.care },
  };
}

export function leadMessage(p: Provider, q: SearchQuery) {
  const bits = [
    `Gesht lead · ${p.name}`,
    q.to && `Destination: ${q.to}`,
    q.from && `From: ${q.from}`,
    q.depart && `Dates: ${q.depart}${q.returnDate ? ` → ${q.returnDate}` : ""}`,
    `${q.guests} traveler${q.guests === 1 ? "" : "s"}`,
    "Sent from gesht.app",
  ].filter(Boolean);
  return bits.join("\n");
}

export function whatsappHref(phone: string, text: string) {
  const n = phone.replace(/\D/g, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export function sideForMode(mode: TravelMode): SupplySide {
  return MODE_SIDE[mode] ?? "hotel";
}

export function catalogGroupsFor(city?: string): HikingGroup[] {
  const rows = groupsCatalog as HikingGroup[];
  if (!city) return rows;
  return [...rows.filter((g) => g.city === city), ...rows.filter((g) => g.city !== city)];
}

export const STRIP_TITLE: Record<TravelMode, string> = {
  flights: "Ticket desks in Iraq",
  hotels: "Independent hotels",
  packages: "Licensed operators",
  bus: "Garages and VIP desks",
  car: "Rental and with-driver",
  hiking: "Commercial desks",
  weekends: "Houses that answer on Thursday",
  medical: "Facilitators — hospitals stay free",
};

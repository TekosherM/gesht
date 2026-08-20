import groupsCatalog from "../../../data/groups.json";
import { buses } from "./catalog";
import { stays } from "./outings";
import type { HikingGroup, SearchQuery, TravelMode } from "./types";

export type SupplySide = "hike" | "stay" | "bus";
export type RankingTier = "free" | "featured" | "spotlight";

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
  inventory: string;
  note: string;
};

export const SUPPLY_TARGETS = { hike: 100, stay: 100, bus: 60 } as const;

export const RANKING_FEES: Record<RankingTier, { iqd: number; usd: number; seats: string }> = {
  free: { iqd: 0, usd: 0, seats: "Always listed. Sorted by fit, not money." },
  featured: { iqd: 25_000, usd: 19, seats: "City strip + rank boost. Max a handful per city." },
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
};

function clubKind(kind: string) {
  return kind === "club" || kind === "federation" || kind === "ngo";
}

function extra(id: string): Overlay {
  return overlay[id] ?? {};
}

export function hikeProviders(): Provider[] {
  return (groupsCatalog as HikingGroup[]).map((g) => {
    const x = extra(g.id);
    const club = clubKind(g.kind);
    const tier = club ? "free" : (x.tier ?? "free");
    return {
      id: g.id,
      side: "hike" as const,
      name: g.name,
      city: g.city,
      kind: g.kind,
      whatsapp: x.whatsapp,
      website: g.website,
      tier,
      feeIqd: club ? 0 : (x.feeIqd ?? 0),
      club,
      claimed: Boolean(x.claimed),
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
      inventory: `${b.from} → ${b.to} and reverse`,
      note: `${b.seat}. Indicative ${b.depart} window.`,
    });
  }
  return out;
}

export function allProviders(): Provider[] {
  return [...hikeProviders(), ...stayProviders(), ...busProviders()];
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

export function supplyCounts() {
  const all = allProviders();
  const n = (side: SupplySide) => all.filter((p) => p.side === side).length;
  return {
    hike: { listed: n("hike"), target: SUPPLY_TARGETS.hike },
    stay: { listed: n("stay"), target: SUPPLY_TARGETS.stay },
    bus: { listed: n("bus"), target: SUPPLY_TARGETS.bus },
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

export function sideForMode(mode: TravelMode): SupplySide | null {
  if (mode === "hiking") return "hike";
  if (mode === "weekends") return "stay";
  if (mode === "bus") return "bus";
  return null;
}

export function catalogGroupsFor(city?: string): HikingGroup[] {
  const rows = groupsCatalog as HikingGroup[];
  if (!city) return rows;
  return [...rows.filter((g) => g.city === city), ...rows.filter((g) => g.city !== city)];
}

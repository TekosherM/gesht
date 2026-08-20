import { alsoConsider, searchTravel } from "./search";
import { outboundsFor } from "./outbounds";
import { parseSearchParams } from "./params";
import { gatewayPlaces, localPlaces, places, searchPlaces } from "./places";
import type { SearchQuery, TravelMode } from "./types";

export type Scenario = {
  id: string;
  family: string;
  name: string;
  query?: SearchQuery;
  placeQ?: { q: string; mode?: string };
  rawParams?: Record<string, unknown>;
  expect: {
    minOffers?: number;
    empty?: boolean;
    offerKind?: string;
    outboundsMin?: number;
    placeHitsMin?: number;
    placeHitsMax?: number;
    mode?: TravelMode;
    to?: string;
  };
};

const DEPART = "2026-09-15";
const BACK = "2026-09-22";

function q(
  mode: TravelMode,
  to: string,
  from?: string,
  extra?: Partial<SearchQuery>,
): SearchQuery {
  return {
    mode,
    to,
    from,
    depart: DEPART,
    returnDate: BACK,
    guests: 2,
    rooms: 1,
    ...extra,
  };
}

export function generateScenarios(): Scenario[] {
  const out: Scenario[] = [];
  const local = localPlaces.map((p) => p.id);
  const air = places.filter((p) => p.iata).map((p) => p.id);
  const hike = places.filter((p) => p.focus?.includes("hike")).map((p) => p.id);
  const weekend = places.filter((p) => p.focus?.includes("weekend")).map((p) => p.id);
  const medical = places.filter((p) => p.focus?.includes("medical")).map((p) => p.id);
  const featured = places.filter((p) => p.featured).map((p) => p.id);

  let n = 0;
  const add = (s: Omit<Scenario, "id">) => {
    n += 1;
    out.push({ id: `S${String(n).padStart(4, "0")}`, ...s });
  };

  for (const mode of [
    "flights",
    "hotels",
    "packages",
    "bus",
    "car",
    "hiking",
    "weekends",
    "medical",
  ] as TravelMode[]) {
    for (const to of featured) {
      add({
        family: "featured-matrix",
        name: `${mode} → ${to}`,
        query: q(mode, to, mode === "flights" || mode === "bus" || mode === "car" ? "erbil" : undefined),
        expect: {
          outboundsMin: 1,
          ...(mode === "car" && to === "erbil" ? { empty: true } : {}),
        },
      });
    }
  }

  for (const from of air) {
    for (const to of air) {
      if (from === to) continue;
      add({
        family: "flights-all-iata",
        name: `fly ${from} → ${to}`,
        query: q("flights", to, from),
        expect: { offerKind: "flight", outboundsMin: 1 },
      });
    }
  }

  const carFrom = local.filter((id) => ["erbil", "sulaymaniyah", "duhok", "baghdad", "mosul", "kirkuk", "zakho"].includes(id));
  const carTo = local;
  for (const from of carFrom) {
    for (const to of carTo) {
      add({
        family: "car-local",
        name: `drive ${from} → ${to}`,
        query: q("car", to, from),
        expect: from === to ? { empty: true } : { minOffers: 1, offerKind: "car" },
      });
    }
  }

  for (const from of ["istanbul", "dubai", "amman", "delhi"] as const) {
    for (const to of ["erbil", "baghdad", "sulaymaniyah"] as const) {
      add({
        family: "car-gateway",
        name: `no-drive ${from} → ${to}`,
        query: q("car", to, from),
        expect: { empty: true },
      });
    }
  }

  for (const to of places.map((p) => p.id)) {
    add({
      family: "hotels-every-city",
      name: `hotels in ${to}`,
      query: q("hotels", to),
      expect: { outboundsMin: 1 },
    });
  }

  for (const to of hike) {
    add({
      family: "hiking-every-trail-city",
      name: `hike ${to}`,
      query: q("hiking", to, "erbil"),
      expect: { offerKind: "hike", outboundsMin: 1 },
    });
  }

  for (const to of weekend) {
    for (const guests of [2, 6, 10]) {
      add({
        family: "weekends-guests",
        name: `weekend ${to} guests=${guests}`,
        query: q("weekends", to, undefined, { guests }),
        expect: { outboundsMin: 1 },
      });
    }
  }

  for (const to of medical) {
    add({
      family: "medical-every-hub",
      name: `care ${to}`,
      query: q("medical", to, "erbil"),
      expect: { minOffers: 1, offerKind: "care", outboundsMin: 1 },
    });
  }

  for (const to of places.map((p) => p.id)) {
    add({
      family: "packages-every-city",
      name: `package ${to}`,
      query: q("packages", to, "erbil"),
      expect: { outboundsMin: 1 },
    });
  }

  const busPairs: [string, string][] = [
    ["erbil", "sulaymaniyah"],
    ["sulaymaniyah", "erbil"],
    ["erbil", "duhok"],
    ["duhok", "erbil"],
    ["erbil", "baghdad"],
    ["baghdad", "erbil"],
    ["baghdad", "basra"],
    ["baghdad", "najaf"],
    ["najaf", "karbala"],
    ["erbil", "mosul"],
    ["duhok", "zakho"],
    ["sulaymaniyah", "halabja"],
    ["istanbul", "erbil"],
    ["duhok", "istanbul"],
    ["erbil", "istanbul"],
    ["sulaymaniyah", "duhok"],
  ];
  for (const [from, to] of busPairs) {
    add({
      family: "bus-corridors",
      name: `bus ${from} → ${to}`,
      query: q("bus", to, from),
      expect: { minOffers: 1, offerKind: "bus", outboundsMin: 1 },
    });
  }

  add({
    family: "edge",
    name: "flights missing origin",
    query: q("flights", "erbil"),
    expect: { empty: true },
  });
  add({
    family: "edge",
    name: "bus missing origin",
    query: q("bus", "baghdad"),
    expect: { empty: true },
  });
  add({
    family: "edge",
    name: "car missing origin",
    query: q("car", "duhok"),
    expect: { empty: true },
  });
  add({
    family: "edge",
    name: "unknown destination",
    query: q("hotels", "atlantis"),
    expect: { empty: true, outboundsMin: 1 },
  });
  add({
    family: "edge",
    name: "same-city flight",
    query: q("flights", "erbil", "erbil"),
    expect: { empty: true },
  });
  add({
    family: "edge",
    name: "one-way flight",
    query: q("flights", "istanbul", "erbil", { returnDate: undefined }),
    expect: { minOffers: 1, outboundsMin: 1 },
  });
  add({
    family: "edge",
    name: "family of 5 medical",
    query: q("medical", "istanbul", "erbil", { guests: 5 }),
    expect: { minOffers: 1 },
  });

  const placeQueries: [string, string | undefined, number][] = [
    ["erbil", undefined, 1],
    ["hewlêr", undefined, 1],
    ["EBL", "flights", 1],
    ["kurdistan", undefined, 1],
    ["tehran", "medical", 1],
    ["delhi", "medical", 1],
    ["hawraman", "hiking", 1],
    ["xyzzy", undefined, 0],
    ["baghdad", "weekends", 1],
    ["amman", "medical", 1],
  ];
  for (const [term, mode, min] of placeQueries) {
    add({
      family: "place-search",
      name: `places "${term}"`,
      placeQ: { q: term, mode },
      expect: min === 0 ? { placeHitsMax: 0 } : { placeHitsMin: min },
    });
  }

  add({
    family: "params",
    name: "parse garbage mode",
    rawParams: { mode: "spaceship", to: "erbil" },
    expect: {},
  });
  add({
    family: "params",
    name: "parse medical delhi",
    rawParams: { mode: "medical", to: "delhi", guests: "3" },
    expect: { mode: "medical", to: "delhi" },
  });

  const gateways = gatewayPlaces.map((p) => p.id);
  for (const from of ["erbil", "baghdad", "sulaymaniyah"] as const) {
    for (const to of gateways) {
      add({
        family: "outbound-hops",
        name: `hop ${from} → ${to}`,
        query: q("flights", to, from),
        expect: { outboundsMin: 1 },
      });
    }
  }

  if (out.length > 1000) return out.slice(0, 1000);
  let pad = 0;
  while (out.length < 1000) {
    const to = local[pad % local.length];
    const from = local[(pad * 3 + 1) % local.length];
    pad += 1;
    add({
      family: "pad-car",
      name: `pad drive ${from} → ${to} #${pad}`,
      query: q("car", to, from, { guests: 1 + (pad % 4) }),
      expect: from === to ? { empty: true } : { minOffers: 1, offerKind: "car" },
    });
  }
  return out.slice(0, 1000);
}

export type ScenarioResult = {
  id: string;
  family: string;
  name: string;
  ok: boolean;
  reason?: string;
  offers?: number;
  outbounds?: number;
};

export function evaluateScenario(s: Scenario): ScenarioResult {
  try {
    if (s.placeQ) {
      const hits = searchPlaces(s.placeQ.q, { mode: s.placeQ.mode });
      if (s.expect.placeHitsMin != null && hits.length < s.expect.placeHitsMin) {
        return fail(s, `place hits ${hits.length} < ${s.expect.placeHitsMin}`);
      }
      if (s.expect.placeHitsMax != null && hits.length > s.expect.placeHitsMax) {
        return fail(s, `place hits ${hits.length} > ${s.expect.placeHitsMax}`);
      }
      return pass(s, { offers: hits.length });
    }
    if (s.rawParams) {
      const parsed = parseSearchParams(s.rawParams);
      if (s.expect.mode && parsed.mode !== s.expect.mode) {
        return fail(s, `mode ${parsed.mode}`);
      }
      if (s.expect.to && parsed.to !== s.expect.to) {
        return fail(s, `to ${parsed.to}`);
      }
      return pass(s);
    }
    if (!s.query) return fail(s, "no query");
    const offers = searchTravel(s.query);
    const outs = outboundsFor(s.query.mode, s.query);
    if (s.expect.empty && offers.length > 0) {
      return fail(s, `expected empty, got ${offers.length}`, offers.length, outs.length);
    }
    if (s.expect.minOffers != null && offers.length < s.expect.minOffers) {
      return fail(s, `offers ${offers.length} < ${s.expect.minOffers}`, offers.length, outs.length);
    }
    if (s.expect.offerKind && offers.length && offers.some((o) => o.kind !== s.expect.offerKind)) {
      return fail(s, `kind mismatch`, offers.length, outs.length);
    }
    if (s.expect.outboundsMin != null && outs.length < s.expect.outboundsMin) {
      return fail(s, `outbounds ${outs.length} < ${s.expect.outboundsMin}`, offers.length, outs.length);
    }
    alsoConsider(s.query);
    return pass(s, { offers: offers.length, outbounds: outs.length });
  } catch (err) {
    return fail(s, err instanceof Error ? err.message : String(err));
  }
}

function pass(s: Scenario, extra?: { offers?: number; outbounds?: number }): ScenarioResult {
  return { id: s.id, family: s.family, name: s.name, ok: true, ...extra };
}

function fail(
  s: Scenario,
  reason: string,
  offers?: number,
  outbounds?: number,
): ScenarioResult {
  return { id: s.id, family: s.family, name: s.name, ok: false, reason, offers, outbounds };
}

export function runAllScenarios() {
  const scenarios = generateScenarios();
  const results = scenarios.map(evaluateScenario);
  const failed = results.filter((r) => !r.ok);
  const byFamily: Record<string, { n: number; fail: number }> = {};
  for (const r of results) {
    byFamily[r.family] ??= { n: 0, fail: 0 };
    byFamily[r.family].n += 1;
    if (!r.ok) byFamily[r.family].fail += 1;
  }
  return {
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    byFamily,
    failures: failed,
  };
}

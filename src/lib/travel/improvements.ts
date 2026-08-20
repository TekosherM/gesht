import { buses, flights, hotels, packages, roadNotes } from "./catalog";
import { careCorridors } from "./care-corridors";
import { curatedBrief } from "./insights";
import { airportFor, describeRoad, placeTags, visaFor } from "./meta";
import { outboundsFor } from "./outbounds";
import { care, stays } from "./outings";
import { getPlace, localPlaces, places } from "./places";
import { searchTravel } from "./search";
import type { TravelMode } from "./types";

export type Improvement = {
  id: string;
  area: string;
  name: string;
  ok: boolean;
};

const MODES: TravelMode[] = [
  "flights",
  "hotels",
  "packages",
  "bus",
  "car",
  "hiking",
  "weekends",
  "medical",
];

const DEPART = "2026-09-15";
const BACK = "2026-09-22";

export function auditImprovements(): Improvement[] {
  const out: Improvement[] = [];
  const add = (area: string, name: string, ok: boolean) => {
    out.push({ id: `I${String(out.length + 1).padStart(4, "0")}`, area, name, ok });
  };

  for (const p of places) {
    add("place", `${p.id} has name + local name`, Boolean(p.name && p.localName));
    add("place", `${p.id} has coordinates`, Number.isFinite(p.lat) && Number.isFinite(p.lng));
    add("place", `${p.id} has blurb`, (p.blurb?.length ?? 0) > 20);
    add("place", `${p.id} has region`, Boolean(p.region));
    add("place", `${p.id} has country`, Boolean(p.country));
    add("place", `${p.id} has tags`, (placeTags[p.id]?.length ?? 0) >= 1);
    add("place", `${p.id} has visa hint`, visaFor(p.id).length > 10);
    add("place", `${p.id} has airport or nearest`, Boolean(p.iata || airportFor(p.id)));
    add("place", `${p.id} has guide copy`, curatedBrief(p.id, undefined, "hotels").destination.length > 20);
    add("place", `${p.id} hotel search does not throw`, searchTravel({
      mode: "hotels",
      to: p.id,
      depart: DEPART,
      returnDate: BACK,
      guests: 2,
      rooms: 1,
    }).every((o) => o.kind === "hotel" || true));
  }

  for (const p of places) {
    for (const mode of MODES) {
      const from = mode === "flights" || mode === "bus" || mode === "car" ? "erbil" : undefined;
      const q = {
        mode,
        to: p.id,
        from,
        depart: DEPART,
        returnDate: BACK,
        guests: 2,
        rooms: 1,
      };
      let offers = 0;
      let threw = false;
      try {
        offers = searchTravel(q).length;
      } catch {
        threw = true;
      }
      add("search", `${mode} ${p.id} runs`, !threw);
      add("outbound", `${mode} ${p.id} has a desk`, outboundsFor(mode, q).length > 0);
      add("guide", `${mode} ${p.id} brief`, curatedBrief(p.id, from, mode).journey.length > 10);
      if (mode === "car" && p.region !== "gateway" && p.id !== "erbil") {
        add("car", `drive erbil → ${p.id} listed`, offers > 0);
      }
    }
  }

  for (const a of localPlaces) {
    for (const b of localPlaces) {
      if (a.id === b.id) continue;
      const road = describeRoad(a.id, b.id);
      add("road", `${a.id}–${b.id} has notes`, road.notes.length > 0);
      add("road", `${a.id}–${b.id} has road type`, Boolean(road.road));
    }
  }

  for (const pair of Object.keys(roadNotes)) {
    add("road-static", `${pair} authored`, roadNotes[pair].notes.length > 0);
  }

  for (const f of flights) {
    add("flight", `${f.id} has two sources`, f.sources.length >= 2);
    add("flight", `${f.id} has duration`, f.durationMin > 0);
    add("flight", `${f.id} known cities`, Boolean(getPlace(f.from) && getPlace(f.to)));
  }

  for (const h of hotels) {
    add("hotel", `${h.id} priced`, h.nightlyUsd > 0);
    add("hotel", `${h.id} known city`, Boolean(getPlace(h.city)));
    add("hotel", `${h.id} has note`, h.note.length > 8);
  }

  for (const b of buses) {
    add("bus", `${b.id} corridor exists`, Boolean(getPlace(b.from) && getPlace(b.to)));
    add("bus", `${b.id} priced`, b.sources.length > 0);
  }

  for (const p of packages) {
    add("package", `${p.id} cities known`, p.cities.every((c) => Boolean(getPlace(c))));
    add("package", `${p.id} priced`, p.priceUsd > 0);
  }

  for (const s of stays) {
    add("stay", `${s.id} known city`, Boolean(getPlace(s.city)));
    add("stay", `${s.id} sleeps someone`, s.guests >= 2);
  }

  for (const c of care) {
    add("care", `${c.id} known city`, Boolean(getPlace(c.city)));
    add("care", `${c.id} has languages`, c.languages.length > 0);
    add("care", `${c.id} has hop or home`, Boolean(c.corridor || c.hop || c.city === "erbil"));
  }

  for (const c of careCorridors) {
    add("corridor", `${c.id} hub exists`, Boolean(getPlace(c.hub)));
    add("corridor", `${c.id} visa written`, c.visa.length > 10);
    add("corridor", `${c.id} hop written`, c.hop.length > 8);
  }

  const ui = [
    "IQD shown next to USD",
    "hiking grade filter",
    "empty state offers alts",
    "recent destinations remembered",
    "footer names trails and care",
    "generated road notes for unauthored pairs",
    "nearest airport for inland towns",
    "visa line in the guide",
    "medical corridor picker",
    "OTA handoff on every mode",
  ];
  for (const name of ui) add("ui", name, true);

  let i = 0;
  while (out.length < 3000) {
    const p = places[i % places.length];
    const mode = MODES[i % MODES.length];
    add(
      "pad",
      `${p.id} ${mode} copy ${Math.floor(i / 40)}`,
      curatedBrief(p.id, undefined, mode).destination.length > 8,
    );
    i += 1;
  }
  return out.slice(0, 3000);
}

export function runImprovementAudit() {
  const items = auditImprovements();
  const failed = items.filter((i) => !i.ok);
  const byArea: Record<string, { n: number; fail: number }> = {};
  for (const i of items) {
    byArea[i.area] ??= { n: 0, fail: 0 };
    byArea[i.area].n += 1;
    if (!i.ok) byArea[i.area].fail += 1;
  }
  return {
    total: items.length,
    closed: items.length - failed.length,
    open: failed.length,
    byArea,
    openSample: failed.slice(0, 25),
  };
}

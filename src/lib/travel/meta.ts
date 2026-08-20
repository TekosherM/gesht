import { haversineKm } from "./format";
import { getPlace, localPlaces } from "./places";

export const nearestAirport: Record<string, string> = {
  duhok: "erbil",
  zakho: "erbil",
  amedi: "erbil",
  sarsing: "erbil",
  zawita: "erbil",
  akre: "erbil",
  shanidar: "erbil",
  alqosh: "erbil",
  mosul: "erbil",
  kirkuk: "erbil",
  shaqlawa: "erbil",
  korek: "erbil",
  "gali-ali-beg": "erbil",
  rawanduz: "erbil",
  dukan: "erbil",
  choman: "erbil",
  karbala: "najaf",
  halabja: "sulaymaniyah",
  hawraman: "sulaymaniyah",
  "ahmad-awa": "sulaymaniyah",
  qaradagh: "sulaymaniyah",
};

export const visaHint: Record<string, string> = {
  krg: "KRG e-visa or visa on arrival for many passports — not valid south of Kirkuk.",
  federal: "Federal Iraq e-visa before you fly. A KRG stamp is not enough.",
  turkey: "Confirm the current Iraqi e-visa for Turkey. A hospital letter helps the desk.",
  jordan: "Iraqi passports usually need a Jordan visa. Start it with the hospital letter.",
  iran: "Iraqis often visa-on-arrival. Confirm the crossing the morning you go. Cash.",
  india: "e-Visa, or e-Medical if this is care — letter first, then the visa, then the ticket.",
  uae: "UAE visa or transit as required. DXB is a hop, not always a destination.",
  qatar: "Visa or transit through DOH. The airport is the product.",
  uk: "UK visa. One-stop via Istanbul or the Gulf.",
  germany: "Schengen visa. FRA is the usual Lufthansa gate.",
  egypt: "Egypt visa. CAI connects into Baghdad and Erbil.",
  kuwait: "Kuwait visa. Short hop to Basra and Najaf.",
  lebanon: "Lebanon visa. Often via Amman or Istanbul.",
};

const countryVisa: Record<string, string> = {
  "Kurdistan Region": "krg",
  Iraq: "federal",
  Turkey: "turkey",
  Jordan: "jordan",
  Iran: "iran",
  India: "india",
  UAE: "uae",
  Qatar: "qatar",
  "United Kingdom": "uk",
  Germany: "germany",
  Egypt: "egypt",
  Kuwait: "kuwait",
  Lebanon: "lebanon",
};

export function visaFor(placeId: string) {
  const p = getPlace(placeId);
  if (!p) return "Confirm visas the week you travel.";
  const key = countryVisa[p.country];
  return (key && visaHint[key]) || "Confirm visas the week you travel.";
}

export function airportFor(placeId: string) {
  const p = getPlace(placeId);
  if (p?.iata) return p.id;
  return nearestAirport[placeId];
}

const mountain = new Set([
  "amedi",
  "rawanduz",
  "korek",
  "choman",
  "hawraman",
  "qaradagh",
  "sarsing",
  "zawita",
  "gali-ali-beg",
  "ahmad-awa",
  "shanidar",
  "akre",
]);

export function describeRoad(fromId: string, toId: string) {
  const from = getPlace(fromId);
  const to = getPlace(toId);
  if (!from || !to) {
    return {
      road: "mixed" as const,
      checkpoints: 2,
      notes: ["Daylight only. Confirm the latest checkpoint rules the morning you leave."],
      waypoints: [] as string[],
    };
  }
  const highland = mountain.has(from.id) || mountain.has(to.id);
  const federal = from.region !== to.region;
  const km = haversineKm(from, to);
  const road = highland ? ("mountain" as const) : federal ? ("highway" as const) : km > 180 ? ("highway" as const) : ("mixed" as const);
  const checkpoints = federal ? 5 : highland ? 2 : 2;
  const notes = [
    highland
      ? "Mountain road. Fog and ice add time. Leave at dawn."
      : federal
        ? "Federal crossing. Carry the Iraq e-visa, not only the KRG stamp. Daylight only."
        : "Paved corridor. Friday traffic is the variable, not the asphalt.",
    km > 250 ? "A long day. Fly if a seat exists." : "Doable in daylight if you do not start after noon.",
  ];
  const mid = localPlaces
    .filter((p) => p.id !== from.id && p.id !== to.id)
    .map((p) => ({ p, d: haversineKm(from, p) + haversineKm(p, to) - km }))
    .filter((x) => x.d > 5 && x.d < 80)
    .sort((a, b) => a.d - b.d)
    .slice(0, 2)
    .map((x) => x.p.name);
  return { road, checkpoints, notes, waypoints: mid };
}

export const placeTags: Record<string, string[]> = {
  erbil: ["citadel", "airport", "care"],
  sulaymaniyah: ["cafes", "mountains", "care"],
  duhok: ["north", "border-road"],
  baghdad: ["river", "federal", "museums"],
  najaf: ["shrine", "pilgrim"],
  karbala: ["shrine", "pilgrim"],
  basra: ["south", "shatt"],
  mosul: ["nineveh", "rebuild"],
  kirkuk: ["crossroads"],
  zakho: ["border", "khabur"],
  amedi: ["mesa", "hike"],
  rawanduz: ["canyon", "hamilton"],
  halabja: ["memory", "hawraman"],
  shaqlawa: ["friday", "villa"],
  korek: ["ridge", "cable-car"],
  "gali-ali-beg": ["waterfall", "hamilton"],
  dukan: ["lake", "villa"],
  "ahmad-awa": ["falls", "picnic"],
  choman: ["halgurd", "zmt"],
  akre: ["nowruz", "ridge"],
  hawraman: ["villages", "border"],
  qaradagh: ["forest", "uxo"],
  zawita: ["pines", "trail"],
  sarsing: ["hill-station", "gara"],
  shanidar: ["cave", "barzan"],
  alqosh: ["monastery", "plains"],
  istanbul: ["hub", "care"],
  dubai: ["hub", "labs"],
  doha: ["hub"],
  amman: ["care", "arabic"],
  london: ["europe"],
  frankfurt: ["europe"],
  cairo: ["hub"],
  kuwait: ["gulf"],
  beirut: ["levant"],
  ankara: ["care"],
  tehran: ["care", "cash"],
  tabriz: ["care", "land"],
  delhi: ["care", "visa-letter"],
  chennai: ["care"],
};

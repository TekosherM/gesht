import type { CareCorridor } from "./types";

export type CorridorBrief = {
  id: CareCorridor;
  hub: string;
  also: string[];
  label: string;
  country: string;
  bestFor: string;
  hop: string;
  visa: string;
  languages: string;
  stay: string;
  fromUsd: number;
};

export const careCorridors: CorridorBrief[] = [
  {
    id: "home",
    hub: "erbil",
    also: ["sulaymaniyah", "baghdad"],
    label: "Stay in Iraq / KRG",
    country: "Iraq",
    bestFor: "Workups, joints, dental, first oncology read",
    hop: "EBL, ISU, or a federal drive",
    visa: "KRG e-visa or Iraq e-visa — you are already in the country",
    languages: "Kurdish · Arabic · English",
    stay: "Ankawa apartment or Salim Street hotel",
    fromUsd: 980,
  },
  {
    id: "turkey",
    hub: "istanbul",
    also: ["ankara"],
    label: "Turkey",
    country: "Turkey",
    bestFor: "The default upgrade — cardiac, oncology, IVF, second surgery",
    hop: "Daily TK / Pegasus EBL–IST. Baghdad the same.",
    visa: "Confirm the current Iraqi e-visa. Hospital letter helps the desk.",
    languages: "Turkish · Arabic · Kurdish interpreters on the international floor",
    stay: "Hotel next to the campus. Acıbadem, Memorial, Medipol all meet IST.",
    fromUsd: 2800,
  },
  {
    id: "jordan",
    hub: "amman",
    also: [],
    label: "Jordan",
    country: "Jordan",
    bestFor: "Arabic-speaking oncology and cardiac, especially from Baghdad",
    hop: "Royal Jordanian BGW–AMM or EBL–AMM. Shorter than Istanbul from the south.",
    visa: "Iraqi travelers usually need a Jordan visa — start it with the hospital letter.",
    languages: "Arabic · English",
    stay: "Abdali / KHCC corridor. Family sits the waiting room in the same language.",
    fromUsd: 2500,
  },
  {
    id: "iran",
    hub: "tehran",
    also: ["tabriz"],
    label: "Iran",
    country: "Iran",
    bestFor: "Fertility, cardiac, cost. The usual land hop from Slemani",
    hop: "Bashmakh / Haji Omaran by road, or IKA via Istanbul. Cash, not cards.",
    visa: "Iraqis often visa-on-arrival. Confirm the crossing the morning you go.",
    languages: "Persian · Kurdish · Arabic",
    stay: "Royan for fertility. Tehran Heart Center for cardiac. Tabriz if you want closer.",
    fromUsd: 1400,
  },
  {
    id: "india",
    hub: "delhi",
    also: ["chennai"],
    label: "India",
    country: "India",
    bestFor: "Complex cases at 50–70% of a Turkey quote — cardiac, ortho, oncology",
    hop: "Almost always via Dubai or Doha. Book the e-Medical visa before the ticket.",
    visa: "India e-Medical visa. The hospital letter comes first, then the visa, then the flight.",
    languages: "English · Arabic desks at Apollo / Medanta / Fortis",
    stay: "Two weeks, not four days. A family member should travel with you.",
    fromUsd: 2200,
  },
];

export function corridorOfCity(cityId: string): CareCorridor | undefined {
  for (const c of careCorridors) {
    if (c.hub === cityId || c.also.includes(cityId)) return c.id;
  }
  return undefined;
}

export function corridorById(id: CareCorridor) {
  return careCorridors.find((c) => c.id === id);
}

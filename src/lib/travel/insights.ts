import type { GuideBrief, TravelMode } from "./types";
import { getPlace } from "./places";

const cityCopy: Record<string, { about: string; tips: string[]; watch: string[] }> = {
  erbil: {
    about:
      "Erbil (Hewlêr) is the practical front door to the Kurdistan Region. The citadel sits on a tell that has been lived on for millennia; around it a modern city of malls, Ankawa restaurants, and late-night tea. Most visitors land at EBL, take a taxi, and are downtown in 20 minutes.",
    tips: [
      "KRG visa on arrival is still the usual path for many passports — confirm before you fly.",
      "USD and IQD both work. Cards are patchy outside hotels.",
      "Ankawa is the easiest first neighborhood if you want food after 10pm.",
    ],
    watch: [
      "A KRG entry stamp is not a Federal Iraq visa. Get the e-visa if you will go south.",
      "Summer afternoons are brutal. Sightsee early.",
    ],
  },
  sulaymaniyah: {
    about:
      "Slemani is the KRG’s cultural city — bookshops, mountains, and a more relaxed street life than Erbil. ISU has fewer flights, so many people fly into EBL and drive the three hours across Dukan.",
    tips: [
      "Stay on Salim Street if you want to walk to dinner.",
      "Day-trip Ahmad Awa or Halabja rather than overnighting there.",
    ],
    watch: ["Mountain roads fog in winter. Leave extra time back to Erbil."],
  },
  duhok: {
    about:
      "Duhok is the northern base for Amedi, Zakho, and the Turkish land crossing. The city itself is a valley bowl — compact, practical, and used to overland travelers.",
    tips: ["Use Duhok as a hub, not a three-night stay.", "Shared taxis to Zakho leave when full."],
    watch: ["Ibrahim Khalil queues can eat half a day on the Turkey side."],
  },
  baghdad: {
    about:
      "Baghdad is a river city again — Karada dinners, the Iraq Museum, and long Tigris evenings. It is not a walk-around-anywhere capital. A driver and a plan still matter more than a hotel gym.",
    tips: [
      "Federal e-visa first. Do not rely on a KRG stamp.",
      "Stay in Karada or Jadriya, not a random listing.",
      "Museums keep irregular hours. Confirm the day before.",
    ],
    watch: [
      "Independent travel is possible; solo wandering at night is not wise.",
      "Photography around ministries and bridges can draw attention.",
    ],
  },
  najaf: {
    about:
      "Najaf is a shrine city first. NJF is the airport of choice for pilgrims heading to the Imam Ali shrine and on to Karbala. Hotels fill and prices jump around Arbaeen.",
    tips: ["Book the hotel before the flight in peak pilgrimage weeks.", "Dress codes are conservative in the old city."],
    watch: ["Alcohol is not part of the public landscape here.", "Shared taxis to Karbala are the default hop."],
  },
  karbala: {
    about:
      "Most people reach Karbala by road from Najaf, not by air. The city is built around the two shrines; during Arbaeen it becomes one of the largest gatherings on earth.",
    tips: ["If you are not on pilgrimage, visit outside Muharram.", "Walk between the shrines rather than taxiing."],
    watch: ["Hotel apps lie during Arbaeen. Confirm by phone."],
  },
  basra: {
    about:
      "Basra is Iraq’s Gulf city — palms, the Shatt al-Arab, and a slower, hotter south. BSR takes flydubai and regional hops. The corniche is the pleasant evening circuit.",
    tips: ["Fly from Baghdad rather than the 6–7 hour highway.", "Evenings are when the city is livable in summer."],
    watch: ["Humidity is the story from May to September."],
  },
  mosul: {
    about:
      "Mosul is reachable overland from Erbil in about two and a half hours. Reconstruction is visible; so is damage. Go with someone who knows the current site rules.",
    tips: ["Base in Erbil and day-trip, or take a guided overnight.", "The old city and Nabi Yunus need a local fixer."],
    watch: ["Do not freelance photography in security zones."],
  },
  kirkuk: {
    about: "Kirkuk sits between the KRG and Federal Iraq. Most travelers pass through rather than stay.",
    tips: ["Use it as a daylight waypoint on the Erbil–Baghdad road."],
    watch: ["The political map around the city shifts. Check the day’s advice."],
  },
  rawanduz: {
    about: "Rawanduz and the Hamilton Road are why people rent a car in the KRG. Gorges, tea stands, and switchbacks.",
    tips: ["Start from Erbil after breakfast; be back before dark in winter."],
    watch: ["Ice on Korek and Gali Ali Beg after storms."],
  },
  amedi: {
    about: "Amedi sits on a mesa in the high north. It is a day or overnight from Duhok, not a flight.",
    tips: ["Combine with Sarsing if you have a driver."],
    watch: ["Fog. The road is paved but slow."],
  },
  zakho: {
    about: "Zakho is the Khabur border town. Travelers use it to enter or leave via Turkey.",
    tips: ["Sleep in Duhok unless you have an early crossing."],
    watch: ["The Delal bridge is the photo; the crossing is the delay."],
  },
  halabja: {
    about: "A memorial city east of Sulaymaniyah. Most visitors come for the museum and leave the same day.",
    tips: ["Go with a Slemani driver who has done the road."],
    watch: ["Treat the memorial as a memorial, not a viewpoint."],
  },
};

const modeCopy: Record<TravelMode, { title: string; body: string; tips: string[] }> = {
  flights: {
    title: "Flying in",
    body: "EBL and BGW are the two real international doors. ISU and NJF are useful when they match your city. Istanbul and Dubai carry most of the seats; Pegasus is usually the cheapest Europe–KRG ticket, Turkish and Qatar the most reliable.",
    tips: [
      "Iraqi Airways inventory is incomplete on global OTAs — check the airline if the route is domestic.",
      "Late IST arrivals into EBL are normal. Book a hotel that can check you in after midnight.",
    ],
  },
  hotels: {
    title: "Where to sleep",
    body: "Erbil, Slemani, and the shrine cities list well on Booking. Budget pensions in the KRG often do not — those are walk-in. Federal Iraq mid-range is more reliable online than it was five years ago, but confirm the generator.",
    tips: [
      "Ankawa and Karada beat anonymous “city center” pins.",
      "Arbaeen and Newroz wipe out inventory. Book or arrive with a backup.",
    ],
  },
  bus: {
    title: "Coaches and garages",
    body: "Intercity buses and shared taxis are how locals move. VIP coaches on Erbil–Slemani and Erbil–Baghdad are comfortable enough. Smaller hops (Najaf–Karbala, Duhok–Zakho) are shared sedans that leave when full.",
    tips: [
      "Buy at the garage the same morning. Online seats are rare.",
      "Women traveling alone usually take the VIP coach, not a shared taxi, on long federal runs.",
    ],
  },
  car: {
    title: "Driving the distance",
    body: "The KRG is a driving country. Roads are paved, signage is mixed Kurdish/Arabic/English, and a private driver is cheaper than you think. Crossing into Federal Iraq adds checkpoints and a visa requirement. Do the long southern highways in daylight or fly them.",
    tips: [
      "Fuel is inexpensive. Time is the real cost.",
      "Download offline maps. Mobile data drops in the gorges.",
      "A driver-guide for Erbil–Baghdad is worth more than a rental car.",
    ],
  },
  packages: {
    title: "Bundled travel",
    body: "Packages still earn their keep in Federal Iraq (permits, a fixer, a car) and for first-time KRG trips that want Hamilton Road without logistics. In Erbil you can just as easily build it yourself.",
    tips: [
      "Ask what the “guide” actually is — driver, historian, or both.",
      "Museum and site days fail when the package pretends opening hours are fixed.",
    ],
  },
};

export function curatedBrief(
  toId: string,
  fromId: string | undefined,
  mode: TravelMode,
): GuideBrief {
  const dest = getPlace(toId);
  const origin = fromId ? getPlace(fromId) : undefined;
  const city = cityCopy[toId];
  const travel = modeCopy[mode];

  const destination =
    city?.about ??
    `${dest?.name ?? "This city"} is on the Gesht map. Treat the guide as a starting brief, then confirm visas and the day’s security note.`;

  const journeyBits = [travel.body];
  if (origin && dest) {
    if (mode === "car") {
      journeyBits.unshift(
        `Driving ${origin.name} to ${dest.name} is a daylight road day. Checkpoints and the visa line between the KRG and Federal Iraq are the variables, not the asphalt.`,
      );
    } else if (mode === "flights") {
      journeyBits.unshift(
        `${origin.name} → ${dest.name}${dest.iata ? ` (${dest.iata})` : ""}. Compare the airline site against Wego — domestic Iraqi metal often hides on the carrier.`,
      );
    } else if (mode === "bus") {
      journeyBits.unshift(
        `Garage departures from ${origin.name} toward ${dest.name} are frequent on the main corridors, scarce on mountain spurs.`,
      );
    }
  }

  return {
    destinationTitle: dest ? `${dest.name}` : "Destination",
    destination,
    journeyTitle: travel.title,
    journey: journeyBits.join(" "),
    watchouts: [...(city?.watch ?? []), ...travel.tips.slice(0, 1)],
    tips: [...(city?.tips ?? []), ...travel.tips.slice(1)],
    source: "curated",
  };
}

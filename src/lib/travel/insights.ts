import type { GuideBrief, TravelMode } from "./types";
import { airportFor, visaFor } from "./meta";
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
  shaqlawa: {
    about:
      "Shaqlawa is Erbil’s hill town — 50 minutes, orchards, and the default Friday villa. Walks are gentle; the point is leaving the city, not bagging a peak.",
    tips: ["Leave Thursday evening if you can. Friday noon traffic is the tax."],
    watch: ["Generator noise on cheap villas. Ask before you book."],
  },
  korek: {
    about: "Korek is the ridge above Rawanduz. A cable car, chalets, and the first real alpine feeling in the KRG.",
    tips: ["Book the chalet and the cable-car window together."],
    watch: ["Ice into April. Afternoon wind on the ridge."],
  },
  "gali-ali-beg": {
    about: "Gali Ali Beg is the waterfall gorge on Hamilton Road — the photograph everyone already has, and still worth the day.",
    tips: ["Combine with Rawanduz viewpoints. One long Erbil day."],
    watch: ["Friday picnic crowds. Weekday mornings are kinder."],
  },
  dukan: {
    about: "Dukan is the lake between Erbil and Slemani. Villas, swimming, and a weekend that is about the water, not a town.",
    tips: ["Summer Fridays sell out. Confirm water pressure."],
    watch: ["The Erbil road clogs from mid-afternoon Thursday."],
  },
  "ahmad-awa": {
    about: "Ahmad Awa is Slemani’s waterfall picnic valley. Spring is the season; summer is a car park.",
    tips: ["Go early from Salim Street. Pair with Halabja only if you start at dawn."],
    watch: ["Flash crowds on public holidays."],
  },
  choman: {
    about: "Choman is the town under Halgurd. Come for the mountain, not the nightlife.",
    tips: ["Hire a guide who has done the approach this season."],
    watch: ["Do not treat Halgurd as a Hamilton Road extra."],
  },
  akre: {
    about: "Akre climbs a hillside in stepped lanes. Nowruz it is a festival; the rest of the year it is a quiet overnight from Duhok.",
    tips: ["Sleep in town if you want the dawn ridge."],
    watch: ["Nowruz week is not a villa weekend. Book months ahead or skip."],
  },
  hawraman: {
    about:
      "Hawraman is terraced villages on the Iranian border — Tawela and Biyara. Walks are village paths, not a waymarked long trail.",
    tips: ["Go in spring or walnut season. Pair with Halabja, not a same-day Slemani dash."],
    watch: ["Border district. Stay on used paths."],
  },
  zawita: {
    about: "Zawita is pine country above Duhok and the first signed forest trail in the governorate.",
    tips: ["Do the 11 km loop in the morning. Dinner back in Duhok."],
    watch: ["Do not confuse Zawa city hill with Zawita forest."],
  },
  sarsing: {
    about: "Sarsing sits under Gara. Cooler than the Duhok bowl; a weekend, not a flight.",
    tips: ["Use it as the Gara base. Check access the morning you go."],
    watch: ["Gara has a conflict history. Local guide."],
  },
  shanidar: {
    about: "Shanidar is the Neanderthal cave above Barzan. A short walk from the car park.",
    tips: ["Spring or autumn. Combine with Barzan, not a peak day."],
    watch: ["Summer on the slope is brutal."],
  },
  alqosh: {
    about: "Alqosh is a Nineveh Plains town under the Rabban Hormizd monastery. Stairs, not a trail.",
    tips: ["Federal Iraq rules apply. Confirm the day’s security note."],
    watch: ["Not inside the KRG e-visa bubble."],
  },
  istanbul: {
    about:
      "Istanbul is the default outbound hospital city from the KRG. Daily metal, Kurdish and Arabic desks, and campuses that already know the Erbil file.",
    tips: ["Fly EBL–IST. Stay next to the campus, not in Sultanahmet."],
    watch: ["Confirm the current visa. Get the written plan before you land."],
  },
  ankara: {
    about: "Ankara is the quieter Turkish campus when the named specialist is not in Istanbul.",
    tips: ["Only go if the letter names Ankara."],
    watch: ["Usually an IST connection, not a reason to skip Istanbul."],
  },
  amman: {
    about:
      "Amman is the Arabic-speaking upgrade — King Hussein Cancer Center first, then Abdali and Istishari. Shorter from Baghdad than Istanbul.",
    tips: ["Send oncology records before you buy RJ. The board reviews the file, not the walk-in."],
    watch: ["Iraqi passports need a Jordan visa. Start it with the hospital letter."],
  },
  tehran: {
    about:
      "Tehran is Iraq’s most-used medical city in Iran — Royan for fertility, Heart Center for cardiac. Cash corridor. Iraq is Iran’s largest patient source.",
    tips: ["Land from Slemani if you can. Bring cash. A Kurdish coordinator earns their fee."],
    watch: ["Cards often fail. Do not treat transplant offers as a product."],
  },
  tabriz: {
    about: "Tabriz is the close Iran city from the KRG. A land day through Haji Omaran or Bashmakh.",
    tips: ["Check the crossing the morning you go. Sleep in Tabriz, not at the border."],
    watch: ["A land corridor, not a tourist weekend."],
  },
  delhi: {
    about:
      "Delhi is the India campus Iraqi families use when the Turkey quote is too high — Medanta, Fortis. English and Arabic desks.",
    tips: ["Hospital letter, then e-Medical visa, then the ticket via DXB or DOH. Two weeks."],
    watch: ["Do not book the flight before the visa. A companion should travel."],
  },
  chennai: {
    about: "Chennai is Apollo’s south campus. Go for a named surgeon, not because the city is cheaper than Delhi.",
    tips: ["Same visa order as Delhi. Longer flight."],
    watch: ["Family travel. This is not a four-day hop."],
  },
  qaradagh: {
    about: "Forested belt south of Slemani. Named day walks. Iran–Iraq War UXO off-trail.",
    tips: ["Stay on used paths. A Slemani guide, not a solo ridge."],
    watch: ["Not a marked national-park network."],
  },
  dubai: {
    about: "Dubai is the fast-imaging hop, not the cheapest hospital city. Used for second reads, then home.",
    tips: ["48–72 hour diagnostics. Do not confuse this with an India surgery trip."],
    watch: ["Labs cost Gulf prices."],
  },
  doha: {
    about: "Doha is a Qatar Airways machine. You change planes; you rarely sleep in the city on a Gesht trip.",
    tips: ["Long layover? Stay airside unless the visa is already done."],
    watch: ["Not a medical corridor in this app."],
  },
  london: {
    about: "London is a one-stop European origin into Erbil, usually via Istanbul or the Gulf.",
    tips: ["Compare TK via IST against a Gulf one-stop. Direct is rare."],
    watch: ["UK visa is a separate problem from the KRG e-visa."],
  },
  frankfurt: {
    about: "Frankfurt is the Lufthansa / FlyErbil seasonal gate toward Erbil.",
    tips: ["Check if the EBL seasonal is running before you book FRA as the story."],
    watch: ["Schengen visa."],
  },
  cairo: {
    about: "Cairo connects EgyptAir into Baghdad and Erbil. A hub, not a KRG weekend.",
    tips: ["Use it when the IST fare is worse, not as a destination on this map."],
    watch: ["Egypt visa."],
  },
  kuwait: {
    about: "Kuwait is the short Gulf hop to Basra and Najaf.",
    tips: ["Useful for the south. Not a KRG entry."],
    watch: ["Kuwait visa. Federal Iraq rules on arrival."],
  },
  beirut: {
    about: "Beirut is the Levant connection, often via Amman or Istanbul when it is flying.",
    tips: ["Schedules change. Confirm the week you travel."],
    watch: ["Not a medical corridor we sell."],
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
  hiking: {
    title: "On the trail",
    body: "KRG hiking is road-accessible mountain walking more often than wilderness. Gali Ali Beg and Shaqlawa are Friday days; Halgurd is a real peak that needs a June–September window and a guide who has done the approach.",
    tips: [
      "Start from Erbil or Slemani at dawn. Summer rock radiates by noon.",
      "Download offline maps. Gorges drop mobile data.",
    ],
  },
  weekends: {
    title: "The Friday house",
    body: "Erbil empties toward Shaqlawa, Dukan, and Korek on Thursday night. Villas book by WhatsApp as often as by app. Federal weekends are city apartments — Jadriya, Karada — not lake houses.",
    tips: [
      "Ask about the generator and the water tank before you send a deposit.",
      "Thursday–Saturday is the real weekend. Sunday traffic back to Erbil is ugly.",
    ],
  },
  medical: {
    title: "Traveling for care",
    body: "Stay in Erbil or Slemani when the workup can be done at home. Turkey is the default upgrade campus. Jordan is Arabic oncology, especially from Baghdad. Iran is the land-and-cash hop from Slemani — Iraq is already Iran’s largest patient source. India is cheaper for complex surgery, but the hospital letter and e-Medical visa come before the ticket.",
    tips: [
      "Carry records on a USB and on paper. Coordinators still print.",
      "A written quote before imaging is the difference between a plan and a surprise.",
      "Do not buy the long-haul until the receiving hospital has accepted the file.",
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
  const air = dest ? airportFor(dest.id) : undefined;
  const airPlace = air ? getPlace(air) : undefined;

  const destination =
    city?.about ??
    `${dest?.name ?? "This city"} is on the Gesht map. ${dest?.blurb ?? ""}`.trim();

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
    } else if (mode === "hiking") {
      journeyBits.unshift(
        `${dest.name} is a trail day from ${origin.name}. Most KRG walks start with a paved road and a short footpath — Halgurd is the exception.`,
      );
    } else if (mode === "weekends") {
      journeyBits.unshift(
        `A weekend in ${dest.name}, leaving ${origin.name}. Thursday arrival beats Friday traffic.`,
      );
    } else if (mode === "medical") {
      journeyBits.unshift(
        `Care in ${dest.name}, arriving from ${origin.name}. Bring records, a written quote, and someone who can sit the waiting room with you.`,
      );
    }
  }

  return {
    destinationTitle: dest ? `${dest.name}` : "Destination",
    destination,
    journeyTitle: travel.title,
    journey: journeyBits.join(" "),
    watchouts: [
      ...(city?.watch ?? []),
      visaFor(toId),
      ...(airPlace && airPlace.id !== toId
        ? [`Nearest metal is ${airPlace.iata ?? airPlace.name} — ${airPlace.name}.`]
        : []),
      ...travel.tips.slice(0, 1),
    ],
    tips: [...(city?.tips ?? []), ...travel.tips.slice(1)],
    source: "curated",
  };
}

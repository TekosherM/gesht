import type { OutboundLink, TravelMode } from "./types";
import { getPlace } from "./places";

function yymmdd(iso: string) {
  return iso.replaceAll("-", "").slice(2);
}

function q(s: string) {
  return encodeURIComponent(s);
}

export function airlineSite(name: string): string | undefined {
  const pages: Record<string, string> = {
    "Turkish Airlines": "https://www.turkishairlines.com/en-int/bookings/book/",
    Pegasus: "https://web.flypgs.com/booking?language=en",
    AJet: "https://www.ajet.com/en",
    flydubai: "https://www.flydubai.com/en/book-and-manage/book-a-flight",
    "Qatar Airways": "https://www.qatarairways.com",
    "Iraqi Airways": "https://iraqiairways.com.iq/search/standalone/en/",
    "Fly Baghdad": "https://www.flybaghdad.iq/en/",
    FlyErbil: "https://www.flyebl.com",
    "UR Airlines": "https://urairlines.com",
    "Royal Jordanian": "https://www.rj.com",
    EgyptAir: "https://www.egyptair.com",
    Lufthansa: "https://www.lufthansa.com",
    Emirates: "https://www.emirates.com",
    "Middle East Airlines": "https://www.mea.com.lb",
  };
  if (pages[name]) return pages[name];
  const first = name.split("+")[0]?.trim();
  return first ? pages[first] : undefined;
}

export function flightOutbounds(
  fromIata: string,
  toIata: string,
  depart: string,
  guests: number,
  returnDate?: string,
): OutboundLink[] {
  const adults = Math.max(1, guests);
  const a = fromIata.toUpperCase();
  const b = toIata.toUpperCase();
  let sk = `${a.toLowerCase()}/${b.toLowerCase()}/${yymmdd(depart)}`;
  if (returnDate) sk += `/${yymmdd(returnDate)}`;
  let kayak = `${a}-${b}/${depart}`;
  if (returnDate) kayak += `/${returnDate}`;
  return [
    {
      source: "Wego",
      kind: "ota",
      label: "Same search on Wego",
      url: `https://www.wego.com/flights/${a.toLowerCase()}/${b.toLowerCase()}/${depart}`,
    },
    {
      source: "Kayak",
      kind: "ota",
      label: "Same search on Kayak",
      url: `https://www.kayak.com/flights/${kayak}?sort=bestflight_a`,
    },
    {
      source: "Skyscanner",
      kind: "ota",
      label: "Same search on Skyscanner",
      url: `https://www.skyscanner.com/transport/flights/${sk}/?adultsv2=${adults}&cabinclass=economy&rtn=${returnDate ? 1 : 0}`,
    },
    {
      source: "Almosafer",
      kind: "ota",
      label: "Same search on Almosafer",
      url: `https://global.almosafer.com/en/flights/${a}-${b}/${depart}/Economy/${adults}Adult`,
    },
    {
      source: "Google Flights",
      kind: "ota",
      label: "Same search on Google Flights",
      url: `https://www.google.com/travel/flights?hl=en#flt=${a}.${b}.${depart};c:USD;e:1;sd:1;t:f`,
    },
    {
      source: "Kiwi",
      kind: "ota",
      label: "Same search on Kiwi",
      url: `https://www.kiwi.com/en/search/results/${a.toLowerCase()}/${b.toLowerCase()}/${depart}`,
    },
    {
      source: "RideFly",
      kind: "ota",
      label: "Open RideFly (Iraq, IQD)",
      url: "https://ridefly.com.iq/en/",
    },
  ];
}

export function hotelOutbounds(
  city: string,
  checkin: string,
  checkout: string | undefined,
  guests: number,
  rooms: number,
): OutboundLink[] {
  const out = checkout || checkin;
  const ss = q(city);
  return [
    {
      source: "Booking",
      kind: "ota",
      label: "Same stay on Booking",
      url: `https://www.booking.com/searchresults.html?ss=${ss}&checkin=${checkin}&checkout=${out}&group_adults=${guests}&no_rooms=${rooms}`,
    },
    {
      source: "Agoda",
      kind: "ota",
      label: "Same stay on Agoda",
      url: `https://www.agoda.com/search?checkIn=${checkin}&checkOut=${out}&adults=${guests}&rooms=${rooms}&textToSearch=${ss}`,
    },
    {
      source: "Google Hotels",
      kind: "ota",
      label: "Same stay on Google",
      url: `https://www.google.com/travel/hotels/${ss}?q=${q(`${city} hotels ${checkin}`)}`,
    },
  ];
}

export function outboundsFor(mode: TravelMode, query: {
  from?: string;
  to: string;
  depart: string;
  returnDate?: string;
  guests: number;
  rooms: number;
}): OutboundLink[] {
  const dest = getPlace(query.to);
  const origin = query.from ? getPlace(query.from) : undefined;
  const destName = dest?.name ?? query.to;
  if (mode === "flights" && origin?.iata && dest?.iata) {
    return flightOutbounds(origin.iata, dest.iata, query.depart, query.guests, query.returnDate);
  }
  if (mode === "hotels") {
    return hotelOutbounds(destName, query.depart, query.returnDate, query.guests, query.rooms);
  }
  if (mode === "weekends") {
    const place = destName.replaceAll(" ", "-");
    return [
      ...hotelOutbounds(destName, query.depart, query.returnDate, query.guests, query.rooms),
      {
        source: "Airbnb",
        kind: "ota",
        label: "Same weekend on Airbnb",
        url: `https://www.airbnb.com/s/${place}--Iraq/homes?checkin=${query.depart}&checkout=${query.returnDate ?? query.depart}&adults=${query.guests}`,
      },
      {
        source: "OpenSooq",
        kind: "broker",
        label: "Chalets on OpenSooq (call the owner)",
        url: "https://iq.opensooq.com/en/property/farms-chalets-for-rent",
      },
    ];
  }
  if (mode === "bus") {
    return [
      { source: "Obilet", kind: "ota", label: "Turkey–KRG coaches on Obilet", url: "https://www.obilet.com/en/bus-ticket/istanbul-erbil" },
      { source: "Rama Travel", kind: "tour", label: "Rama Travel (Duhok)", url: "https://ramatravel.net/" },
      {
        source: "Rome2Rio",
        kind: "hint",
        label: "Corridor overview — not a ticket",
        url: `https://www.rome2rio.com/s/${q(origin?.name ?? "Erbil")}/${q(destName)}`,
      },
    ];
  }
  if (mode === "car") {
    const o = q(origin?.name ?? destName);
    const d = q(destName);
    return [
      {
        source: "Google Maps",
        kind: "map",
        label: "Drive this corridor",
        url: `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=driving`,
      },
      { source: "Hertz", kind: "rental", label: "Hertz Erbil (Cihan)", url: "https://www.hertz.com/us/en/location/iraq/erbil" },
      { source: "Avis", kind: "rental", label: "Avis Erbil", url: "https://www.avis.com/en/locations/me/iq/erbil" },
      { source: "Sixt", kind: "rental", label: "Sixt Iraq", url: "https://www.sixt.com/car-rental/iraq/erbil/" },
    ];
  }
  if (mode === "hiking") {
    return [
      { source: "Zagros Mountain Trail", kind: "tour", label: "Zagros Mountain Trail", url: "https://www.zagrosmountaintrail.org/" },
      { source: "Visit Kurdistan", kind: "tour", label: "Visit Kurdistan", url: "https://visitkurdistan.krd/" },
      { source: "Kurdistan Outdoors", kind: "club", label: "Kurdistan Outdoors", url: "https://kurdistanoutdoor.com" },
    ];
  }
  if (mode === "medical") {
    return [
      { source: "PAR Hospital", kind: "hospital", label: "PAR Erbil", url: "https://www.parhospital.org" },
      { source: "Faruk Medical City", kind: "hospital", label: "Faruk Medical City", url: "https://www.farukmedicalcity.com" },
      { source: "Doctoury", kind: "ota", label: "Doctoury (Iraq medical desk)", url: "https://www.doctoury.com" },
      { source: "Acıbadem", kind: "hospital", label: "Acıbadem International", url: "https://acibademinternational.com" },
    ];
  }
  if (mode === "packages") {
    return [
      { source: "Visit Kurdistan", kind: "tour", label: "Visit Kurdistan", url: "https://visitkurdistan.krd/" },
      { source: "Iraqi Kurdistan Guide", kind: "tour", label: "Haval Qaraman", url: "https://www.iraqikurdistanguide.com" },
      { source: "Iraq Travel and Tours", kind: "tour", label: "Iraq Travel and Tours", url: "https://iraqtravelandtours.com" },
    ];
  }
  return [];
}

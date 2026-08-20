import { corridorOfCity } from "./care-corridors";
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

export function hospitalSite(name: string): string | undefined {
  const pages: Record<string, string> = {
    "PAR Hospital": "https://www.parhospital.org",
    CMC: "https://www.cmcph.net",
    "Zheen International": "https://www.zheen-hospital.com",
    "Shar Hospital": "https://www.shar-hospital.net",
    "Faruk Medical City": "https://www.farukmedicalcity.com",
    "Ibn Sina": "https://www.doctoury.com",
    "Medical City": "https://www.doctoury.com",
    Acıbadem: "https://acibademinternational.com",
    "Abdali Hospital": "https://www.abdalihospital.com/planning-your-trip",
    "Aster & city clinics": "https://www.doctoury.com",
    "Memorial Şişli": "https://www.memorial.com.tr/en",
    "Medipol Mega": "https://international.medipol.com.tr",
    "Güven Hospital": "https://www.guven.com.tr/en",
    "King Hussein Cancer Center": "https://www.khcc.jo",
    "Istishari Hospital": "https://www.istisharihospital.com",
    "Royan Institute": "https://www.royaninstitute.org",
    "Tehran Heart Center": "https://thc.tums.ac.ir",
    "Imam Reza Tabriz": "https://www.doctoury.com",
    Medanta: "https://www.medanta.org",
    Fortis: "https://www.fortishealthcare.com",
    "Apollo Chennai": "https://www.apollohospitals.com",
  };
  return pages[name];
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

export function busOutbounds(fromName: string, toName: string): OutboundLink[] {
  return [
    {
      source: "Obilet",
      kind: "ota",
      label: "Turkey–KRG on Obilet",
      url: "https://www.obilet.com/en/bus-ticket/istanbul-erbil",
    },
    { source: "Rama Travel", kind: "tour", label: "Rama Travel (Duhok)", url: "https://ramatravel.net/" },
    {
      source: "Rome2Rio",
      kind: "hint",
      label: "Corridor overview",
      url: `https://www.rome2rio.com/s/${q(fromName)}/${q(toName)}`,
    },
  ];
}

export function carOutbounds(fromName: string, toName: string): OutboundLink[] {
  return [
    {
      source: "Google Maps",
      kind: "map",
      label: "Drive this corridor",
      url: `https://www.google.com/maps/dir/?api=1&origin=${q(fromName)}&destination=${q(toName)}&travelmode=driving`,
    },
    { source: "Hertz", kind: "rental", label: "Hertz Erbil (Cihan)", url: "https://www.hertz.com/us/en/location/iraq/erbil" },
    { source: "Avis", kind: "rental", label: "Avis Erbil", url: "https://www.avis.com/en/locations/me/iq/erbil" },
  ];
}

export function hikeOutbounds(): OutboundLink[] {
  return [
    { source: "Zagros Mountain Trail", kind: "tour", label: "Zagros Mountain Trail", url: "https://www.zagrosmountaintrail.org/" },
    { source: "Kurdistan Outdoors", kind: "club", label: "Kurdistan Outdoors", url: "https://kurdistanoutdoor.com" },
    { source: "Visit Kurdistan", kind: "tour", label: "Visit Kurdistan", url: "https://visitkurdistan.krd/" },
  ];
}

export function packageOutbounds(): OutboundLink[] {
  return [
    { source: "Visit Kurdistan", kind: "tour", label: "Visit Kurdistan", url: "https://visitkurdistan.krd/" },
    { source: "Iraqi Kurdistan Guide", kind: "tour", label: "Haval Qaraman", url: "https://www.iraqikurdistanguide.com" },
    { source: "Wander Iraq", kind: "tour", label: "Wander Iraq", url: "https://wanderiraq.com" },
    { source: "Iraq Travel and Tours", kind: "tour", label: "Iraq Travel and Tours", url: "https://iraqtravelandtours.com" },
  ];
}

export function outboundsFor(
  mode: TravelMode,
  query: {
    from?: string;
    to: string;
    depart: string;
    returnDate?: string;
    guests: number;
    rooms: number;
  },
): OutboundLink[] {
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
    return busOutbounds(origin?.name ?? "Erbil", destName);
  }
  if (mode === "car") {
    return carOutbounds(origin?.name ?? destName, destName);
  }
  if (mode === "hiking") return hikeOutbounds();
  if (mode === "medical") {
    const corridor = corridorOfCity(query.to);
    if (corridor === "turkey") {
      return [
        { source: "Acıbadem", kind: "hospital", label: "Acıbadem International", url: "https://acibademinternational.com" },
        { source: "Memorial", kind: "hospital", label: "Memorial", url: "https://www.memorial.com.tr/en" },
        { source: "Doctoury", kind: "ota", label: "Doctoury (Iraq desk)", url: "https://www.doctoury.com" },
      ];
    }
    if (corridor === "jordan") {
      return [
        { source: "KHCC", kind: "hospital", label: "King Hussein Cancer Center", url: "https://www.khcc.jo" },
        { source: "Abdali", kind: "hospital", label: "Abdali Hospital", url: "https://www.abdalihospital.com/planning-your-trip" },
        { source: "Doctoury", kind: "ota", label: "Doctoury (Iraq desk)", url: "https://www.doctoury.com" },
      ];
    }
    if (corridor === "iran") {
      return [
        { source: "Royan", kind: "hospital", label: "Royan Institute", url: "https://www.royaninstitute.org" },
        { source: "Tehran Heart Center", kind: "hospital", label: "Tehran Heart Center", url: "https://thc.tums.ac.ir" },
        { source: "Doctoury", kind: "ota", label: "Doctoury (Iraq desk)", url: "https://www.doctoury.com" },
      ];
    }
    if (corridor === "india") {
      return [
        { source: "Medanta", kind: "hospital", label: "Medanta", url: "https://www.medanta.org" },
        { source: "Apollo", kind: "hospital", label: "Apollo Hospitals", url: "https://www.apollohospitals.com" },
        { source: "Doctoury", kind: "ota", label: "Doctoury (Iraq desk)", url: "https://www.doctoury.com" },
      ];
    }
    return [
      { source: "PAR Hospital", kind: "hospital", label: "PAR Erbil", url: "https://www.parhospital.org" },
      { source: "Faruk Medical City", kind: "hospital", label: "Faruk Medical City", url: "https://www.farukmedicalcity.com" },
      { source: "Doctoury", kind: "ota", label: "Doctoury — Turkey, Jordan, India", url: "https://www.doctoury.com" },
    ];
  }
  if (mode === "packages") return packageOutbounds();
  return [];
}

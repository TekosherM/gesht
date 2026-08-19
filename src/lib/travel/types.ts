export type TravelMode = "flights" | "hotels" | "packages" | "bus" | "car";

export type Region = "krg" | "federal" | "gateway";

export type Place = {
  id: string;
  name: string;
  localName: string;
  country: string;
  region: Region;
  iata?: string;
  lat: number;
  lng: number;
  blurb: string;
  image?: string;
  featured?: boolean;
};

export type MoneySource = {
  source: string;
  usd: number;
};

export type FlightOffer = {
  kind: "flight";
  id: string;
  from: string;
  to: string;
  airline: string;
  flightNo: string;
  depart: string;
  arrive: string;
  durationMin: number;
  stops: number;
  via?: string;
  cabin: "economy" | "business";
  sources: MoneySource[];
};

export type HotelOffer = {
  kind: "hotel";
  id: string;
  city: string;
  name: string;
  area: string;
  stars: number;
  rating: number;
  reviews: number;
  nightlyUsd: number;
  amenities: string[];
  note: string;
};

export type BusOffer = {
  kind: "bus";
  id: string;
  from: string;
  to: string;
  operator: string;
  depart: string;
  arrive: string;
  durationMin: number;
  seat: string;
  sources: MoneySource[];
};

export type CarOffer = {
  kind: "car";
  id: string;
  from: string;
  to: string;
  km: number;
  hours: number;
  road: "highway" | "mountain" | "mixed";
  fuelUsd: number;
  checkpoints: number;
  waypoints: string[];
  notes: string[];
};

export type PackageOffer = {
  kind: "package";
  id: string;
  title: string;
  cities: string[];
  nights: number;
  priceUsd: number;
  includes: string[];
  season: string;
};

export type TravelOffer =
  | FlightOffer
  | HotelOffer
  | BusOffer
  | CarOffer
  | PackageOffer;

export type SearchQuery = {
  mode: TravelMode;
  from?: string;
  to: string;
  depart: string;
  returnDate?: string;
  guests: number;
  rooms: number;
};

export type GuideBrief = {
  destinationTitle: string;
  destination: string;
  journeyTitle: string;
  journey: string;
  watchouts: string[];
  tips: string[];
  source: "live" | "curated";
};

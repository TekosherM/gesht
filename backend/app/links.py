"""Deep-link builders for OTAs and desks.

We do not scrape Wego, Skyscanner, or airline sites. Each search opens the
same query on the desk that actually holds the inventory.
"""

from __future__ import annotations

from urllib.parse import quote_plus


def yymmdd(iso: str) -> str:
    return iso.replace("-", "")[2:]


def flight_outbounds(from_iata: str, to_iata: str, depart: str, guests: int, return_date: str | None):
    adults = max(1, guests)
    from_iata, to_iata = from_iata.upper(), to_iata.upper()
    sk_path = f"{from_iata.lower()}/{to_iata.lower()}/{yymmdd(depart)}"
    if return_date:
        sk_path += f"/{yymmdd(return_date)}"
    kayak = f"{from_iata}-{to_iata}/{depart}"
    if return_date:
        kayak += f"/{return_date}"
    return [
        {
            "source": "Wego",
            "kind": "ota",
            "label": "Same search on Wego",
            "url": f"https://www.wego.com/flights/{from_iata.lower()}/{to_iata.lower()}/{depart}",
        },
        {
            "source": "Kayak",
            "kind": "ota",
            "label": "Same search on Kayak",
            "url": f"https://www.kayak.com/flights/{kayak}?sort=bestflight_a",
        },
        {
            "source": "Skyscanner",
            "kind": "ota",
            "label": "Same search on Skyscanner",
            "url": f"https://www.skyscanner.com/transport/flights/{sk_path}/?adultsv2={adults}&cabinclass=economy&rtn={1 if return_date else 0}",
        },
        {
            "source": "Almosafer",
            "kind": "ota",
            "label": "Same search on Almosafer",
            "url": f"https://global.almosafer.com/en/flights/{from_iata}-{to_iata}/{depart}/Economy/{adults}Adult",
        },
        {
            "source": "Google Flights",
            "kind": "ota",
            "label": "Same search on Google Flights",
            "url": f"https://www.google.com/travel/flights?hl=en#flt={from_iata}.{to_iata}.{depart};c:USD;e:1;sd:1;t:f",
        },
        {
            "source": "Kiwi",
            "kind": "ota",
            "label": "Same search on Kiwi",
            "url": f"https://www.kiwi.com/en/search/results/{from_iata.lower()}/{to_iata.lower()}/{depart}",
        },
        {
            "source": "RideFly",
            "kind": "ota",
            "label": "Open RideFly (Iraq, IQD)",
            "url": "https://ridefly.com.iq/en/",
        },
    ]


def hotel_outbounds(city: str, checkin: str, checkout: str | None, guests: int, rooms: int):
    out = checkout or checkin
    ss = quote_plus(city)
    return [
        {
            "source": "Booking",
            "kind": "ota",
            "label": "Same stay on Booking",
            "url": (
                f"https://www.booking.com/searchresults.html?ss={ss}"
                f"&checkin={checkin}&checkout={out}&group_adults={guests}&no_rooms={rooms}"
            ),
        },
        {
            "source": "Agoda",
            "kind": "ota",
            "label": "Same stay on Agoda",
            "url": (
                f"https://www.agoda.com/search?city=&checkIn={checkin}&checkOut={out}"
                f"&adults={guests}&rooms={rooms}&textToSearch={ss}"
            ),
        },
        {
            "source": "Google Hotels",
            "kind": "ota",
            "label": "Same stay on Google",
            "url": f"https://www.google.com/travel/hotels/{ss}?q={quote_plus(f'{city} hotels {checkin}')}",
        },
    ]


def airline_page(name: str) -> str | None:
    pages = {
        "Turkish Airlines": "https://www.turkishairlines.com",
        "Pegasus": "https://www.flypgs.com/en",
        "flydubai": "https://www.flydubai.com",
        "Qatar Airways": "https://www.qatarairways.com",
        "Iraqi Airways": "https://www.ia.gov.iq",
        "Fly Baghdad": "https://www.flybaghdad.net",
        "Royal Jordanian": "https://www.rj.com",
        "EgyptAir": "https://www.egyptair.com",
        "Lufthansa": "https://www.lufthansa.com",
        "Emirates": "https://www.emirates.com",
    }
    return pages.get(name)

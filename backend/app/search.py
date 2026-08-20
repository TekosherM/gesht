from __future__ import annotations

from urllib.parse import quote_plus

from sqlalchemy.orm import Session

from . import links
from .db import GroupRow, OperatorRow, SourceRow, TrailRow


def outbounds_for(mode: str, *, origin: str | None, dest: str, dest_name: str, depart: str, return_date: str | None, guests: int, rooms: int, from_iata: str | None, to_iata: str | None):
    if mode == "flights" and from_iata and to_iata:
        return links.flight_outbounds(from_iata, to_iata, depart, guests, return_date)
    if mode in {"hotels", "weekends"}:
        rows = links.hotel_outbounds(dest_name, depart, return_date, guests, rooms)
        place = dest_name.replace(" ", "-")
        if mode == "weekends":
            rows.append(
                {
                    "source": "Airbnb",
                    "kind": "ota",
                    "label": "Same weekend on Airbnb",
                    "url": (
                        f"https://www.airbnb.com/s/{place}--Iraq/homes"
                        f"?checkin={depart}&checkout={return_date or depart}&adults={guests}"
                    ),
                }
            )
            rows.append(
                {
                    "source": "OpenSooq",
                    "kind": "broker",
                    "label": "Chalets on OpenSooq (call the owner)",
                    "url": "https://iq.opensooq.com/en/property/farms-chalets-for-rent",
                }
            )
        return rows
    if mode == "bus":
        return [
            {
                "source": "Obilet",
                "kind": "ota",
                "label": "Turkey–KRG coaches on Obilet",
                "url": "https://www.obilet.com",
            },
            {
                "source": "Rama Travel",
                "kind": "tour",
                "label": "Rama Travel (Duhok)",
                "url": "https://ramatravel.net",
            },
            {
                "source": "Rome2Rio",
                "kind": "hint",
                "label": "Corridor overview — not a ticket",
                "url": f"https://www.rome2rio.com/s/{quote_plus(origin or 'Erbil')}/{quote_plus(dest_name)}",
            },
        ]
    if mode == "car":
        o = quote_plus(origin or dest_name)
        d = quote_plus(dest_name)
        return [
            {
                "source": "Google Maps",
                "kind": "map",
                "label": "Drive this corridor",
                "url": f"https://www.google.com/maps/dir/?api=1&origin={o}&destination={d}&travelmode=driving",
            },
            {
                "source": "Hertz",
                "kind": "rental",
                "label": "Hertz Erbil (Cihan)",
                "url": "https://www.hertz.com/us/en/location/iraq/erbil",
            },
            {
                "source": "Avis",
                "kind": "rental",
                "label": "Avis Erbil",
                "url": "https://www.avis.com/en/locations/me/iq/erbil",
            },
            {
                "source": "Sixt",
                "kind": "rental",
                "label": "Sixt Iraq",
                "url": "https://www.sixt.com/car-rental/iraq/erbil/",
            },
        ]
    if mode == "hiking":
        return [
            {
                "source": "Zagros Mountain Trail",
                "kind": "tour",
                "label": "Zagros Mountain Trail",
                "url": "https://www.zagrosmountaintrail.org/",
            },
            {
                "source": "Visit Kurdistan",
                "kind": "tour",
                "label": "Visit Kurdistan",
                "url": "https://visitkurdistan.krd/",
            },
        ]
    if mode == "medical":
        return [
            {"source": "PAR Hospital", "kind": "hospital", "label": "PAR Erbil", "url": "https://www.parhospital.org"},
            {"source": "Faruk Medical City", "kind": "hospital", "label": "Faruk Medical City", "url": "https://www.farukmedicalcity.com"},
            {"source": "Doctoury", "kind": "ota", "label": "Doctoury (Iraq medical desk)", "url": "https://www.doctoury.com"},
            {"source": "Acıbadem", "kind": "hospital", "label": "Acıbadem International (outbound)", "url": "https://acibademinternational.com"},
        ]
    if mode == "packages":
        return [
            {"source": "Visit Kurdistan", "kind": "tour", "label": "Visit Kurdistan", "url": "https://visitkurdistan.krd/"},
            {"source": "Iraqi Kurdistan Guide", "kind": "tour", "label": "Haval Qaraman", "url": "https://www.iraqikurdistanguide.com"},
            {"source": "Iraq Travel and Tours", "kind": "tour", "label": "Iraq Travel and Tours", "url": "https://iraqtravelandtours.com"},
        ]
    return []


def search_trails(session: Session, dest: str, origin: str | None):
    rows = session.query(TrailRow).all()
    if not dest:
        return [trail_offer(r) for r in rows if r.price_usd > 0]
    hits = [
        r
        for r in rows
        if r.price_usd > 0
        and (r.city == dest or dest in (r.bases or []) or (origin and origin in (r.bases or [])))
    ]
    hits.sort(key=lambda r: r.price_usd)
    return [trail_offer(r) for r in hits]


def trail_offer(r: TrailRow):
    return {
        "kind": "hike",
        "id": f"hike-{r.id}",
        "trail": r.trail,
        "localName": r.local_name,
        "city": r.city,
        "bases": r.bases,
        "range": r.range_name,
        "grade": r.grade,
        "km": r.km,
        "hours": r.hours,
        "season": r.season,
        "priceUsd": r.price_usd,
        "includes": r.includes,
        "note": r.note,
        "groupIds": r.groups,
    }


def groups_for(session: Session, group_ids: list[str], dest: str):
    rows = session.query(GroupRow).all()
    picked = []
    seen = set()
    for r in rows:
        if r.id in group_ids or r.city == dest:
            if r.id in seen:
                continue
            seen.add(r.id)
            picked.append(
                {
                    "id": r.id,
                    "name": r.name,
                    "city": r.city,
                    "kind": r.kind,
                    "founded": r.founded,
                    "ranges": r.ranges,
                    "note": r.note,
                    "how": r.how,
                    "website": r.website,
                }
            )
    return picked


def sources_for(session: Session, mode: str):
    rows = session.query(SourceRow).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "kind": r.kind,
            "website": r.website,
            "notes": r.notes,
        }
        for r in rows
        if mode in (r.modes or [])
    ]


def operators_for(session: Session, mode: str | None):
    rows = session.query(OperatorRow).all()
    out = []
    for r in rows:
        if mode and mode not in (r.modes or []):
            continue
        out.append(
            {
                "id": r.id,
                "name": r.name,
                "modes": r.modes,
                "city": r.city,
                "website": r.website,
                "bookingStyle": r.booking_style,
                "notes": r.notes,
            }
        )
    return out

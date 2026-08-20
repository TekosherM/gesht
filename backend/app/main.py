from __future__ import annotations

import os

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .db import SessionLocal, init_db, url as db_url
from .search import groups_for, operators_for, outbounds_for, search_trails, sources_for

app = FastAPI(title="Gesht", version="0.3.0")
origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

IATA = {
    "erbil": "EBL",
    "sulaymaniyah": "ISU",
    "baghdad": "BGW",
    "najaf": "NJF",
    "basra": "BSR",
    "kirkuk": "KIK",
    "istanbul": "IST",
    "dubai": "DXB",
    "doha": "DOH",
    "amman": "AMM",
    "london": "LHR",
    "frankfurt": "FRA",
    "cairo": "CAI",
    "kuwait": "KWI",
    "beirut": "BEY",
}

NAMES = {
    "erbil": "Erbil",
    "sulaymaniyah": "Sulaymaniyah",
    "baghdad": "Baghdad",
    "najaf": "Najaf",
    "basra": "Basra",
    "duhok": "Duhok",
    "rawanduz": "Rawanduz",
    "amedi": "Amedi",
    "shaqlawa": "Shaqlawa",
    "korek": "Korek",
    "dukan": "Dukan",
    "choman": "Choman",
    "akre": "Akre",
    "gali-ali-beg": "Gali Ali Beg",
    "ahmad-awa": "Ahmad Awa",
    "halabja": "Halabja",
    "hawraman": "Hawraman",
    "qaradagh": "Qaradagh",
    "zawita": "Zawita",
    "sarsing": "Sarsing",
    "shanidar": "Shanidar",
    "alqosh": "Alqosh",
    "istanbul": "Istanbul",
    "ankara": "Ankara",
    "tehran": "Tehran",
    "tabriz": "Tabriz",
    "delhi": "Delhi",
    "chennai": "Chennai",
    "dubai": "Dubai",
    "dubai": "Dubai",
    "amman": "Amman",
}


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/api/gesht/health")
def health():
    kind = "postgres" if db_url.startswith("postgresql") else "sqlite"
    return {"ok": True, "service": "gesht", "db": kind}


@app.get("/api/gesht/search")
def search(
    mode: str = "flights",
    to: str = "erbil",
    origin: str | None = Query(default=None, alias="from"),
    depart: str = "",
    returnDate: str | None = None,
    guests: int = 1,
    rooms: int = 1,
):
    session = SessionLocal()
    try:
        dest_name = NAMES.get(to, to.replace("-", " ").title())
        origin_name = NAMES.get(origin, origin) if origin else None
        offers = []
        related_groups = []
        if mode == "hiking":
            offers = search_trails(session, to, origin)
            gids: list[str] = []
            for o in offers:
                gids.extend(o.get("groupIds") or [])
            related_groups = groups_for(session, gids, to)

        outbounds = outbounds_for(
            mode,
            origin=origin_name,
            dest=to,
            dest_name=dest_name,
            depart=depart or "2026-09-15",
            return_date=returnDate,
            guests=guests,
            rooms=rooms,
            from_iata=IATA.get(origin or "") if origin else None,
            to_iata=IATA.get(to),
        )
        return {
            "mode": mode,
            "to": to,
            "from": origin,
            "offers": offers,
            "outbounds": outbounds,
            "groups": related_groups,
            "operators": operators_for(session, mode),
            "sources": sources_for(session, mode),
            "disclaimer": (
                "Gesht opens the same search on the desk that holds the seats. "
                "Live prices live there — we do not scrape airline or OTA pages."
            ),
        }
    finally:
        session.close()


@app.get("/api/gesht/trails")
def trails(to: str | None = None):
    session = SessionLocal()
    try:
        return {"trails": search_trails(session, to or "", None) if to else search_trails(session, "", None) or []}
    finally:
        session.close()


@app.get("/api/gesht/groups")
def groups(city: str | None = None):
    session = SessionLocal()
    try:
        return {"groups": groups_for(session, [], city or "")}
    finally:
        session.close()


@app.get("/api/gesht/operators")
def operators(mode: str | None = None):
    session = SessionLocal()
    try:
        return {"operators": operators_for(session, mode)}
    finally:
        session.close()


@app.get("/api/gesht/sources")
def sources(mode: str = "flights"):
    session = SessionLocal()
    try:
        return {"sources": sources_for(session, mode)}
    finally:
        session.close()

from __future__ import annotations

import json
import os
from pathlib import Path

from sqlalchemy import JSON, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATA = Path(__file__).resolve().parents[2] / "data"
DB_PATH = Path(__file__).resolve().parents[1] / "gesht.db"

raw = os.environ.get("DATABASE_URL", "").strip()
if raw:
    url = raw.replace("postgres://", "postgresql://", 1)
else:
    url = f"sqlite:///{DB_PATH}"

connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
engine = create_engine(url, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class SourceRow(Base):
    __tablename__ = "gesht_sources"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    modes: Mapped[list] = mapped_column(JSON)
    kind: Mapped[str] = mapped_column(String(32))
    website: Mapped[str | None] = mapped_column(String(320), nullable=True)
    city: Mapped[str | None] = mapped_column(String(64), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class TrailRow(Base):
    __tablename__ = "gesht_trails"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    trail: Mapped[str] = mapped_column(String(200))
    local_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    city: Mapped[str] = mapped_column(String(64))
    bases: Mapped[list] = mapped_column(JSON)
    range_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    grade: Mapped[str] = mapped_column(String(24))
    km: Mapped[float] = mapped_column()
    hours: Mapped[float] = mapped_column()
    season: Mapped[str] = mapped_column(String(80))
    price_usd: Mapped[int] = mapped_column()
    includes: Mapped[list] = mapped_column(JSON)
    note: Mapped[str] = mapped_column(Text)
    groups: Mapped[list] = mapped_column(JSON)


class GroupRow(Base):
    __tablename__ = "gesht_groups"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    city: Mapped[str] = mapped_column(String(64))
    kind: Mapped[str] = mapped_column(String(32))
    founded: Mapped[str | None] = mapped_column(String(16), nullable=True)
    ranges: Mapped[list] = mapped_column(JSON)
    note: Mapped[str] = mapped_column(Text)
    how: Mapped[str] = mapped_column(Text)
    website: Mapped[str | None] = mapped_column(String(320), nullable=True)


class OperatorRow(Base):
    __tablename__ = "gesht_operators"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    modes: Mapped[list] = mapped_column(JSON)
    city: Mapped[str | None] = mapped_column(String(80), nullable=True)
    website: Mapped[str | None] = mapped_column(String(320), nullable=True)
    booking_style: Mapped[str] = mapped_column(String(32))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


def load_json(name: str):
    path = DATA / name
    return json.loads(path.read_text()) if path.exists() else []


def init_db() -> None:
    Base.metadata.create_all(engine)
    session = SessionLocal()
    try:
        for row in load_json("sources.json"):
            session.merge(
                SourceRow(
                    id=row["id"],
                    name=row["name"],
                    modes=row["modes"],
                    kind=row["kind"],
                    website=row.get("website"),
                    city=row.get("city"),
                    notes=row.get("notes"),
                )
            )
        for row in load_json("trails.json"):
            session.merge(
                TrailRow(
                    id=row["id"],
                    trail=row["trail"],
                    local_name=row.get("localName"),
                    city=row["city"],
                    bases=row["bases"],
                    range_name=row.get("range"),
                    grade=row["grade"],
                    km=row["km"],
                    hours=row["hours"],
                    season=row["season"],
                    price_usd=row["priceUsd"],
                    includes=row["includes"],
                    note=row["note"],
                    groups=row.get("groups", []),
                )
            )
        for row in load_json("groups.json"):
            session.merge(
                GroupRow(
                    id=row["id"],
                    name=row["name"],
                    city=row["city"],
                    kind=row["kind"],
                    founded=row.get("founded"),
                    ranges=row["ranges"],
                    note=row["note"],
                    how=row["how"],
                    website=row.get("website"),
                )
            )
        for row in load_json("operators.json"):
            session.merge(
                OperatorRow(
                    id=row["id"],
                    name=row["name"],
                    modes=row["modes"],
                    city=row.get("city"),
                    website=row.get("website"),
                    booking_style=row["booking_style"],
                    notes=row.get("notes"),
                )
            )
        session.commit()
    finally:
        session.close()

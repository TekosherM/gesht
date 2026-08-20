# Gesht · گەشت

Travel metasearch for Iraq and the Kurdistan Region — flights, hotels, buses, cars, hiking trips, weekend villas, and medical travel, with a local brief.

**گەشت** means *travel* in Kurdish.

Search opens the same query on Wego, Kayak, Skyscanner, Almosafer, RideFly, Booking, and the local desks. We do not scrape those sites. Catalog and trail data live in `data/` and seed a FastAPI + Postgres (or local SQLite) backend. Point `DATABASE_URL` at Supabase when you have it.

## Backend and database

Two layers. They share the same Postgres shape.

| Layer | What | Default now | Production |
|---|---|---|---|
| **App (Vercel)** | TanStack Start, auth, UI | Embedded **PGLite** (Postgres in WASM) | Set `DATABASE_URL` → **Neon or Supabase Postgres** |
| **API** | **FastAPI** + SQLAlchemy (`backend/`) | **SQLite** file `backend/gesht.db` | Same `DATABASE_URL` → **Supabase/Neon Postgres** |

- Schema: `migrations/0001_auth.sql` (Better Auth), `0002_gesht.sql` (trails, groups, operators), `0003_providers.sql` (supply desks + leads).
- Seed: `data/trails.json`, `groups.json`, `operators.json`, `sources.json`. FastAPI `init_db()` upserts these on boot.
- Research dump (not yet the live seed): `data/iraq-kurdistan-hiking-catalog.json`.
- Search on Vercel still runs from TypeScript catalogs so the site works without the API. FastAPI on `:8788` is the richer path (`/api/gesht/search`, groups, outbounds).

```bash
# API locally
cd /workspace && backend/.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8788

# Point both layers at Supabase
export DATABASE_URL="postgresql://USER:PASS@HOST:5432/postgres"
```

No Supabase project is wired yet. The schema is Postgres-ready; empty `DATABASE_URL` keeps the preview self-contained.

## Develop

```bash
npm install
npm run dev
```

The FastAPI service starts with `startup.sh` (or `uvicorn backend.app.main:app`).

## Test

```bash
npm test              # unit + 1000 Gesht scenarios
npm run test:gesht    # scenarios + Playwright e2e against :8080
```

## Build

```bash
npm run build
npm run preview
```

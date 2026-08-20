# Gesht · گەشت

Travel metasearch for Iraq and the Kurdistan Region — flights, hotels, buses, cars, hiking trips, weekend villas, and medical travel, with a local brief.

**گەشت** means *travel* in Kurdish.

Search opens the same query on Wego, Kayak, Skyscanner, Almosafer, RideFly, Booking, and the local desks. We do not scrape those sites. Catalog and trail data live in `data/` and seed a FastAPI + Postgres (or local SQLite) backend. Point `DATABASE_URL` at Supabase when you have it.

## Backend and database

**Neon** is the Postgres. **GCP Cloud Run** is FastAPI. **Vercel** is the site. One `DATABASE_URL`. Not Firebase.

| Layer | Where | Env |
|---|---|---|
| Site + auth | Vercel | `DATABASE_URL` (Neon **pooled** URI) |
| API | Cloud Run (`gesht-api`) | same `DATABASE_URL`, `ALLOWED_ORIGINS` |
| Proxy | Vercel `/api/gesht/*` | `GESHT_API_URL` = Cloud Run URL |

Until those env vars exist, the site keeps working: PGLite for auth, TypeScript catalogs for search, SQLite for local FastAPI.

### 1. Neon (you do this once)

1. [console.neon.tech](https://console.neon.tech) → New project → name `gesht` → region close to `europe-west1` or `iad`.
2. Dashboard → Connection string → **Pooled** (contains `-pooler`). Copy it.
3. Vercel project **gesht** → Settings → Environment Variables:
   - `DATABASE_URL` = that pooled URI (Production + Preview)
4. Redeploy. `npm run build` already runs `scripts/migrate.mjs` against Neon.

### 2. Cloud Run (your existing GCP project)

```bash
export GCP_PROJECT=your-gcp-project-id
export DATABASE_URL='postgresql://USER:PASS@ep-….neon.tech/neondb?sslmode=require'
chmod +x infra/cloud-run.sh
./infra/cloud-run.sh
```

Then set Vercel `GESHT_API_URL` to the printed `https://gesht-api-….run.app` and redeploy.

Local API without Neon still uses `backend/gesht.db`.


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

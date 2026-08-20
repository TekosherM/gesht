# Gesht · گەشت

Travel metasearch for Iraq and the Kurdistan Region — flights, hotels, buses, cars, hiking trips, weekend villas, and medical travel, with a local brief.

**گەشت** means *travel* in Kurdish.

Search opens the same query on Wego, Kayak, Skyscanner, Almosafer, RideFly, Booking, and the local desks. We do not scrape those sites. Catalog and trail data live in `data/` and seed a FastAPI + Postgres (or local SQLite) backend. Point `DATABASE_URL` at Supabase when you have it.

## Develop

```bash
npm install
npm run dev
```

The FastAPI service starts with `startup.sh` (or `uvicorn backend.app.main:app`).

## Build

```bash
npm run build
npm run preview
```

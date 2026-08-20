-- Supply-side desks. Ranking is a monthly fee; searchers never pay.

create table if not exists gesht_providers (
  id text primary key,
  side text not null check (side in ('hike', 'stay', 'bus', 'flight', 'hotel', 'package', 'car', 'care')),
  name text not null,
  city text not null,
  kind text not null,
  whatsapp text,
  website text,
  instagram text,
  tier text not null default 'free' check (tier in ('free', 'featured', 'spotlight')),
  fee_iqd integer not null default 0,
  club boolean not null default false,
  claimed boolean not null default false,
  inventory text not null default '',
  note text not null default '',
  ranking_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists gesht_leads (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null references gesht_providers (id),
  mode text not null,
  dest text,
  origin text,
  depart text,
  guests integer,
  created_at timestamptz not null default now()
);

create index if not exists gesht_providers_side_city on gesht_providers (side, city, tier);

-- Gesht travel catalog. Same shape FastAPI uses.
-- When DATABASE_URL points at Supabase or Neon, this is the schema.

create table if not exists gesht_sources (
  id text primary key,
  name text not null,
  modes json not null default '[]',
  kind text not null,
  website text,
  city text,
  notes text
);

create table if not exists gesht_trails (
  id text primary key,
  trail text not null,
  local_name text,
  city text not null,
  bases json not null default '[]',
  range_name text,
  grade text not null,
  km double precision not null,
  hours double precision not null,
  season text not null,
  price_usd integer not null,
  includes json not null default '[]',
  note text not null,
  groups json not null default '[]'
);

create table if not exists gesht_groups (
  id text primary key,
  name text not null,
  city text not null,
  kind text not null,
  founded text,
  ranges json not null default '[]',
  note text not null,
  how text not null,
  website text
);

create table if not exists gesht_operators (
  id text primary key,
  name text not null,
  modes json not null default '[]',
  city text,
  website text,
  booking_style text not null,
  notes text
);
